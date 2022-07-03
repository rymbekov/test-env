import React from 'react';
import events from '@picsio/events';
import * as utils from '../../../shared/utils';
import Logger from '../../../services/Logger';
import localization from '../../../shared/strings';
import TagList from '../../TagList';
import NotificationSettings from '../../NotificationSettings';
import ErrorBoundary from '../../ErrorBoundary'; // eslint-disable-line
import Icon from '../../Icon';
import CollectionsList from '../../CollectionsList';
import Store from '../../../store';
import * as UtilsCollections from '../../../store/utils/collections';
import ua from '../../../ua';
import { showDialog } from '../../dialog';
import sdk from '../../../sdk';

const defaultSettings = {
  active: true,
  eventTypes: [],
};
const defaultTransports = {
  email: {
    active: true,
    eventTypes: [],
  },
  push: {
    active: true,
    eventTypes: [],
  },
  notificationCenter: {
    active: true,
    eventTypes: [],
  },
};

export default class Notifications extends React.Component {
  isUpdateUserRequired = false;

  rootId = UtilsCollections.getRootId();

  rootCollectionName = Store.getState().collections.collections.my.name;

  state = {
    isLoading: false,
    integrations: [],
    isSupportedNotificationsApi: null,
    enabledPushNotifications: null,
    blockedPushNotifications: null,
    selectedCollections: [],
    collectionsSettings: null,
    activeCollectionId: this.rootId,
    activeCollectionName: this.rootCollectionName || '',
    errorGetIntegrationsSettings: false,
  };

  static getDerivedStateFromProps(props, state) {
    if (props.user.integrations !== state.integrations) {
      return {
        integrations: props.user.integrations,
      };
    }

    return null;
  }

  async componentDidMount() {
    const { integrations } = this.props.user;
    let isSupportedNotificationsApi = !!('Notification' in window);
    let enabledPushNotifications =
      isSupportedNotificationsApi && Notification.permission
        ? Notification.permission === 'granted'
        : null;
    let blockedPushNotifications =
      isSupportedNotificationsApi && Notification.permission
        ? Notification.permission === 'denied'
        : null;

    if (ua.isMobileApp()) {
      const { isPushNotificationsAvailable, isPushNotificationsGranted } = this.props.user;

      isSupportedNotificationsApi = isPushNotificationsAvailable;
      enabledPushNotifications = isPushNotificationsGranted;
      blockedPushNotifications = !isPushNotificationsGranted;
    }

    this.setState({
      isLoading: true,
      isSupportedNotificationsApi,
      enabledPushNotifications,
      blockedPushNotifications,
      integrations: integrations || [],
    });

    const { selectedCollections, collectionsSettings } = await this.getSelectedCollections();

    this.setState({
      selectedCollections,
      collectionsSettings,
      isLoading: false,
    });
  }

  componentWillUnmount() {
    // @TODO: remove it and do right integrations saving to Store
    if (this.isUpdateUserRequired) {
      this.props.userActions.getUser(); // needs to reinit parent user model
    }
  }

  getSelectedCollections = async () => {
    let selectedCollections = [
      {
        _id: this.rootId,
        path: '/root',
      },
    ];

    const integrations = (await this.getIntegrationsSettings()) || this.props.user.integrations;

    const integrationsSettings =
      integrations && integrations.find((item) => item.type === 'collection');
    const collectionsSettings = {};
    if (
      integrationsSettings &&
      integrationsSettings.collections &&
      integrationsSettings.collections.length
    ) {
      integrationsSettings.collections.forEach((collection) => {
        if (!collection.collectionId) {
          collectionsSettings[this.rootId] = { ...collection.transports };
        }
        if (collection.collectionId) {
          const newCollection = {
            _id: collection.collectionId,
            path: collection.path,
          };
          selectedCollections = [...selectedCollections, newCollection];
          collectionsSettings[collection.collectionId] = { ...collection.transports };
        }
      });
    }
    return { selectedCollections, collectionsSettings };
  };

