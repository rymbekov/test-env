import React from 'react';
import { bool, object } from 'prop-types';
import { Hidden } from '@picsio/ui';

import { bindActionCreators } from 'redux';
import { Provider, connect } from 'react-redux';
import store from '../../../store';
import * as assetsActions from '../../../store/actions/assets';

import ToolbarScreenTop from '../../toolbars/ToolbarScreenTop';
import ScreenTab from '../../ScreenTab';
import localization from '../../../shared/strings';
import Logger from '../../../services/Logger';

import ua from '../../../ua';
import ErrorBoundary from '../../ErrorBoundary'; // eslint-disable-line
import MenuItemButton from '../../Websites/MenuItemButton';
import Security from './securityTab';
import Main from './mainTab';
import SkeletonItem from './SkeletonMain';
import { back } from '../../../helpers/history';

const PASSWORD_STARS = '*✝*✝*✝*✝*'; // this is hard code , made with love✝ :-*
const eventsNames = {
  expiresAt: 'ChangeExpiryDateSet',
  download: 'Downloads',
  revisionsShow: 'Revisions',
  comment: 'Comments',
  titleEditable: 'Title',
  descriptionEditable: 'Description',
  customFieldsShow: 'CustomFields',
  flag: 'AssetMarksFlag',
  rating: 'AssetMarksRating',
  color: 'AssetMarksColor',
};

class ScreenSingleSharing extends React.Component {
  isMobile = ua.browser.isNotDesktop();

  /** propTypes */
  static propTypes = {
    asset: object,
    inProgress: bool,
  };

  /** state */
  state = {
    loading: false,
    asset: {},
    singleSharingSettings: {},
  };

  configTabs = [
    {
      id: 'main',
      title: localization.SCREEN_ASSET_SHARING.textMain,
      icon: 'websiteMain',
      content: () => {
        const handlers = {
          onChangeAlias: this.changeAlias,
          onChangeDates: this.changeDates,
          onChangeSetting: this.handleChangeSetting,
        };

        return (
          <ErrorBoundary className="errorBoundaryComponent">
            <Main
              handlers={handlers}
              asset={this.props.asset}
              subscriptionFeatures={this.props.subscriptionFeatures}
              inProgress={this.props.inProgress}
              errors={this.state.errors}
            />
          </ErrorBoundary>
        );
      },
    },
    {
      id: 'security',
      title: localization.SCREEN_ASSET_SHARING.textSecurity,
      icon: 'websitePass',
      content: () => {
        const handlers = {
          onChangeSetting: this.handleChangeSetting,
          onChangeConsentVisiting: this.changeConsentVisiting,
          onChangeConsentVisitingTitle: this.changeConsentVisitingTitle,
          onChangeConsentVisitingMessage: this.changeConsentVisitingMessage,
          onChangeConsentDownloading: this.changeConsentDownloading,
          onChangeConsentDownloadingTitle: this.changeConsentDownloadingTitle,
          onChangeConsentDownloadingMessage: this.changeConsentDownloadingMessage,
        };

        return (
          <ErrorBoundary className="errorBoundaryComponent">
            <Security handlers={handlers} asset={this.state.asset} />
          </ErrorBoundary>
        );
      },
    },
  ];

  static getDerivedStateFromProps(props, state) {
    if (!props.asset && !state.loading) {
      props.actions.getTmpAssets([props.assetId]);
      return { loading: true };
    }
    if (props.asset !== state.asset) {
      if (props.asset.singleSharingSettings && props.asset.singleSharingSettings.isProtected) {
        return {
          loading: false,
          asset: { ...props.asset, password: PASSWORD_STARS },
        };
      }
      return { loading: false, asset: props.asset, password: null };
    }
    return { loading: false };
  }

  destroy = () => {
    Logger.log('User', 'InfoPanelShareSingleOptionsHide');
    back();
  };

  handleChangeSetting = (key, value) => {
    let eventKey = key;
    if (Array.isArray(key)) {
      eventKey = key[1];
      !value && this.handleChangeSetting(key[1], false);
      key = key[0];
    }

    if (value instanceof Date) {
      value = value.toISOString();
    }

    if (eventKey in eventsNames) {
      Logger.log('User', `InfoPanelShareSingleOptions${eventsNames[eventKey]}`, { value });
    }
    if (key === 'isShared') {
      const eventName = value ? 'Publish' : 'Unpublish';
      Logger.log('User', `InfoPanelShareSingle${eventName}`, { assetId: this.props.assetId });
    }

    this.props.actions.changeShare(this.props.assetId, key, value);
  };

  handleShare = () => {
    const { disabled, asset = {} } = this.props;
    const { singleSharingSettings = {} } = asset;
    const { isShared } = singleSharingSettings;

    if (!disabled) this.handleChangeSetting('isShared', !isShared);
  };

