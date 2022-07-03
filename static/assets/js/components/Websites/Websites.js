import React from 'react';
import ReactDOM from 'react-dom';

import Q from 'q';
import picsioUtils from '@picsio/utils';
import pick from 'lodash.pick';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Api from '../../api/websites';
import * as ApiAssets from '../../api/assets';

import ErrorBoundary from '../ErrorBoundary';
import ToolbarScreenTop from '../toolbars/ToolbarScreenTop';
import ScreenTab from '../ScreenTab';
import Tag from '../Tag';

import { showUploadFileErrorDialog } from '../../helpers/fileUploader';

import Dialogs from '../../ui/dialogs';
import UiBlocker from '../../services/UiBlocker';
import * as utils from '../../shared/utils';
import localization from '../../shared/strings';
import Logger from '../../services/Logger';
import * as UtilsCollections from '../../store/utils/collections';

/** Store */
import * as collectionsActions from '../../store/actions/collections';
import Toast from '../Toast';
import { showDialog, showErrorDialog } from '../dialog';

import SkeletonItem from './SkeletonMain';
import MenuItemButton from './MenuItemButton';
import withErrorBoundary from '../ErrorBoundary/withErrorBoundary';
import defaultWebsiteData from './configs/defaultWebsiteData';

import Analytics from './Tabs/Analytics';
import SEO from './Tabs/SEO';
import Customization from './Tabs/Customization';
import Notifications from './Tabs/Notifications';
import Security from './Tabs/Security';
import Main from './Tabs/Main';
import { back, navigate, reloadApp } from '../../helpers/history';

const PASSWORD_STARS = '*✝*✝*✝*✝*'; // this is hard code , made with love✝ :-*
const API_UPLOAD_METHODS = {
  logoUrl: Api.uploadLogo,
  avatarUrl: Api.uploadAvatar,
  backgroundLoginPageUrl: Api.uploadBackground,
};
const API_DELETE_METHODS = {
  logoUrl: Api.deleteLogo,
  avatarUrl: Api.deleteAvatar,
  backgroundLoginPageUrl: Api.deleteBackground,
};

const isValidAlias = (value) => {
  const valid = new RegExp(
    '^([0-9A-Za-z-\\.@:%_+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?',
  ).test(value);
  // let isHttps = (new RegExp('^https')).test(value);
  return valid ? true : localization.WEBSITES.textUrlNotValid;
};

const hasntReservedWords = (value) => {
  const list = ['catalog', 'preview', 'collection'];
  // let err = 'Words "' + list.join(', ') + '" can\'t be use at the url begging';
  const err = localization.WEBSITES.textWordsCantBeUsed(list.join(', '));
  return list.some((n) => value.includes(`/${n}`)) ? err : true;
};

const isValidToplevelHttpUrlForPicsio = (value) => {
  const err = localization.WEBSITES.textTopLevelFolders;
  const isTopLevel = new RegExp('^([0-9A-Za-z.])+(/[0-9A-Za-z_-]*)?$').test(value);
  return isTopLevel || err;
};

const isntAlreadyUsed = (websiteAlias, websiteId) => Promise.resolve(
  websiteId
    ? Api.websiteValidateAliasWithWebsiteId(websiteAlias, websiteId)
    : Api.websiteValidateAlias(websiteAlias),
)
  .then((alias) => (alias.free ? true : localization.WEBSITES.textUrlInUse))
  .catch(console.error.bind(console));

const setInitialSortType = (collectionSort = {}, websiteSort) => {
  const { type: collectionSortType, order: collectionSortOrder } = collectionSort;
  const { type: websiteSortType, order: websiteSortOrder } = websiteSort;
  const sortType = {};

  if (collectionSortType === 'custom') {
    sortType.type = collectionSortType;
  } else if (collectionSortType && collectionSortOrder) {
    sortType.type = collectionSortType;
    sortType.order = collectionSortOrder;
  } else {
    sortType.type = websiteSortType;
    sortType.order = websiteSortOrder;
  }

  return sortType;
};

const isValidGoogleIdentifier = (value) => {
  const err = localization.WEBSITES.textGoogleAnalIsntValid;
  return /^ua-\d{4,9}-\d{1,4}$/i.test(value) || /^(G|YT|MO)-[a-zA-Z0-9-]+$/i.test(value) || err;
};

class WebsiteIndex extends React.Component {
  siteCollection = this.props.websites.find(
    (collection) => collection._id === this.props.collectionId,
  );