  getIntegrationsSettings = async () => {
    try {
      const { data: settings } = await sdk.users.fetchIntegrationsSettings();
      return settings;
    } catch (err) {
      Logger.error(new Error('Can not get full integrations settings'), { error: err }, [
        'GetIntegrationsSettingsFailed',
        (err && err.message) || 'NoMessage',
      ]);
      this.setState({ errorGetIntegrationsSettings: true });
      return null;
    }
  };

  onClickCollection = (collection) => {
    Logger.log('User', 'SettingsMyAccountNotificationsCollectionClick', {
      collectionId: collection._id,
    });
    this.setState({
      activeCollectionId: collection._id,
      activeCollectionName: collection.name,
    });
  };

  handleToggleCollection = (collection) => {
    const { selectedCollections } = this.state;
    const isSelected = selectedCollections.length
      ? selectedCollections.find((selectedCollection) => selectedCollection._id === collection._id)
      : false;

    isSelected ? this.handleDetachCollection(collection) : this.handleAttachCollection(collection);
  };

  handleAttachCollection = (collection) => {
    Logger.log('User', 'SettingsMyAccountNotificationsAttachCollection', {
      collectionId: collection._id,
    });
    let { selectedCollections, collectionsSettings } = this.state;
    selectedCollections = [...selectedCollections, collection];
    collectionsSettings[collection._id] = { ...defaultTransports };
    this.setState({ selectedCollections, collectionsSettings });
    this.updateEmailSettings({
      collectionId: collection._id,
      active: true,
      types: [],
    });
  };

  handleDetachCollection = async (collection, event) => {
    Logger.log('User', 'SettingsMyAccountNotificationsDetachCollection', {
      collectionId: collection._id,
    });
    if (event) event.stopPropagation();
    const {
      selectedCollections,
      activeCollectionId,
      activeCollectionName,
      collectionsSettings,
    } = this.state;
    const newCollectionsSettings = { ...this.state.collectionsSettings };
    const newSelectedCollections = selectedCollections.filter(
      (selectedCollection) => selectedCollection._id !== collection._id
    );
    delete newCollectionsSettings[collection._id];
    try {
      if (activeCollectionId === collection._id) {
        this.setState({
          selectedCollections: newSelectedCollections,
          activeCollectionId: this.rootId,
          activeCollectionName: this.rootCollectionName,
          collectionsSettings: newCollectionsSettings,
        });
      } else {
        this.setState({
          selectedCollections: newSelectedCollections,
        });
      }
      await sdk.users.removeIntegrationsSettingsCollection(collection._id);
    } catch (err) {
      Logger.error(new Error('Can not remove collection'), { error: err }, [
        'RemoveCollectionSettingsFailed',
        (err && err.message) || 'NoMessage',
      ]);
      this.setState({
        selectedCollections,
        collectionsSettings,
        activeCollectionId,
        activeCollectionName,
      });
    }
  };

  changeCollectionSettings = (transportType, settings) => {
    const collectionsSettings = { ...this.state.collectionsSettings };
    const collection = { ...collectionsSettings[settings.collectionId] };
    collection[transportType] = {
      eventTypes: [...settings.types],
      active: !settings.disabled,
      allowMentions: settings.allowMentions,
    };
    collectionsSettings[settings.collectionId] = collection;
    this.setState({ collectionsSettings });
  };

  // updateGlobalIntegrations = (type, settings) => {
  // 	// @TODO: needs to correct update collection integrations in User store
  // 	if (settings.collectionId) return;
  // 	const integrations = this.props.user.integrations.map(integration => {
  // 		if (integration.type === type) {
  // 			let updatedIntegration = { ...defaultSettings };
  // 			updatedIntegration.type = type;
  // 			updatedIntegration.active = !settings.disabled;
  // 			updatedIntegration.eventTypes = settings.types;
  // 			return updatedIntegration;
  // 		}
  // 		return integration;
  // 	});
  // 	// this.setState({ integrations });
  // 	this.props.userActions.updateUser({ integrations });
  // };