  getSingleSharingSettings = () => {
    const { singleSharingSettings = {} } = this.state.asset;
    return singleSharingSettings;
  };

  changeConsentVisiting = (value) => {
    Logger.log('User', 'SASChangeVisitingConsent', value);
    this.handleChangeSetting('visitingConsentEnable', value);
    if (value) {
      const { visitingConsentTitle, visitingConsentMessage } = this.getSingleSharingSettings();
      if (!visitingConsentTitle) {
        this.handleChangeSetting(
          'visitingConsentTitle',
          localization.CONSENT.SAS.VISITING.defaultTitle,
        );
      }
      if (!visitingConsentMessage) {
        this.handleChangeSetting(
          'visitingConsentMessage',
          localization.CONSENT.SAS.VISITING.defaultMessage,
        );
      }
    }
  };

  changeConsentDownloading = (value) => {
    Logger.log('User', 'SASChangeActionConsent', value);
    this.handleChangeSetting('actionConsentEnable', value);
    if (value) {
      const { actionConsentTitle, actionConsentMessage } = this.getSingleSharingSettings();
      if (!actionConsentTitle) {
        this.handleChangeSetting(
          'actionConsentTitle',
          localization.CONSENT.SAS.ACTION.defaultTitle,
        );
      }
      if (!actionConsentMessage) {
        this.handleChangeSetting(
          'actionConsentMessage',
          localization.CONSENT.SAS.ACTION.defaultMessage,
        );
      }
    }
  };

  changeConsentVisitingTitle = (value) => {
    Logger.log('User', 'SASChangeVisitingConsentTitle');
    this.handleChangeSetting('visitingConsentTitle', value);
  };

  changeConsentVisitingMessage = (value) => {
    Logger.log('User', 'SASChangeVisitingConsentMessage');
    this.handleChangeSetting('visitingConsentMessage', value);
  };

  changeConsentDownloadingTitle = (value) => {
    Logger.log('User', 'SASChangeActionConsentTitle');
    this.handleChangeSetting('actionConsentTitle', value);
  };

  changeConsentDownloadingMessage = (value) => {
    Logger.log('User', 'SASChangeActionConsentMessage');
    this.handleChangeSetting('actionConsentMessage', value);
  };

  render() {
    const { props, state } = this;
    const { loading } = state;
    const { asset = {}, inProgress, subscriptionFeatures } = props;
    const { singleSharingSettings = {} } = asset;
    const { isShared, updatedAt } = singleSharingSettings;
    const currentTabConfig = this.configTabs.find((n) => n.id === props.actTab);
    const isAssetSharingDisabled = subscriptionFeatures.assetSharing === false;

    const activeTabTitle = [localization.SCREEN_ASSET_SHARING.title];

    return (
      <div className="page screenSingleSharing">
        <ToolbarScreenTop
          title={activeTabTitle}
          onClose={this.destroy}
          helpLink="singleAssetSharing"
        />
        <div className="pageContent pageVertical">
          <aside className="pageSidebar">
            <ScreenTab
              name="Singlesharing"
              configTabs={this.configTabs}
              rootPath={`/singlesharing/${props.assetId}`}
              actTab={props.actTab}
              extraContent={(
                <Hidden implementation="js" tabletDown>
                  <MenuItemButton
                    isSiteProcessing={inProgress}
                    isActive={isShared}
                    createdAt={updatedAt}
                    toggleWebsitePublish={this.handleShare}
                    disabled={isAssetSharingDisabled}
                  />
                </Hidden>
              )}
            />
          </aside>
          <div className="pageInnerContent">
            <Choose>
              <When condition={loading}>
                <SkeletonItem />
              </When>
              <Otherwise>
                <>
                  <MenuItemButton
                    isSiteProcessing={inProgress}
                    isActive={isShared}
                    createdAt={updatedAt}
                    toggleWebsitePublish={this.handleShare}
                    disabled={isAssetSharingDisabled}
                  />
                  <div className="pageContainer">{currentTabConfig.content()}</div>
                </>
              </Otherwise>
            </Choose>
          </div>
        </div>
      </div>
    );
  }
}

const ConnectedScreenSingleSharing = connect(
  (state, props) => ({
    actTab: state.router.location.query.tab || 'main',
    asset: state.assets.items.find((asset) => asset._id === props.assetId),
    inProgress: state.assets.inProgress.share,
    subscriptionFeatures: state.user.subscriptionFeatures,
  }),
  (dispatch) => ({ actions: bindActionCreators(assetsActions, dispatch) }),
)(ScreenSingleSharing);

export default (props) => (
  <Provider store={store}>
    <ConnectedScreenSingleSharing {...props} />
  </Provider>
);