  state = {
    collection: null,
    website: null,
    isNew: !this.siteCollection,
    originalWebsiteData: null,
    templates: null,
    loading: true,
    isSiteProcessing: false,
    imageData: {},
    errors: {},
    currentSessionUploadedImages: {},
    isHomeCollectionChildrenFetching: false,

    /** for spinner on ImagePicker */
    islogoUrlUploading: false,
    isavatarUrlUploading: false,
    isbackgroundLoginPageUrlUploading: false,
  };

  configTabs = [
    {
      id: 'main',
      title: localization.WEBSITES.textMain,
      icon: 'websiteMain',
      content: () => {
        const handlers = {
          onChangeAlias: this.changeAlias,
          onChangeTemplate: this.changeTemplate,
        };

        return (
          <ErrorBoundary className="errorBoundaryComponent">
            <Main
              handlers={handlers}
              website={this.state.website}
              templates={this.state.templates}
              protocol={this.getProtocol()}
              errors={this.state.errors}
              teamDomains={this.props.team.policies.domains || []}
              isDisabledCopy={this.state.isNew}
            />
          </ErrorBoundary>
        );
      },
    },
    {
      id: 'security',
      title: localization.WEBSITES.textSecurity,
      icon: 'websitePass',
      content: () => {
        const handlers = {
          onChangePassword: this.changePassword,
          onChangeConsentVisiting: this.changeConsentVisiting,
          onChangeConsentVisitingTitle: this.changeConsentVisitingTitle,
          onChangeConsentVisitingMessage: this.changeConsentVisitingMessage,
          onChangeConsentDownloading: this.changeConsentDownloading,
          onChangeConsentDownloadingTitle: this.changeConsentDownloadingTitle,
          onChangeConsentDownloadingMessage: this.changeConsentDownloadingMessage,
        };

        return (
          <ErrorBoundary className="errorBoundaryComponent">
            <Security handlers={handlers} website={this.state.website} />
          </ErrorBoundary>
        );
      },
    },
    {
      id: 'notifications',
      title: localization.WEBSITES.textNotifications,
      icon: 'bell',
      content: () => {
        const handlers = {
          onUpdateSubscribedEmails: this.updateSubscribedEmails,
          onUpdateNotificationsSettings: this.updateNotificationsSettings,
        };
        return (
          <ErrorBoundary className="errorBoundaryComponent">
            <Notifications
              handlers={handlers}
              errors={this.state.errors}
              notificationsEmails={
                (this.state.website.emails
                  && this.state.website.emails.length
                  && this.state.website.emails.map((item) => item.email))
                || []
              }
              emailEventTypes={this.state.website.emailEventTypes || []}
            />
          </ErrorBoundary>
        );
      },
    },
    {
      id: 'customization',
      title: localization.WEBSITES.textCustomization,
      icon: 'websiteCustom',
      content: () => {
        const handlers = {
          onChangeWebsiteData: this.changeWebsiteData,
          onChangeSiteTitle: this.changeSiteTitle,
          onSaveSiteTitle: this.saveSiteTitle,
          onChangeSiteSubtitle: this.changeSiteSubtitle,
          onSaveSiteSubtitle: this.saveSiteSubtitle,
          onChangeImagePicker: this.changeImagePicker,
          onChangeSiteExpires: this.changeSiteExpires,
        };

        return (
          <ErrorBoundary className="errorBoundaryComponent">
            <Customization
              handlers={handlers}
              website={this.state.website}
              templates={this.state.templates}
              imageData={this.state.imageData}
              originalWebsiteData={this.state.originalWebsiteData}
              collection={this.state.collection}
              collectionId={this.props.collectionId}
              collectionsActions={this.props.collectionsActions}
              collectionsStore={this.props.collections}
              isavatarUrlUploading={this.state.isavatarUrlUploading}
              islogoUrlUploading={this.state.islogoUrlUploading}
              isbackgroundLoginPageUrlUploading={this.state.isbackgroundLoginPageUrlUploading}
              subscriptionFeatures={this.props.user.subscriptionFeatures}
            />
          </ErrorBoundary>
        );
      },
    },
    {
      id: 'seo',
      title: localization.WEBSITES.textSEO,
      icon: 'websiteSeo',
      content: () => {
        const handlers = {
          onChangeGoogleAnaliticsIdentifier: this.changeGoogleAnaliticsIdentifier,
          onSaveGoogleAnaliticsIdentifier: this.saveGoogleAnaliticsIdentifier,
          onChangeCustomGalleryTitle: this.changeCustomGalleryTitle,
          onSaveCustomGalleryTitle: this.saveCustomGalleryTitle,
          onChangeWebsiteData: this.changeWebsiteData,
        };

        return (
          <ErrorBoundary className="errorBoundaryComponent">
            <SEO handlers={handlers} website={this.state.website} errors={this.state.errors} />
          </ErrorBoundary>
        );
      },
    },
    {
      id: 'analytics',
      title: localization.WEBSITES.textAnalytics,
      icon: 'analyticsTab',
      content: () => (
        <ErrorBoundary className="errorBoundaryComponent">
          <Analytics errors={this.state.errors} collectionId={this.props.collectionId} />
        </ErrorBoundary>
      ),
    },
  ];