  updateEmailSettings = async (settings) => {
    const eventName = settings.collectionId ? 'Library' : 'Global';
    Logger.log('User', `SettingsMyAccountNotificationsUpdate${eventName}EmailSettings`);
    try {
      settings.collectionId && this.changeCollectionSettings('email', { ...settings });
      if (settings.collectionId && settings.collectionId === this.rootId) {
        settings.collectionId = 'root';
      }
      await sdk.users.updateEmailSettings(settings);
    } catch (err) {
      showDialog({
        title: localization.SERVER_ERROR.title,
        text: localization.NOTIFICATION_SETTINGS.errorSavingSettings,
        textBtnCancel: null,
      });
      Logger.error(new Error('Can not update email settings'), { error: err }, [
        'UpdateEmailSettingsFailed',
        (err && err.message) || 'NoMessage',
      ]);
    }
    this.isUpdateUserRequired = true;
  };

  updateNotificationSettings = async (settings) => {
    const eventName = settings.collectionId ? 'Library' : 'Global';
    Logger.log('User', `SettingsMyAccountNotificationsUpdate${eventName}NotificationSettings`);
    try {
      settings.collectionId && this.changeCollectionSettings('notificationCenter', { ...settings });
      if (settings.collectionId && settings.collectionId === this.rootId) {
        settings.collectionId = 'root';
      }
      await sdk.users.updateNotificationSettings(settings);
    } catch (err) {
      showDialog({
        title: localization.SERVER_ERROR.title,
        text: localization.NOTIFICATION_SETTINGS.errorSavingSettings,
        textBtnCancel: null,
      });
      Logger.error(new Error('Can not update notifications settings'), { error: err }, [
        'UpdateNotificationSettingsFailed',
        (err && err.message) || 'NoMessage',
      ]);
    }
    this.isUpdateUserRequired = true;
  };

  updateSocketSettings = async (settings) => {
    try {
      settings.collectionId && this.changeCollectionSettings('push', { ...settings });
      if (settings.collectionId && settings.collectionId === this.rootId) {
        settings.collectionId = 'root';
      }
      await sdk.users.updateSocketSettings(settings);
    } catch (err) {
      showDialog({
        title: localization.SERVER_ERROR.title,
        text: localization.NOTIFICATION_SETTINGS.errorSavingSettings,
        textBtnCancel: null,
      });
      Logger.error(new Error('Can not update socket settings'), { error: err }, [
        'UpdateSocketSettingsFailed',
        (err && err.message) || 'NoMessage',
      ]);
    }
    this.isUpdateUserRequired = true;
  };

  handleOnClickHowToLink = () =>
    window.open(
      'https://pushassist.com/knowledgebase/how-to-enable-or-disable-push-notifications-on-chrome-firefox-safari-b/',
      '_blank'
    );

  requestPermission = () =>
    new Promise((resolve, reject) => {
      const permissionResult = Notification.requestPermission((result) => resolve(result));
      if (permissionResult) {
        permissionResult.then(resolve, reject);
      }
    })
      .then((permissionResult) => {
        if (permissionResult === 'granted') {
          this.setState({ enabledPushNotifications: true, blockedPushNotifications: false });
        } else if (permissionResult === 'denied') {
          this.setState({ blockedPushNotifications: true, enabledPushNotifications: false });
        } else {
        }
      })
      .catch((err) => {
        throw err;
      });

  getActiveCollectionSettings = (type) => {
    const { activeCollectionId, collectionsSettings } = this.state;
    let collectionSettings = { ...defaultSettings };
    if (collectionsSettings && collectionsSettings[activeCollectionId]) {
      collectionSettings = collectionsSettings[activeCollectionId][type];
    }

    return collectionSettings;
  };

