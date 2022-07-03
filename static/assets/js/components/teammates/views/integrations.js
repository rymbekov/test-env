import React from 'react';
import ReactDOM from 'react-dom';
import { bindActionCreators } from 'redux';
import Skeleton from 'react-loading-skeleton';
import cn from 'classnames';
import events from '@picsio/events';
import * as utils from '../../../shared/utils';
import localization from '../../../shared/strings';
import Logger from '../../../services/Logger';
import NotificationSettings from '../../NotificationSettings';
import ErrorBoundary from '../../ErrorBoundary';
import * as TeamApi from '../../../api/team';

import { Checkbox, Input } from '../../../UIComponents';
import Icon from '../../Icon';
import WithSkeletonTheme from '../../WithSkeletonTheme';
import UpgradePlan from '../../UpgradePlan';

import store from '../../../store';
import { isHaveTeammatePermission } from '../../../store/helpers/user';
import { getUser } from '../../../store/actions/user';
import WebhooksTestDialog from './WebhooksTestDialog';
import WebhooksDialog from './WebhooksDialog';
import Toast from '../../Toast';
import Tooltip from '../../Tooltip';
import { showDialog } from '../../dialog';
import sdk from '../../../sdk';
import copyTextToClipboard from '../../../helpers/copyTextToClipboard';

const userActions = bindActionCreators({ getUser }, store.dispatch);

export default class Integrations extends React.Component {
  constructor(props) {
    super(props);

    const teamOwner = this.props.team;
    const userWebhooks = teamOwner.integrations.find((i) => i.type === 'webhook');
    const userSlackSettings = teamOwner.integrations.find((i) => i.type === 'slack');
    this.configPermissions = {
      isIntegrationsEditable: isHaveTeammatePermission('manageIntegrations'),
    };
    this.integrationsAllowed = this.props.subscriptionFeatures.planName !== 'Free';

    this.isUpdateUserRequired = false;

    this.state = {
      slackDescription: '',
      slackBtnShow: null,
      slackConnectionStatus: null,
      showDialog: false,
      showTestDialog: false,
      webhookForEdit: null,
      integrations: {
        webhooks: (userWebhooks && [...userWebhooks.webhooks]) || [],
        userSlackSettings: userSlackSettings || {},
      },
      isAdding: false,
      itemsInProgress: [],
      isApiKeyVisible: false,
    };
  }

  componentDidMount() {
    this.checkSlack();
  }

  componentWillUnmount() {
    if (this.isUpdateUserRequired) {
      // @TODO: User.store update integrations in store
      userActions.getUser(); // needs to reinit parent user model
    }
  }

  checkSlack = async () => {
    let res;
    try {
      res = await TeamApi.getSlackbotsStatus();
    } catch (err) {
      Logger.error(new Error('Can not check slackbot status'), { error: err }, [
        'CheckSlackBotStatusFailed',
        (err && err.message) || 'NoMessage',
      ]);
    }

    let slackDescription;
    let slackBtnShow;
    let slackConnectionStatus;

    if (res.status === 'connected') {
      slackDescription = `${localization.ACCOUNT.noteSlackConnectedStart}${res.team_name}${localization.ACCOUNT.noteSlackConnectedEnd}`;
      slackConnectionStatus = true;
    } else {
      slackDescription = localization.ACCOUNT.noteSlackNotConnected;
      slackConnectionStatus = false;
    }

    if (!this.configPermissions.isIntegrationsEditable) {
      if (res.status !== 'connected') {
        slackDescription += localization.ACCOUNT.noteAskOwner;
      }
      slackBtnShow = false;
    } else if (!this.integrationsAllowed) {
      slackBtnShow = false;
    } else {
      slackBtnShow = true;
    }

    this.setState({ slackDescription, slackBtnShow, slackConnectionStatus });
  };

  updateSlackSettings = async (settings) => {
    try {
      await sdk.users.updateSlackSettings(settings);
    } catch (err) {
      showDialog({
        title: localization.SERVER_ERROR.title,
        text: localization.NOTIFICATION_SETTINGS.errorSavingSettings,
        textBtnCancel: null,
      });
      Logger.error(new Error('Can not update slack settings'), { error: err }, [
        'CantUpdateSlackSettingsDialog',
        (err && err.message) || 'NoMessage',
      ]);
    }
    this.isUpdateUserRequired = true;
  };