  componentDidMount() {
    Logger.log('UI', 'WebSiteSettingsPage', this.props.collectionId);
    this.fetch();
  }

  componentDidUpdate() {
    const { website, isHomeCollectionChildrenFetching } = this.state;
    if (website) {
      const { homeCollectionId } = website;
      // we need to have collection in Store, for customization tab
      if (homeCollectionId && !isHomeCollectionChildrenFetching) {
        this.props.collectionsActions.getChildren(this.props.collections.my._id, {
          currentCollectionId: homeCollectionId,
        });
        this.setState({ isHomeCollectionChildrenFetching: true });
      }
    }
  }

  fetch() {
    const getTagData = UtilsCollections.forceFindTagWithTagId(this.props.collectionId);
    const getTemplates = Q(Api.fetchWebsiteTemplates());
    const getWebsiteData = Q(Api.fetchWebsiteData(this.props.collectionId));

    // first fetch room from backend
    // it can be empty that means new room should be created
    // or not empty that means we need to update
    // also room can't be created because of:
    // - too much files in collection
    // - any subscription limitations
    return Q.all([getTagData, getWebsiteData, getTemplates])
      .spread((collection, website, templates) => {
        const isNew = website && !!website.suggestions;

        if (isNew) {
          website = {
            ...defaultWebsiteData,
            ...pick(website.suggestions.website, Object.keys(defaultWebsiteData)),
            alias: website.suggestions.alias,
          };
        } else {
          website = { ...defaultWebsiteData, ...website };
        }

        website.isProtected && (website.password = PASSWORD_STARS);

        if (isNew) {
          website.sortType = setInitialSortType(collection.sortType, website.sortType);
          website.overridedDisplayName = this.props.team.displayName;
          website.overridedTagname = collection.name;
          website.customGalleryTitle = collection.name;
        }

        const originalWebsiteData = { ...website };

        this.setState({
          collection,
          templates,
          website,
          isNew,
          originalWebsiteData,
          loading: false,
        });
      })
      .catch((err) => {
        const errorMessage = utils.getDataFromResponceError(err, 'msg');
        const errorStatus = utils.getStatusFromResponceError(err);

        if (errorMessage || errorStatus === 403) {
          Logger.error(new Error('Error manage website'), { error: err }, [
            'ManageWebsiteFailed',
            errorMessage,
          ]);
          new Dialogs.Text({
            title: localization.WEBSITES.titleError,
            html: errorStatus === 403 ? localization.NO_PERMISSION_TO_ACCESS : errorMessage,
            dialogConfig: {
              textBtnCancel: null,
              textBtnOk: localization.DIALOGS.btnOk,
              onOk: reloadApp,
              onCancel: reloadApp,
              onClose: reloadApp,
            },
          });
          return;
        }

        new Dialogs.Text({
          title: localization.WEBSITES.titleError,
          html: localization.WEBSITES.textWebsiteWasntFound,
          dialogConfig: {
            textBtnCancel: null,
            textBtnOk: localization.DIALOGS.btnOk,
            onOk: reloadApp,
            onCancel: reloadApp,
            onClose: reloadApp,
          },
        });
        console.error(err);
      });
  }

  updateView() {
    this.setState(this.state);
  }

  destroy = () => {
    Logger.log('User', 'WebSiteSettingsClose');
    back();
  };