  render() {
    const { state, props } = this;
    const notificationsEmails = props.user.notificationsEmail || [];

    const emailSettings = state.integrations.find((item) => item.type === 'email');
    const notificationCenterSettings = state.integrations.find(
      (item) => item.type === 'notificationCenter'
    );

    const collectionEmailSettings = this.getActiveCollectionSettings('email');
    const collectionNotificationCenterSettings = this.getActiveCollectionSettings(
      'notificationCenter'
    );

    const extraDescription = (
      <Choose>
        <When condition={state.isSupportedNotificationsApi === false}>
          <>
            <div className="warning">
              <div className="warningIcon">
                <Icon name="warning" />
              </div>
              <div className="warningText">
                {
                  localization.NOTIFICATION_SETTINGS.socketNotifications
                    .descriptionNotSupportedNotificationsApi
                }
              </div>
            </div>
            <div className="warningHelp" onClick={this.handleOnClickHowToLink}>
              <div className="warningHelpIcon">
                <Icon name="question" />
              </div>
              <div className="warningHelpText">
                {
                  localization.NOTIFICATION_SETTINGS.socketNotifications
                    .howToEnableOrDisablePushNotifications
                }
              </div>
            </div>
          </>
        </When>
        <When condition={!state.enabledPushNotifications && !state.blockedPushNotifications}>
          <>
            {localization.NOTIFICATION_SETTINGS.socketNotifications.descriptionPushNotification1}
            <span
              className="picsioDefBtn picsioLink"
              onClick={() => {
                if (Notification.permission === 'default') {
                  this.requestPermission();
                }
              }}
            >
              {localization.NOTIFICATION_SETTINGS.socketNotifications.textClickButton}
            </span>
            {localization.NOTIFICATION_SETTINGS.socketNotifications.descriptionPushNotification2}
          </>
        </When>
        <When condition={state.enabledPushNotifications}>
          <>
            {
              localization.NOTIFICATION_SETTINGS.socketNotifications
                .descriptionPushNotificationsEnabled
            }
            <div className="warningHelp" onClick={this.handleOnClickHowToLink}>
              <div className="warningHelpIcon">
                <Icon name="question" />
              </div>
              <div className="warningHelpText">
                {
                  localization.NOTIFICATION_SETTINGS.socketNotifications
                    .howToEnableOrDisablePushNotifications
                }
              </div>
            </div>
          </>
        </When>
        <When condition={state.blockedPushNotifications}>
          <>
            <div className="warning">
              <div className="warningIcon">
                <Icon name="warning" />
              </div>
              <div className="warningText">
                {
                  localization.NOTIFICATION_SETTINGS.socketNotifications
                    .descriptionPushNotificationsBlocked
                }
              </div>
            </div>
            <div className="warningHelp" onClick={this.handleOnClickHowToLink}>
              <div className="warningHelpIcon">
                <Icon name="question" />
              </div>
              <div className="warningHelpText">
                {
                  localization.NOTIFICATION_SETTINGS.socketNotifications
                    .howToEnableOrDisablePushNotifications
                }
              </div>
            </div>
          </>
        </When>
        <Otherwise>{null}</Otherwise>
      </Choose>
    );

    return (
      <div className="pageTabsContentNotifications">
        <div className="pageContainer pageTabsContentNotifications__checkbox">
          <div className="notificationSettingsTitle">
            {localization.NOTIFICATION_SETTINGS.emailNotifications.title}
          </div>
          <TagList
            className="mediumInput"
            items={notificationsEmails.length > 0 ? notificationsEmails : [props.userData.email]}
            placeholder={localization.ACCOUNT.placeholderEnterEmail}
            onSubmit={props.handlers.updateUserEmails}
            onBlur={props.handlers.updateUserEmails}
            label="Email"
          />
          <ErrorBoundary>
            <NotificationSettings
              events={events
                .getGlobalEmailTypes()
                .filter(
                  (event) =>
                    !events.getEventConfig(event).email ||
                    (events.getEventConfig(event).email &&
                      !events.getEventConfig(event).email.forceSending)
                )}
              selectedEvents={(emailSettings && emailSettings.eventTypes) || []}
              isDisable={(emailSettings && !emailSettings.active) || false}
              updateHandler={this.updateEmailSettings}
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <NotificationSettings
              title={localization.NOTIFICATION_SETTINGS.notificationCenter.title}
              extraDescription={extraDescription}
              events={events.getGlobalNotificationCenterTypes()}
              selectedEvents={
                (notificationCenterSettings && notificationCenterSettings.eventTypes) || []
              }
              isDisable={
                (notificationCenterSettings && !notificationCenterSettings.active) || false
              }
              updateHandler={this.updateNotificationSettings}
            />
          </ErrorBoundary>

          <>
            <div className="notificationSettingsTitle">
              {localization.NOTIFICATION_SETTINGS.titleNotificationsByCollection(
                state.activeCollectionName
              )}
            </div>
            <Choose>
              <When condition={state.errorGetIntegrationsSettings}>
                <div className="notificationSettingsDescription">
                  <div className="warning">
                    <div className="warningIcon">
                      <Icon name="warning" />
                    </div>
                    <div
                      className="warningText"
                      dangerouslySetInnerHTML={{
                        __html: utils.sanitizeXSS(
                          localization.NOTIFICATION_SETTINGS.errorGetSettingsCollections
                        ),
                      }}
                    />
                  </div>
                </div>
              </When>
              <Otherwise>
                <CollectionsList
                  useStore
                  rootRemovable={false}
                  selectedCollections={state.selectedCollections}
                  activeCollectionId={state.activeCollectionId}
                  handleToggleCollection={this.handleToggleCollection}
                  handleDetachCollection={this.handleDetachCollection}
                  handleClickCollection={this.onClickCollection}
                  isLoading={state.isLoading}
                />
              </Otherwise>
            </Choose>

            <ErrorBoundary>
              <NotificationSettings
                title={localization.NOTIFICATION_SETTINGS.emailNotifications.collectionTitle(
                  state.activeCollectionName
                )}
                events={events
                  .getCollectionEmailTypes()
                  .filter(
                    (event) =>
                      !events.getEventConfig(event).email ||
                      (events.getEventConfig(event).email &&
                        !events.getEventConfig(event).email.forceSending)
                  )}
                selectedEvents={
                  (collectionEmailSettings && collectionEmailSettings.eventTypes) || []
                }
                isDisable={(collectionEmailSettings && !collectionEmailSettings.active) || false}
                updateHandler={this.updateEmailSettings}
                collectionId={state.activeCollectionId}
                isLoading={state.isLoading}
                mentionsCheckbox
                allowMentions={collectionEmailSettings?.allowMentions}
              />
            </ErrorBoundary>
            <ErrorBoundary>
              <NotificationSettings
                title={localization.NOTIFICATION_SETTINGS.notificationCenter.collectionTitle(
                  state.activeCollectionName
                )}
                extraDescription={extraDescription}
                events={events.getCollectionNotificationCenterTypes()}
                selectedEvents={
                  (collectionNotificationCenterSettings &&
                    collectionNotificationCenterSettings.eventTypes) ||
                  []
                }
                isDisable={
                  (collectionNotificationCenterSettings &&
                    !collectionNotificationCenterSettings.active) ||
                  false
                }
                updateHandler={this.updateNotificationSettings}
                collectionId={state.activeCollectionId}
                isLoading={state.isLoading}
                mentionsCheckbox
                allowMentions={collectionNotificationCenterSettings?.allowMentions}
              />
            </ErrorBoundary>
          </>
        </div>
      </div>
    );
  }
}