  openDialog = (webhook) => {
    if (webhook) {
      this.setState({ showDialog: true, webhookForEdit: webhook });
    } else {
      this.setState({ showDialog: true });
    }
  };

  closeDialog = () => {
    const errors = { ...this.state.errors };
    delete errors.urlError;
    this.setState({
      errors,
    });
    this.setState({ showDialog: false, webhookForEdit: null, errors });
  };

  showTestDialog = (webhook) => {
    this.setState({ showTestDialog: true, webhookForEdit: webhook });
  };

  closeTestDialog = () => {
    this.setState({ showTestDialog: false, webhookForEdit: null });
  };

  validateUrl = (value) => {
    const { webhookForEdit, integrations } = this.state;
    const theSameUrl = webhookForEdit && webhookForEdit.url === value;
    let errorMessage = '';
    const isValid = utils.isURL(value);
    const isExists = !theSameUrl ? integrations.webhooks.find((item) => item.url === value) : null;

    if (!isValid || isExists) {
      if (isExists) {
        errorMessage = localization.TEAMMATES.errorUrlExists;
      } else {
        errorMessage = localization.TEAMMATES.errorUrlNotValid;
      }
      this.setState({
        errors: { ...this.state.errors, urlError: errorMessage },
      });
    } else {
      const errors = { ...this.state.errors };
      delete errors.urlError;
      this.setState({
        errors,
      });
    }
  };

  toggleWebhookStatus = (webhook, value) => {
    const webhookForEdit = { ...webhook };
    webhookForEdit.disabled = !value;
    this.editWebhook(webhookForEdit);
  };

  testWebhook = async (data) => {
    this.closeTestDialog();

    this.setState({ itemsInProgress: this.addItemToProgress(data.url) });
    try {
      await TeamApi.sendTestWebhook({
        url: data.url,
        type: data.type,
      });

      this.setState({ itemsInProgress: this.removeItemFromProgress(data.url) });
      Toast(localization.TEAMMATES.testRequestSent);
    } catch (err) {
      showDialog({
        title: localization.SERVER_ERROR.title,
        text: localization.TEAMMATES.testRequestNotSent,
        textBtnCancel: null,
      });
      Logger.error(new Error('Can not test webhook'), { error: err }, [
        'CantTestWebhookDialog',
        (err && err.message) || 'NoMessage',
      ]);
      this.setState({ itemsInProgress: this.removeItemFromProgress(data.url) });
    }
  };

  addItemToProgress = (url) => {
    let items = this.state.itemsInProgress;
    items = [...items, url];
    return items;
  };

  removeItemFromProgress = (url) => {
    const items = this.state.itemsInProgress;
    const filteredItems = items.filter((item) => item !== url);
    return filteredItems;
  };

  removeWebhook = (webhook) => {
    const { url } = webhook;
    Logger.log('UI', 'RemoveWebhookDialog');
    showDialog({
      title: localization.TEAMMATES.textTitleRemoveWebhook,
      text: localization.TEAMMATES.textWebhookWillRemoved,
      textBtnOk: localization.DIALOGS.btnYes,
      textBtnCancel: localization.DIALOGS.btnNo,
      onOk: async () => {
        this.setState({ itemsInProgress: this.addItemToProgress(url) });
        try {
          await TeamApi.deleteWebhook({ url });
        } catch (err) {
          showDialog({
            title: localization.SERVER_ERROR.title,
            text: localization.TEAMMATES.textCantRemoveWebhook,
            textBtnCancel: null,
          });
          Logger.error(new Error('Can not remove webhook'), { error: err }, [
            'CantRemoveWebhookDialog',
            (err && err.message) || 'NoMessage',
          ]);
          this.setState({ itemsInProgress: this.removeItemFromProgress(url) });
        }

        const integrations = { ...this.state.integrations };
        integrations.webhooks = integrations.webhooks.filter((item) => {
          if (item.url !== url) return true;
        });
        this.setState({
          integrations,
          itemsInProgress: this.removeItemFromProgress(url),
        });
        this.isUpdateUserRequired = true;
      },
    });
  };