  handleCreateSite = async () => {
    Logger.log('User', 'WebSiteSettingsPublish', this.props.collectionId);

    if (Object.keys(this.state.errors).length) {
      new Dialogs.Text({
        title: localization.WEBSITES.titleErrors,
        html: Object.keys(this.state.errors)
          .map((n) => this.state.errors[n])
          .join('<br />'),
      });
      return;
    }

    UiBlocker.block(localization.WEBSITES.textSavingWebsite);

    this.setState({ isSiteProcessing: true });

    const checkForRestrictedAssets = async () => {
      const restrictedAssets = await ApiAssets.getRestrictedAssets(this.props.collectionId);
      if (restrictedAssets.images && restrictedAssets.images.length) {
        if (this.props.user.role.permissions.restrictedDownload) {
          Logger.log('UI', 'WebSiteCollectionDialogWithRestrictedAssets', {
            restrictedPermission: true,
          });
          UiBlocker.unblock();
          showDialog({
            title: 'Restricted assets detected',
            text:
              'Please note that you are about to publish the collection with restricted assets inside.',
            textBtnOk: 'Ok',
            textBtnCancel: 'Cancel',
            onOk: () => startCreating(),
            onCancel: () => {
              UiBlocker.unblock();
              this.setState({ isSiteProcessing: false });
            },
          });
        } else {
          const allAssetsNames = restrictedAssets.images.map((asset) => asset.name);
          let assetNamesShortList = [];
          const { user, teammates, roles } = this.props;

          const usersWithRoleManageTeam = utils.getTeamManagers(user, teammates, roles);
          if (allAssetsNames.length > 3) assetNamesShortList = allAssetsNames.slice(0, 3);
          if (allAssetsNames.length > 0) {
            const namesText = assetNamesShortList.length
              ? `${assetNamesShortList.join(', ')} and some more`
              : allAssetsNames.join(', ');

            const dialogHtml = (
              <div className="myTeamDialog">
                Asset{allAssetsNames.length > 1 && 's'} {namesText}{' '}
                {allAssetsNames.length > 1 ? 'are' : 'is'} restricted and cannot be shared. Please
                contact your team
                {Boolean(usersWithRoleManageTeam.length) && (
                  <>
                    {' '}
                    manager{usersWithRoleManageTeam.length > 1 && 's'}{' '}
                    {usersWithRoleManageTeam.slice(0, 5).map((teamManager) => (
                      <Tag
                        type="user"
                        avatar={teamManager.avatar}
                        key={teamManager._id}
                        text={teamManager.email}
                      />
                    ))}{' '}
                  </>
                )}
                for further assistance.
              </div>
            );

            UiBlocker.unblock();
            showDialog({
              title: localization.WEBSITES.titleAttention,
              children: dialogHtml,
            });
            Logger.log('UI', 'WebSiteCollectionDialogWithRestrictedAssets', {
              restrictedPermission: false,
            });
            this.setState({ isSiteProcessing: false });
          }
        }
      } else {
        startCreating();
      }
    };

    let startCreating = () =>
      // flow
      // a. check domain for availability
      // a-a. domain is OK - apply changes and close dialog
      // a-b. domain is not set - show confirmation with message 'domain not set'
      // a-b-a. user clicked OK - apply changes and close dialog
      // a-b-b. user clicked cancel - close confirmation and return to main dialog
      // a-c. domain is points to us - show confirmation with message 'domain not points'
      // a-c-a. user clicked OK - apply changes and close dialog
      // a-c-b. user clicked cancel - close confirmation and return to main dialog
      // should check domain errors before
      (
        Q(Api.checkDomain(this.state.website.alias))
          // check for errors
          .then((data) => {
            // @TODO: do we need to check all new sites for domain (not custom too...)?
            // if (data.error) throw data.error;
          })
          // show confirmation dialog
          .catch((error) => new Promise((resolve, reject) => {
            // unrecoverable situation
            if (error && (error.code == 'noalias' || error.code == 'wrongalias')) {
              reject(new Error(error.msg));
              return;
            }
            // warnings
            if (error.code) {
              const messages = {
                norecord: localization.WEBSITES.textNorecord,
                anotherip: localization.WEBSITES.textAnotherip,
              };
              const msg = messages[error.code] || localization.WEBSITES.textDomainCantVerified;

              showDialog({
                title: localization.WEBSITES.titleWarning,
                text: msg,
                textBtnOk: localization.DIALOGS.btnOk,
                textBtnCancel: localization.DIALOGS.btnCancel,
                onOk: resolve,
                onCancel: reject,
              });
            } else {
              resolve();
            }
          }))
          .then(() => {
            const { imageData } = this.state;

            return this.createWebsite(imageData).then(() => {
              this.destroy();
              UiBlocker.unblock();
              this.setState({ isSiteProcessing: false });
            });
          })
          .catch((err) => {
            console.error(err);
            UiBlocker.unblock();
            this.setState({ isSiteProcessing: false });
            Logger.error(new Error('Error create website'), { error: err }, [
              'CreateWebsiteFailed',
              (err && err.message) || 'NoMessage',
            ]);
          })
      );
    isntAlreadyUsed(this.state.website.alias, this.props.collectionId)
      .then((resp) => {
        if (resp !== true) {
          new Dialogs.Text({
            title: localization.WEBSITES.titleErrors,
            html: resp,
          });
          UiBlocker.unblock();
          this.setState({ isSiteProcessing: false });
        } else {
          checkForRestrictedAssets();
        }
      })
      .catch(console.error.bind(console));
  };

