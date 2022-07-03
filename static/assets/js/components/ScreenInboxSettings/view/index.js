import React from 'react';
import { Hidden } from '@picsio/ui';

import { Provider, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import store from '../../../store';
import * as actionsInboxes from '../../../store/inboxes/actions';
import Main from './mainTab';
import Security from './securityTab';
import ErrorBoundary from '../../ErrorBoundary';
import ToolbarScreenTop from '../../toolbars/ToolbarScreenTop';
import ScreenTab from '../../ScreenTab';
import MenuItemButton from '../../Websites/MenuItemButton';

import localization from '../../../shared/strings';
import Logger from '../../../services/Logger';

/** Store */
import { back } from '../../../helpers/history';

const PASSWORD_STARS = '*✝*✝*✝*✝*'; // this is hard code , made with love✝ :-*

const isValidAlias = (value) => {
  const valid = new RegExp('^([0-9A-Za-z-\\.@:%_+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?').test(value);
  return valid ? true : localization.INBOXSETTINGS.textUrlNotValid;
};

const hasntReservedWords = (value) => {
  const list = ['login', 'preview', 'collection'];
  const err = localization.INBOXSETTINGS.textWordsCantBeUsed(list.join(', '));
  return list.some((n) => value.includes(`/${n}`)) ? err : true;
};

class InboxSettings extends React.Component {
  state = {
    inbox: null,
    loading: false,
    isNew: true,
    originalinboxData: null,
    templates: null,
    isSiteProcessing: false,
    imageData: {},
    errors: {},
    currentSessionUploadedImages: {},
  };

  configTabs = [
    {
      id: 'main',
      title: localization.INBOXSETTINGS.textMain,
      icon: 'websiteMain',
      content: () => {
        const handlers = {
          onChangeAlias: this.changeAlias,
          onChangeDates: this.changeDates,
        };

        return (
          <ErrorBoundary className="errorBoundaryComponent">
            <Main
              handlers={handlers}
              inbox={this.props.inbox}
              errors={this.state.errors}
              teamDomains={this.props.team.policies.domains || []}
            />
          </ErrorBoundary>
        );
      },
    },
    {
      id: 'security',
      title: localization.INBOXSETTINGS.textSecurity,
      icon: 'websitePass',
      content: () => {
        const handlers = {
          onChangePassword: this.changePassword,
          onChangeConsentVisiting: this.changeConsentVisiting,
          onChangeConsentVisitingTitle: this.changeConsentVisitingTitle,
          onChangeConsentVisitingMessage: this.changeConsentVisitingMessage,
          onChangeConsentUploading: this.changeConsentUploading,
          onChangeConsentUploadingTitle: this.changeConsentUploadingTitle,
          onChangeConsentUploadingMessage: this.changeConsentUploadingMessage,
        };

        return (
          <ErrorBoundary className="errorBoundaryComponent">
            <Security handlers={handlers} inbox={this.state.inbox} errors={this.state.errors} />
          </ErrorBoundary>
        );
      },
    },
  ];

  static getDerivedStateFromProps(props, state) {
    if (props.inbox !== state.inbox) {
      if (props.inbox.isProtected) {
        return { inbox: { ...props.inbox, password: PASSWORD_STARS } };
      }
      return { inbox: props.inbox, password: null };
    }
    return null;
  }

  destroy = () => {
    Logger.log('User', 'InboxSettingsClose');
    back('/search');
  };

  toggleSharing = () => {
    const { _id, isShared } = this.state.inbox;
    this.props.actionsInboxes.changeShare({ _id, isShared: !isShared });
  };

  changeAlias = (_id, value) => {
    const validators = [isValidAlias(value), hasntReservedWords(value)]
      .filter((item) => item !== true);

    if (validators.length) {
      this.setState({
        errors: { ...this.state.errors, alias: validators[0] },
      });
    } else {
      const errors = { ...this.state.errors };
      delete errors.alias;
      this.setState({
        errors,
      });
    }

    this.props.actionsInboxes.changeAlias({ _id, alias: value });
  };

  changeDates = (data) => {
    const { _id } = this.state.inbox;
    const { startAt, expiresAt } = data;
    if ('startAt' in data) {
      this.props.actionsInboxes.changeStartAt({ _id, startAt });
    }
    if ('expiresAt' in data) {
      this.props.actionsInboxes.changeExpiresAt({ _id, expiresAt });
    }
  };

  /** *************** */
  /** **** PASS ***** */
  /** *************** */
  changePassword = (password) => {
    this.props.actionsInboxes.changePassword({ id: this.state.inbox._id, password });
  };

  changeConsentVisiting = (value) => {
    Logger.log('User', 'InboxChangeVisitingConsent', value);
    this.props.actionsInboxes.changeConsentsSettings({
      _id: this.state.inbox._id,
      param: 'visitingConsentEnable',
      value,
    });
    if (value) {
      const { visitingConsentTitle, visitingConsentMessage } = this.state.inbox;
      if (!visitingConsentTitle) {
        this.props.actionsInboxes.changeConsentsSettings({
          _id: this.state.inbox._id,
          param: 'visitingConsentTitle',
          value: localization.CONSENT.INBOX.VISITING.defaultTitle,
        });
      }
      if (!visitingConsentMessage) {
        this.props.actionsInboxes.changeConsentsSettings({
          _id: this.state.inbox._id,
          param: 'visitingConsentMessage',
          value: localization.CONSENT.INBOX.VISITING.defaultMessage,
        });
      }
    }
  };

  changeConsentUploading = (value) => {
    Logger.log('User', 'InboxChangeActionConsent', value);
    this.props.actionsInboxes.changeConsentsSettings({
      _id: this.state.inbox._id,
      param: 'actionConsentEnable',
      value,
    });
    if (value) {
      const { actionConsentTitle, actionConsentMessage } = this.state.inbox;
      if (!actionConsentTitle) {
        this.props.actionsInboxes.changeConsentsSettings({
          _id: this.state.inbox._id,
          param: 'actionConsentTitle',
          value: localization.CONSENT.INBOX.ACTION.defaultTitle,
        });
      }
      if (!actionConsentMessage) {
        this.props.actionsInboxes.changeConsentsSettings({
          _id: this.state.inbox._id,
          param: 'actionConsentMessage',
          value: localization.CONSENT.INBOX.ACTION.defaultMessage,
        });
      }
    }
  };

  changeConsentVisitingTitle = (value) => {
    Logger.log('User', 'InboxChangeVisitingConsentTitle');
    this.props.actionsInboxes.changeConsentsSettings({
      _id: this.state.inbox._id,
      param: 'visitingConsentTitle',
      value,
    });
  };

  changeConsentVisitingMessage = (value) => {
    Logger.log('User', 'InboxChangeVisitingConsentMessage');
    this.props.actionsInboxes.changeConsentsSettings({
      _id: this.state.inbox._id,
      param: 'visitingConsentMessage',
      value,
    });
  };

  changeConsentUploadingTitle = (value) => {
    Logger.log('User', 'InboxChangeActionConsentTitle');
    this.props.actionsInboxes.changeConsentsSettings({
      _id: this.state.inbox._id,
      param: 'actionConsentTitle',
      value,
    });
  };

  changeConsentUploadingMessage = (value) => {
    Logger.log('User', 'InboxChangeActionConsentMessage');
    this.props.actionsInboxes.changeConsentsSettings({
      _id: this.state.inbox._id,
      param: 'actionConsentMessage',
      value,
    });
  };

  render() {
    const { props, state } = this;
    const currentTabConfig = this.configTabs.find((n) => n.id === props.actTab);

    const activeTabTitle = !this.isMobile
      ? [`${localization.INBOXSETTINGS.title}: ${state.inbox.name}`, currentTabConfig.title]
      : [`${localization.INBOXSETTINGS.title}: ${state.inbox.name}`];

    return (
      <div className="page">
        <ToolbarScreenTop title={activeTabTitle} onClose={this.destroy} helpLink="inboxes" />
        <div className="pageContent pageVertical">
          <aside className="pageSidebar">
            <ScreenTab
              name="Inbox"
              configTabs={this.configTabs}
              rootPath={`/inbox/${this.props.inboxId}`}
              actTab={props.actTab}
              extraContent={(
                <Hidden implementation="js" tabletDown>
                  <MenuItemButton
                    isSiteProcessing={props.inbox.isShareChanging}
                    isActive={props.inbox.isShared}
                    createdAt={props.inbox.createdAt}
                    toggleWebsitePublish={this.toggleSharing}
                  />
                </Hidden>
              )}
            />
          </aside>
          <div className="pageInnerContent">
            <MenuItemButton
              isSiteProcessing={props.inbox.isShareChanging}
              isActive={props.inbox.isShared}
              toggleWebsitePublish={this.toggleSharing}
            />
            <div className="pageContainer">{currentTabConfig.content()}</div>
          </div>
        </div>
      </div>
    );
  }
}

const ConnectedInboxSettings = connect(
  (state, props) => {
    const inboxIndex = state.inboxes.inboxes
      ? state.inboxes.inboxes.findIndex((inbox) => inbox._id === props.inboxId)
      : -1;
    return {
      actTab: state.router.location.query.tab || 'main',
      team: state.user.team,
      inbox: inboxIndex > -1 ? state.inboxes.inboxes[inboxIndex] : null,
      user: state.user,
    };
  },
  (dispatch) => ({
    actionsInboxes: bindActionCreators(actionsInboxes, dispatch),
  }),
)(InboxSettings);

export default (props) => (
  <Provider store={store}>
    <ConnectedInboxSettings {...props} />
  </Provider>
);