  editWebhook = async (webhook) => {
    const { webhookForEdit } = this.state;
    const urlInProgress = webhookForEdit ? webhookForEdit.url : webhook.url;
    this.setState({ itemsInProgress: this.addItemToProgress(urlInProgress) });

    const data = {
      url: urlInProgress,
      disabled: webhook.disabled,
    };

    if (urlInProgress !== webhook.url) {
      data.newUrl = webhook.url;
    }

    if (webhook.types) {
      data.types = webhook.types;
    }

    if (this.state.showDialog) {
      this.closeDialog();
    }

    try {
      await TeamApi.updateWebhook(data);
    } catch (err) {
      showDialog({
        title: localization.SERVER_ERROR.title,
        text: localization.TEAMMATES.textCantUpdateWebhook,
        textBtnCancel: null,
      });
      Logger.error(new Error('Can not edit webhook'), { error: err }, [
        'EditWebhookFailed',
        (err && err.message) || 'NoMessage',
      ]);
      this.setState({
        itemsInProgress: this.removeItemFromProgress(urlInProgress),
      });
    }

    const integrations = { ...this.state.integrations };
    const { webhooks } = integrations;
    const webhookForEditIndex = webhooks.findIndex((item) => item.url == urlInProgress);
    webhooks[webhookForEditIndex] = webhook;
    this.setState({
      integrations,
      itemsInProgress: this.removeItemFromProgress(urlInProgress),
    });
    this.isUpdateUserRequired = true;
  };

  addWebhook = async (newWebhook) => {
    this.closeDialog();
    this.setState({ isAdding: true });

    try {
      await TeamApi.addWebhook(newWebhook);
    } catch (err) {
      showDialog({
        title: localization.SERVER_ERROR.title,
        text: localization.TEAMMATES.textCantCreateWebhook,
        textBtnCancel: null,
      });
      Logger.error(new Error('Can not add webhook'), { error: err }, [
        'AddWebhookFailed',
        (err && err.message) || 'NoMessage',
      ]);
      this.setState({ isAdding: false });
    }

    Logger.log('User', 'SettingsMyTeamIntegrationsWebhookDialogAdded');
    const integrations = { ...this.state.integrations };
    let { webhooks } = integrations;
    webhooks = [...webhooks, newWebhook];
    integrations.webhooks = webhooks;
    this.setState({ integrations, isAdding: false });
    this.isUpdateUserRequired = true;
  };

  copyToClipboard = (e) => {
    Logger.log('User', 'ApiKeyCopyToClipboard');
    const apiKey = this.configPermissions.isIntegrationsEditable ? this.props.apiKey : '';
    const toastText = localization.DETAILS.apiKeyCopied;
    copyTextToClipboard(apiKey, toastText);
  };

  toggleApiKey = () => {
    Logger.log('User', 'ApiKeyShow');
    this.setState({ isApiKeyVisible: !this.state.isApiKeyVisible });
  };

  disconnectSlack = async () => {
    try {
      await TeamApi.disconnectSlack();
    } catch (err) {
      Logger.log(new Error('Can not disconnect slack'), { error: err }, [
        'SlackDisconnectFailed',
        (err && err.message) || 'NoMessage',
      ]);
    }
    this.checkSlack();
  }