  toggleWebsitePublish = () => {
    const { isNew } = this.state;
    if (isNew) {
      this.handleCreateSite();
    } else {
      this.deleteWebsite();
    }
  };

  handleGoToBilling = () => {
    navigate('/billing?tab=overview');
    ReactDOM.unmountComponentAtNode(document.querySelector('.wrapperDialog'));
  };

  async createWebsite(imageData) {
    const { state, props } = this;
    const { collectionId } = props;
    const { website } = state;

    let createdWebsite;
    try {
      createdWebsite = await Api.createWebsite(collectionId, website);
    } catch (err) {
      const errorMessage = utils.getDataFromResponceError(err, 'msg') || '';
      if (errorMessage.toLowerCase().startsWith('websites limit 0 exceeded')) {
        showDialog({
          title: localization.WEBSITES.titleWarningChangePlan,
          children: localization.WEBSITES.descriptionWarningChangePlan(() => this.handleGoToBilling()),
          textBtnOk: localization.DIALOGS.btnOk,
          textBtnCancel: null,
          onOk: null,
          onCancel: null,
          style: { maxWidth: 545 },
        });
      } else {
        showErrorDialog(
          errorMessage || localization.WEBSITES.textWebsiteCreationUnsuccessful,
        );
      }
      return err;
    }

    const websiteId = createdWebsite._id;

    try {
      /** upload images if user changed */
      const uploads = Object.keys(imageData).map((fieldName) => {
        const data = new FormData();
        data.append('file', imageData[fieldName].file);

        return API_UPLOAD_METHODS[fieldName](websiteId, data);
      });
      if (uploads.length) await Q.all(uploads);
    } catch (error) {
      const errorMessage = utils.getDataFromResponceError(error, 'msg')
        || localization.WEBSITES.textWebsiteSomeImagesUnsuccessful;
      showErrorDialog(errorMessage);
    }
    const websiteUrl = this.getProtocol() + createdWebsite.alias;

    Toast(localization.WEBSITES.alertWebsiteCreated, {
      btnOkValue: localization.WEBSITES.textVisitWebsite,
      onOk: () => {
        window.open(websiteUrl, '_blank');
      },
    });

    props.collectionsActions.setWebsite(state.collection._id, createdWebsite);
    return createdWebsite;
  }

  updateWebsite = async (data, collectionId = this.props.collectionId) => {
    if (this.state.isNew) return;
    Logger.log('User', 'WebSiteSettingsUpdateSettings');
    if (data.alias) {
      const response = await isntAlreadyUsed(data.alias, collectionId);
      if (response !== true) {
        return showErrorDialog(response);
      }
    }

    try {
      await Api.updateWebsite(collectionId, data);
    } catch (err) {
      const errorMessage = utils.getDataFromResponceError(err, 'msg');
      showErrorDialog(errorMessage || localization.WEBSITES.textWebsiteUpdatingUnsuccessful);
      Logger.error(new Error('Error updating website'), { error: err }, [
        'UpdatingWebsiteFailed',
        errorMessage || 'NoMessage',
      ]);
    }
  };

  deleteWebsite = () => {
    const { state, props } = this;
    const { collectionId } = props;

    const onOk = () => {
      this.setState({ isSiteProcessing: true });
      Q(Api.deleteWebsite(collectionId))
        .then(() => {
          props.collectionsActions.setWebsite(state.collection._id, null);
          this.destroy();
        })
        .catch((err) => {
          Toast(localization.WEBSITES.alertErrorHappened, {
            btnOkValue: localization.WEBSITES.textContact,
            onOk() {
              window.open('mailto:support@pics.io', '_blank');
            },
            closeButton: false,
          });
          this.setState({ isSiteProcessing: false });
          Logger.error(new Error('Error delete website'), { error: err }, [
            'DeleteWebsiteFailed',
            (err && err.message) || 'NoMessage',
          ]);
        });
      Logger.log('User', 'WebSiteSettingsUpdateSettingsConfirmationYes');
    };

    const onCancel = () => {
      Logger.log('User', 'WebSiteSettingsUpdateSettingsConfirmationNo');
    };

    showDialog({
      title: localization.WEBSITES.titleWarning,
      text: localization.WEBSITES.textSiteWillBeDeleted,
      textBtnOk: localization.DIALOGS.btnOk,
      textBtnCancel: localization.DIALOGS.btnCancel,
      onCancel,
      onOk,
    });

    Logger.log('User', 'WebSiteSettingsUnpublish');
  };

  /** *************** */
  /** **** MAIN ***** */
  /** *************** */
  changeAlias = (id, value) => {
    const validators = [
      isValidAlias(value),
      isValidToplevelHttpUrlForPicsio(value),
      hasntReservedWords(value),
    ].filter((item) => item !== true);

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

    this.setState({
      website: { ...this.state.website, alias: value },
    });
    this.updateWebsite({ alias: value });
  };

  getProtocol() {
    const { alias } = this.state.website;

    return alias.match(/.\.pics\.io/) ? 'https://' : 'http://';
  }

  changeTemplate = (value) => {
    this.setState({
      website: { ...this.state.website, template: value },
    });

    this.updateWebsite({ template: value });
    Logger.log('User', 'WebSiteSettingsChangeTemplate', value);
  };

  /** *************** */
  /** **** PASS ***** */
  /** *************** */
  changePassword = (password) => {
    this.setState({
      website: { ...this.state.website, password },
    });

    this.updateWebsite({ password });
  };

  changeConsentVisiting = (value) => {
    Logger.log('User', 'WebSiteSettingsChangeVisitingConsent', value);
    const data = {};
    if (this.state.isNew) {
      data.visitingConsentEnable = value;
      data.visitingConsentTitle = localization.CONSENT.WEBSITE.VISITING.defaultTitle;
      data.visitingConsentMessage = localization.CONSENT.WEBSITE.VISITING.defaultMessage;
    } else {
      data.visitingConsentEnable = value;
      if (value) {
        const { visitingConsentTitle, visitingConsentMessage } = this.state.website;
        if (!visitingConsentTitle) { data.visitingConsentTitle = localization.CONSENT.WEBSITE.VISITING.defaultTitle; }
        if (!visitingConsentMessage) { data.visitingConsentMessage = localization.CONSENT.WEBSITE.VISITING.defaultMessage; }
      }
    }
    this.setState({ website: { ...this.state.website, ...data } });
    this.updateWebsite({ ...data });
  };

  changeConsentDownloading = (value) => {
    Logger.log('User', 'WebSiteSettingsConsentActionConsent', value);
    const data = {};
    if (this.state.isNew) {
      data.actionConsentEnable = value;
      data.actionConsentTitle = localization.CONSENT.WEBSITE.ACTION.defaultTitle;
      data.actionConsentMessage = localization.CONSENT.WEBSITE.ACTION.defaultMessage;
    } else {
      data.actionConsentEnable = value;
      if (value) {
        const { actionConsentTitle, actionConsentMessage } = this.state.website;
        if (!actionConsentTitle) { data.actionConsentTitle = localization.CONSENT.WEBSITE.ACTION.defaultTitle; }
        if (!actionConsentMessage) { data.actionConsentMessage = localization.CONSENT.WEBSITE.ACTION.defaultMessage; }
      }
    }
    this.setState({ website: { ...this.state.website, ...data } });
    this.updateWebsite({ ...data });
  };

  changeConsentVisitingTitle = (value) => {
    Logger.log('User', 'WebSiteSettingsChangeConsentVisitingTitle');
    this.setState({
      website: { ...this.state.website, visitingConsentTitle: value },
    });
    this.updateWebsite({ visitingConsentTitle: value });
  };

  changeConsentVisitingMessage = (value) => {
    Logger.log('User', 'WebSiteSettingsChangeConsentVisitingMessage');
    this.setState({
      website: { ...this.state.website, visitingConsentMessage: value },
    });
    this.updateWebsite({ visitingConsentMessage: value });
  };