  render() {
    const { state } = this;
    const {
      integrations,
      errors,
      webhookForEdit,
      isAdding,
      itemsInProgress,
      slackDescription,
      slackBtnShow,
      slackConnectionStatus,
    } = this.state;
    const { configPermissions, integrationsAllowed } = this;
    const { webhooks } = integrations;
    const componentWebhooks = 'webhooks';
    const componentZapier = 'zapier';
    const urlWebhooks = localization.HELP_CENTER[componentWebhooks].url;
    const urlZapier = localization.HELP_CENTER[componentZapier].url;
    const { apiKey } = this.props;
    const slackSettings = state.integrations.userSlackSettings;
    const webhookTypes = events.getWebhookTypes();

    return (
      <div className="integrationsContent">
        <div className="pageContainer">
          {/* Slack */}
          <div className="pageItem">
            <div className="pageItemTitle">
              Slack
              {!integrationsAllowed && <UpgradePlan />}
            </div>
            <WithSkeletonTheme>
              <Choose>
                <When condition={slackDescription === ''}>
                  <p className="slackDescription">
                    <Skeleton width={150} height={17} />
                  </p>
                </When>
                <Otherwise>
                  <p
                    className="slackDescription"
                    dangerouslySetInnerHTML={{ __html: utils.sanitizeXSS(slackDescription) }}
                  />
                </Otherwise>
              </Choose>
              <div className="connectSlackButton">
                <If condition={slackBtnShow === null}>
                  <Skeleton width={139} height={40} />
                </If>
                <If condition={slackBtnShow && !slackConnectionStatus}>
                  <a
                    className="pageTabsContentNotifications__slackBtn"
                    href="/auth/slack"
                    target="_blank"
                    onClick={() => Logger.log('User', 'SettingsMyTeamIntegrationsSlackClicked')}
                  >
                    <img
                      alt="Add to Slack"
                      height="40"
                      width="139"
                      src="https://platform.slack-edge.com/img/add_to_slack.png"
                      srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
                    />
                  </a>
                </If>
                <If condition={slackBtnShow && slackConnectionStatus}>
                  <div onClick={this.disconnectSlack}>
                    <img
                      className="pageTabsContentNotifications__slackBtn"
                      alt="Disconnect Slack"
                      height="40"
                      width="139"
                      src="https://assets.pics.io/img/disconnect_slack.png"
                    />
                  </div>
                </If>
              </div>
            </WithSkeletonTheme>
            <ErrorBoundary>
              <NotificationSettings
                events={events.getSlackTypes()}
                selectedEvents={(slackSettings && slackSettings.eventTypes) || []}
                isDisable={(slackSettings && !slackSettings.active) || false}
                updateHandler={this.updateSlackSettings}
                readOnly={!configPermissions.isIntegrationsEditable || !integrationsAllowed}
                isLoading={slackDescription === ''}
              />
            </ErrorBoundary>
          </div>

          {/* Zapier */}
          <div className="pageItem">
            <div className="pageItemTitle">
              API Key <sup className="badge">beta</sup>
              {!integrationsAllowed && <UpgradePlan />}
            </div>
            <div className="UIInput__label">{localization.TEAMMATES.apiKey}</div>
            <div className="inputCopyWrapper mediumInput">
              <div className="inputCopyHolder fieldCopyToUrl">
                <Input
                  value={this.state.isApiKeyVisible ? apiKey : '***************'}
                  disabled={!configPermissions.isIntegrationsEditable || !integrationsAllowed}
                />
                {configPermissions.isIntegrationsEditable && integrationsAllowed && (
                  <div className="showInputText" onClick={this.toggleApiKey}>
                    <Icon name="clearEye" />
                  </div>
                )}
              </div>
              <div
                className={cn('picsioDefBtn picsioLinkForShare fieldCopyToBtn', {
                  disable: !configPermissions.isIntegrationsEditable || !integrationsAllowed,
                })}
                onClick={this.copyToClipboard}
              >
                <Icon name="copyToClipboard" />
                {/* {localization.TEAMMATES.copy} */}
              </div>
            </div>
            {!configPermissions.isIntegrationsEditable && (
              <p>{localization.TEAMMATES.descrManageApiKey}</p>
            )}
            <div className="pageItemBlockHelp">
              <span
                className="helpLink"
                onClick={() => {
                  window.open(`https://help.pics.io/${urlZapier}`, '_blank');
                  Logger.log('User', 'Help', componentZapier);
                }}
              >
                <Icon name="question" />
                {localization.TEAMMATES.learnMoreAboutZapier}
              </span>
            </div>
          </div>

          {/* Webhooks */}
          <div className="pageItem">
            {this.state.showDialog
              && ReactDOM.createPortal(
                <WebhooksDialog
                  title={
                    webhookForEdit
                      ? localization.TEAMMATES.editWebhook
                      : localization.TEAMMATES.addWebhook
                  }
                  onClose={this.closeDialog}
                  onOk={webhookForEdit ? this.editWebhook : this.addWebhook}
                  validateUrl={this.validateUrl}
                  textBtnOk={
                    webhookForEdit ? localization.TEAMMATES.btnSave : localization.TEAMMATES.btnAdd
                  }
                  data={webhookForEdit}
                  errors={errors}
                  webhookTypes={webhookTypes}
                />,
                document.querySelector('.wrapperWebhooksDialog'),
              )}
            {this.state.showTestDialog
              && ReactDOM.createPortal(
                <WebhooksTestDialog
                  title={localization.TEAMMATES.testWebhook}
                  onClose={this.closeTestDialog}
                  onOk={this.testWebhook}
                  textBtnOk={localization.TEAMMATES.btnSend}
                  url={webhookForEdit.url}
                  webhookTypes={webhookTypes}
                />,
                document.querySelector('.wrapperWebhooksDialog'),
              )}
            <div className="pageItemTitle">
              {localization.TEAMMATES.webhooks} <sup className="badge">beta</sup>
              {!integrationsAllowed && <UpgradePlan />}
            </div>
            <p>{localization.TEAMMATES.introWebhooksText}</p>
            <div className="webhooksList mediumInput">
              {webhooks.map((webhook, index) => (
                <div
                  key={index}
                  className={cn('webhookItem', {
                    skeletonPending: itemsInProgress.includes(webhook.url),
                  })}
                  onDoubleClick={() => configPermissions.isIntegrationsEditable
                    && integrationsAllowed
                    && this.openDialog(webhook)}
                >
                  <Tooltip content={webhook.disabled ? 'Enable' : 'Disable'} placement="top">
                    <div className="webhookItemStatus">
                      <Checkbox
                        disabled={!configPermissions.isIntegrationsEditable || !integrationsAllowed}
                        onChange={(value) => this.toggleWebhookStatus(webhook, value)}
                        value={!webhook.disabled}
                      />
                    </div>
                  </Tooltip>
                  <div className="webhookItemUrl">{webhook.url}</div>
                  {configPermissions.isIntegrationsEditable && integrationsAllowed && (
                    <div className="webhookItemButtons">
                      <Tooltip content={localization.TEAMMATES.tooltipSendTest} placement="top">
                        <div className="smallBtn" onClick={() => this.showTestDialog(webhook)}>
                          <Icon name="arrowRight" />
                        </div>
                      </Tooltip>
                      <Tooltip content={localization.TEAMMATES.tooltipEdit} placement="top">
                        <div className="smallBtn" onClick={() => this.openDialog(webhook)}>
                          <Icon name="pen" />
                        </div>
                      </Tooltip>
                      <Tooltip content={localization.TEAMMATES.tooltipRemove} placement="top">
                        <div className="smallBtn" onClick={() => this.removeWebhook(webhook)}>
                          <Icon name="trash" />
                        </div>
                      </Tooltip>
                    </div>
                  )}
                </div>
              ))}
              {isAdding && (
                <div
                  className={cn('webhookItem webhookItemPlaceholder', {
                    skeletonPending: isAdding,
                  })}
                />
              )}
            </div>
            {!configPermissions.isIntegrationsEditable && (
              <p>{localization.TEAMMATES.descrManageWebhooks}</p>
            )}
            {configPermissions.isIntegrationsEditable && integrationsAllowed && (
              <div className="pageItemButtons">
                <span className="picsioDefBtn" onClick={() => this.openDialog()}>
                  {localization.TEAMMATES.addWebhook}
                </span>
              </div>
            )}
            <div className="pageItemBlockHelp">
              <span
                className="helpLink"
                onClick={() => {
                  window.open(`https://help.pics.io/${urlWebhooks}`, '_blank');
                  Logger.log('User', 'Help', componentWebhooks);
                }}
              >
                <Icon name="question" />
                {localization.TEAMMATES.learnMoreAboutWebhooks}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