  changeConsentDownloadingTitle = (value) => {
    Logger.log('User', 'WebSiteSettingsChangeConsentDownloadingTitle');
    this.setState({
      website: { ...this.state.website, actionConsentTitle: value },
    });
    this.updateWebsite({ actionConsentTitle: value });
  };

  changeConsentDownloadingMessage = (value) => {
    Logger.log('User', 'WebSiteSettingsChangeConsentDownloadingMessage');
    this.setState({
      website: { ...this.state.website, actionConsentMessage: value },
    });
    this.updateWebsite({ actionConsentMessage: value });
  };

  /** *************** */
  /* NOTIFICATIONS * */
  /** *************** */
  updateSubscribedEmails = (emails) => {
    Logger.log('User', 'WebSiteSettingsEmailsChanged');

    let updatedEmails = [];
    const stateEmails = (this.state.website && this.state.website.emails) || [];
    emails.forEach((email) => {
      const existingEmail = stateEmails.find((stateEmail) => stateEmail.email === email);
      if (existingEmail) {
        updatedEmails = [...updatedEmails, existingEmail];
      } else {
        updatedEmails = [...updatedEmails, { email, confirmed: false }];
      }
    });

    this.setState({
      website: { ...this.state.website, emails: updatedEmails },
    });

    this.updateWebsite({ emails: updatedEmails });
  };

  updateNotificationsSettings = (settings) => {
    Logger.log('User', 'WebSiteSettingsNotificationsChanged');
    const emailEventTypes = settings.types;

    this.setState({
      website: { ...this.state.website, emailEventTypes },
    });

    this.updateWebsite({ emailEventTypes });
  };

  /** *************** */
  /** *** CUSTOM **** */
  /** *************** */
  changeWebsiteData = (key, value) => {
    const addTo = {};
    if (Array.isArray(key)) {
      key.forEach((item) => {
        addTo[item.key] = item.value;
      });
    } else {
      addTo[key] = value;
    }

    this.setState({
      website: { ...this.state.website, ...addTo },
    });
    this.updateWebsite(addTo);
  };

  changeSiteTitle = (e) => {
    this.setState({
      website: { ...this.state.website, overridedDisplayName: e.currentTarget.value },
    });
  };

  saveSiteTitle = (e) => {
    this.updateWebsite({ overridedDisplayName: e.currentTarget.value });
  };

  changeSiteSubtitle = (e) => {
    this.setState({
      website: { ...this.state.website, overridedTagname: e.currentTarget.value },
    });
  };

  saveSiteSubtitle = (e) => {
    this.updateWebsite({ overridedTagname: e.currentTarget.value });
  };

  changeSiteExpires = (value) => {
    Logger.log('User', 'WebSiteSettingsChangeSiteExpires');

    if (value instanceof Date) {
      value = value.toISOString();
    }

    this.setState({
      website: { ...this.state.website, expiresAt: value },
    });
    this.updateWebsite({ expiresAt: value });
  };

  changeImagePicker = async (file, fieldName) => {
    let fileUrl;
    if (file) {
      const reader = new FileReader();
      reader.onload = async (fileResp) => {
        const fileMimeType = picsioUtils.lookupMimeType(file.name.split('.').pop());

        if (!this.state.isNew && this.state.website._id) {
          Logger.log('User', 'WebSiteSettingsUpdateSettings');
          this.setState({ [`is${fieldName}Uploading`]: true });
          try {
            const data = new FormData();
            data.append('file', file);
            fileUrl = await API_UPLOAD_METHODS[fieldName](this.state.website._id, data).promise;
          } catch (err) {
            showUploadFileErrorDialog(err);
            const errorMessage = utils.getDataFromResponceError(err, 'msg');
            Logger.error(new Error('Error updating website'), { error: err }, [
              'UpdatingWebsiteFailed',
              errorMessage || `Can not update ${fieldName}`,
            ]);
          }
          this.setState({ [`is${fieldName}Uploading`]: false });
        }

        this.setState({
          imageData: {
            ...this.state.imageData,
            [fieldName]: {
              base64: fileResp.target.result, mimetype: fileMimeType, fileUrl, file,
            },
          },
          website: { ...this.state.website, [fieldName]: fileUrl },
        });
      };
      reader.readAsDataURL(file);
    } else {
      if (!this.state.isNew && this.state.website._id) {
        Logger.log('User', 'WebSiteSettingsUpdateSettings');
        this.setState({ [`is${fieldName}Uploading`]: true });
        try {
          fileUrl = await API_DELETE_METHODS[fieldName](this.state.website._id);
        } catch (err) {
          const errorMessage = utils.getDataFromResponceError(err, 'msg');
          showErrorDialog(
            errorMessage || localization.WEBSITES.textWebsiteUpdatingUnsuccessful,
          );
          Logger.error(new Error('Error updating website'), { error: err }, [
            'UpdatingWebsiteFailed',
            errorMessage || `Can not delete ${fieldName}`,
          ]);
        }
        this.setState({ [`is${fieldName}Uploading`]: false });
      }
      const imageData = { ...this.state.imageData };
      delete imageData[fieldName];
      this.setState({
        imageData,
        website: { ...this.state.website, [fieldName]: null },
      });
    }
  };

  /** *************** */
  /** ***** SEO ***** */
  /** *************** */
  changeGoogleAnaliticsIdentifier = (e) => {
    const { value } = e.currentTarget;

    if (!value || isValidGoogleIdentifier(value) === true) {
      const errors = { ...this.state.errors };
      delete errors.googleAnalyticsIdentifier;
      this.setState({
        errors,
      });
    } else {
      this.setState({
        errors: { ...this.state.errors, googleAnalyticsIdentifier: isValidGoogleIdentifier(value) },
      });
    }

    this.setState({
      website: { ...this.state.website, googleAnalyticsIdentifier: value },
    });
  };

  saveGoogleAnaliticsIdentifier = (e) => {
    const { errors } = this.state;
    if (!errors.googleAnalyticsIdentifier) {
      this.updateWebsite({ googleAnalyticsIdentifier: e.currentTarget.value });
    }
  };

  changeCustomGalleryTitle = (e) => {
    this.setState({
      website: { ...this.state.website, customGalleryTitle: e.currentTarget.value },
    });
  };

  saveCustomGalleryTitle = (e) => {
    this.updateWebsite({ customGalleryTitle: e.currentTarget.value });
  };

  render() {
    const { props, state } = this;
    const { isNew, isSiteProcessing, website } = state;
    const { createdAt } = website || {};
    const currentTabConfig = this.configTabs.find((n) => n.id === props.actTab);

    const title = !state.collection
      ? ''
      : state.isNew
        ? `${localization.WEBSITES.textCreateWebsite}: ${decodeURIComponent(state.collection.name)}`
        : `${localization.WEBSITES.textUpdateWebsite}: ${decodeURIComponent(state.collection.name)}`;
    const activeTabTitle = !this.isMobile ? [title, currentTabConfig.title] : [title];

    return (
      <div className="pageWrapper wrapperPageWebsites">
        <div className="page pageWebsites">
          <ToolbarScreenTop title={activeTabTitle} onClose={this.destroy} helpLink="websites" />
          <div className="pageContent pageVertical">
            <aside className="pageSidebar">
              <ScreenTab
                name="WebSite"
                configTabs={this.configTabs}
                rootPath={`/websites/${this.props.collectionId}`}
                actTab={props.actTab}
                extraContent={(
                  <MenuItemButton
                    isSiteProcessing={isSiteProcessing}
                    isActive={!isNew}
                    createdAt={createdAt}
                    toggleWebsitePublish={this.toggleWebsitePublish}
                  />
                )}
              />
            </aside>
            <div className="pageInnerContent">
              <MenuItemButton
                isSiteProcessing={isSiteProcessing}
                isActive={!isNew}
                createdAt={createdAt}
                toggleWebsitePublish={this.toggleWebsitePublish}
              />
              <Choose>
                <When condition={this.state.loading || !state.collection}>
                  <SkeletonItem />
                </When>
                <Otherwise>
                  <div className="pageContainer">{currentTabConfig.content()}</div>
                </Otherwise>
              </Choose>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const ConnectedWebsiteIndex = connect(
  (state, props) => ({
    assetsLength: state.assets.items.length,
    team: state.user.team,
    roles: state.roles.items,
    teammates: state.teammates.items,
    collections: state.collections.collections,
    websites: state.collections.collections.websites.nodes,
    user: state.user,
    collectionId: props.match.params.tagId,
    actTab: state.router.location.query.tab || 'main',
  }),
  (dispatch) => ({
    collectionsActions: bindActionCreators(collectionsActions, dispatch),
  }),
)(withErrorBoundary(WebsiteIndex, { className: 'errorBoundaryPage' }));

export default ConnectedWebsiteIndex;
