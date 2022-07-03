import React from 'react';

import { ImagePicker, Checkbox, Textarea, ColorPicker } from '../../../UIComponents'; // eslint-disable-line
import { Provider, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Api from '../../../api/team';
import * as utils from '../../../shared/utils';
import localization from '../../../shared/strings';
import Logger from '../../../services/Logger';
import Icon from '../../Icon';
import { showUploadFileErrorDialog } from '../../../helpers/fileUploader';
import UpgradePlan from '../../UpgradePlan';

import store from '../../../store';
import * as actions from '../../../store/actions/user';
import TeamPage from './TeamPage';
import { navigate } from '../../../helpers/history';
import { showErrorDialog } from '../../dialog';
import {
  changeFavicon,
} from '../../../store/helpers/user';

const DEFAULT_ACCENT_COLOR = '#fc0';
const DEFAULT_BACKGROUND_COLOR = '#000';

const LOGO_SIZE_LIMIT = 1024 * 1024; /** 1mb */
const BACKGROUND_SIZE_LIMIT = 5 * 1024 * 1024; /** 5mb */
const FAVICON_SIZE_LIMIT = 1024 * 500; /** 0.5mb */

class Branding extends React.Component {
  state = {
    copyright: this.props.team.copyright || '',
    policies: {},
    teamDomains: [],
    logoUploadInProgress: false,
    backgroundUploadInProgress: false,
    faviconUploadInProgress: false,
  };

  static getDerivedStateFromProps(nextProps, state) {
    const { team } = nextProps;
    if (team.policies !== state.policies) {
      let domains = (team.policies.domains || []).map((domain) => domain.name);
      if (team.loginPageUrl) {
        const loginPageDomain = team.loginPageUrl.split('/')[0];
        if (!domains.includes(loginPageDomain)) {
          domains = [...new Set([...domains, loginPageDomain])];
        }
      }
      if (team.signupPageUrl) {
        const signupPageDomain = team.signupPageUrl.split('/')[0];
        if (!domains.includes(signupPageDomain)) {
          domains = [...new Set([...domains, signupPageDomain])];
        }
      }
      return {
        policies: team.policies,
        teamDomains: domains,
      };
    }
    return null;
  }

  saveSettings = async (key, value, local) => {
    this.props.userActions.updateTeamValue(key, value);

    if (local) return;
    Logger.log('User', 'BrandingChangeSettings', key);

    const {
      logoUrl,
      backgroundImgUrl,
      faviconUrl,
      accentColor = DEFAULT_ACCENT_COLOR,
      backgroundColor = DEFAULT_BACKGROUND_COLOR,
      copyright,
      loginPageEnable,
      signupPageEnable,
      downloadPageEnable,
      loginPageUrl,
      signupPageUrl,
      appBrandedLogoEnable,
    } = this.props.team;

    let data = {
      logoUrl,
      backgroundImgUrl,
      faviconUrl,
      accentColor,
      backgroundColor,
      copyright,
      loginPageEnable,
      signupPageEnable,
      downloadPageEnable,
      loginPageUrl,
      signupPageUrl,
      appBrandedLogoEnable,
    };

    data = { ...data, [key]: value };

    try {
      await Api.updateBrandingSettings(data);
    } catch (err) {
      let errorMessage = localization.TEAMMATES.BRANDING.errorSavingSettings;
      const errorSubcode = utils.getDataFromResponceError(err, 'subcode');
      if (
        errorSubcode === 'CustomDomainAlreadyInUseError'
        || errorSubcode === 'LoginPathIsWrong'
        || errorSubcode === 'SignupPathIsWrong'
      ) {
        errorMessage = utils.getDataFromResponceError(err, 'msg');
      }
      if (errorSubcode === 'AliasAlreadyInUse') {
        errorMessage = localization.TEAMMATES.BRANDING.errorDomainMessage(value);
      }
      showErrorDialog(errorMessage);
      Logger.error(new Error('Can not save branding settings'), { error: err }, [
        'CantSaveBrandingSettings',
        (err && err.message) || 'NoMessage',
      ]);
    }
  };

  handleAccentColorChangeComplete = async (color) => {
    await this.saveSettings('accentColor', color);
  };

  handleBackgroundColorChangeComplete = async (color) => {
    await this.saveSettings('backgroundColor', color);
  };

  handleDownloadPageEnable = async (value) => {
    await this.saveSettings('downloadPageEnable', value);
  };

  handleAppBrandedLogoEnable = async (value) => {
    await this.saveSettings('appBrandedLogoEnable', value);
  };

  uploadLogo = async (file) => {
    Logger.log('User', 'BrandingChangeSettings', 'logoUrl');
    const data = new FormData();
    data.append('file', file);
    try {
      this.setState({ logoUploadInProgress: true });
      const response = await Api.uploadLogo(data).promise;
      this.saveSettings('logoUrl', response.url, true);
    } catch (err) {
      showUploadFileErrorDialog(err);
      Logger.error(new Error('Can not save branding settings'), { error: err }, [
        'CantSaveBrandingSettings',
        (err && err.message) || 'Can not update logo',
      ]);
    }
    this.setState({ logoUploadInProgress: false });
  };

  deleteLogo = async () => {
    Logger.log('User', 'BrandingChangeSettings', 'logoUrl');
    this.setState({ logoUploadInProgress: true });
    try {
      await Api.deleteLogo();
      this.saveSettings('logoUrl', null);
    } catch (err) {
      Logger.error(new Error('Can not save branding settings'), { error: err }, [
        'CantSaveBrandingSettings',
        (err && err.message) || 'Can not delete logo',
      ]);
    }
    this.setState({ logoUploadInProgress: false });
  };

  uploadBackground = async (file) => {
    Logger.log('User', 'BrandingChangeSettings', 'backgroundImgUrl');
    const data = new FormData();
    data.append('file', file);
    try {
      this.setState({ backgroundUploadInProgress: true });
      const response = await Api.uploadBackground(data).promise;
      this.saveSettings('backgroundImgUrl', response.url, true);
    } catch (err) {
      showUploadFileErrorDialog(err);
      Logger.error(new Error('Can not save branding settings'), { error: err }, [
        'CantSaveBrandingSettings',
        (err && err.message) || 'Can not update background',
      ]);
    }
    this.setState({ backgroundUploadInProgress: false });
  };

  deleteBackground = async () => {
    Logger.log('User', 'BrandingChangeSettings', 'backgroundImgUrl');
    this.setState({ backgroundUploadInProgress: true });
    try {
      await Api.deleteBackground();
      this.saveSettings('backgroundImgUrl', null);
    } catch (err) {
      Logger.error(new Error('Can not save branding settings'), { error: err }, [
        'CantSaveBrandingSettings',
        (err && err.message) || 'Can not delete background',
      ]);
    }
    this.setState({ backgroundUploadInProgress: false });
  };

  uploadFavicon = async (file) => {
    Logger.log('User', 'BrandingChangeSettings', 'faviconUrl');
    const data = new FormData();
    data.append('file', file);
    try {
      this.setState({ faviconUploadInProgress: true });
      const response = await Api.uploadFavicon(data).promise;
      this.saveSettings('faviconUrl', response.url, true);

      changeFavicon(response.url);
    } catch (err) {
      showUploadFileErrorDialog(err);
      Logger.error(new Error('Can not save branding settings'), { error: err }, [
        'CantSaveBrandingSettings',
        (err && err.message) || 'Can not update favicon',
      ]);
    }
    this.setState({ faviconUploadInProgress: false });
  };

  deleteFavicon = async () => {
    Logger.log('User', 'BrandingChangeSettings', 'faviconUrl');
    this.setState({ faviconUploadInProgress: true });
    try {
      await Api.deleteFavicon();
      this.saveSettings('faviconUrl', null);
      changeFavicon('https://assets.pics.io/img/favicon/faviconPicsio/favicon.ico');
    } catch (err) {
      Logger.error(new Error('Can not save branding settings'), { error: err }, [
        'CantSaveBrandingSettings',
        (err && err.message) || 'Can not delete favicon',
      ]);
    }
    this.setState({ faviconUploadInProgress: false });
  };

  handleChangeCopyright = (event) => {
    this.setState({ copyright: event.currentTarget.value });
  };

  handleBlurCopyright = (event) => {
    this.saveSettings('copyright', event.currentTarget.value);
  };

  /**
   * handlePageChange
   * @param {String} id
   * @param {String} value
   * @param {Boolean} local
   */
  handlePageChange = (id, value, local) => {
    this.saveSettings(id, value, local);
  };

  render() {
    const { state, props } = this;

    const isTrial = !(new Date() > new Date(props.team.trialEnds));
    const isUnsubscribedUser = !props.subscriptionFeatures.planName;
    const isBrandingDisabled = !props.subscriptionFeatures.branding;

    return (
      <div className="pageContainer">
        <If condition={isTrial && isUnsubscribedUser}>
          <div className="pageItem">
            <div className="pageItemTitle">
              Branding terms of use.
              <UpgradePlan tooltip="Please note that branding page functionality is available on Small, Medium and Enterprise plan. <br> Click to Subscribe now." />
            </div>
            <p>
              Please note that branding page functionality is available on Small, Medium and Enterprise plan.{' '}
              <span className="picsioLink" onClick={() => navigate('/billing?tab=overview')}>
                Subscribe now
              </span>{' '}
              to keep using it after trial expires.
            </p>
          </div>
        </If>
        <If condition={isBrandingDisabled}>
          <div className="pageItem">
            <div className="pageItemTitle">Change your plan.{' '}
              <UpgradePlan tooltip="Please note that branding page functionality is available on Small, Medium and Enterprise plan. <br> Click to Subscribe now." />
            </div>
          </div>
        </If>
        <div className="website-customization">
          <div className="website-customization-photo">
            <ImagePicker
              title="Logo"
              btnText={localization.WEBSITES.textUploadLogo}
              icon="circle"
              description={localization.TEAMMATES.BRANDING.logoUploader}
              value={props.team.logoUrl}
              onChange={this.uploadLogo}
              onRemove={this.deleteLogo}
              disabled={isBrandingDisabled}
              accept="image/jpg,image/jpeg,image/png,image/gif"
              showSpinner={state.logoUploadInProgress}
              maxFileSize={LOGO_SIZE_LIMIT}
            />
            <ImagePicker
              title="Background"
              btnText={localization.WEBSITES.textUploadBackground}
              icon="emptyBackgroundLoginPage"
              description={localization.TEAMMATES.BRANDING.backgroundUploader}
              value={props.team.backgroundImgUrl}
              onChange={this.uploadBackground}
              onRemove={this.deleteBackground}
              disabled={isBrandingDisabled}
              accept="image/jpg,image/jpeg,image/png,image/gif"
              showSpinner={state.backgroundUploadInProgress}
              maxFileSize={BACKGROUND_SIZE_LIMIT}
            />
            <ImagePicker
              title="Favicon"
              btnText={localization.WEBSITES.textUploadFavicon}
              icon="emptyBackgroundLoginPage"
              description={localization.TEAMMATES.BRANDING.faviconUploader}
              value={props.team.faviconUrl}
              onChange={this.uploadFavicon}
              onRemove={this.deleteFavicon}
              disabled={isBrandingDisabled}
              accept="image/x-icon,image/vnd.microsoft.icon,image/png"
              showSpinner={state.faviconUploadInProgress}
              maxFileSize={FAVICON_SIZE_LIMIT}
            />
          </div>
          <div className="website-customization-fields">
            <div className="pageItem">
              <div className="pageItemBlock">
                <div className="pageItemTitle">{localization.TEAMMATES.BRANDING.titleAccentColor}</div>
                <p>{localization.TEAMMATES.BRANDING.descriptionAccentColor}</p>
                <ColorPicker
                  initialColor={props.team.accentColor || DEFAULT_ACCENT_COLOR}
                  onColorChangeComplete={this.handleAccentColorChangeComplete}
                  disabled={isBrandingDisabled}
                />
              </div>
              <div className="pageItemBlock">
                <div className="pageItemTitle">{localization.TEAMMATES.BRANDING.titleBackgroundColor}</div>
                <p>{localization.TEAMMATES.BRANDING.descriptionBackgroundColor}</p>
                <ColorPicker
                  initialColor={props.team.backgroundColor || DEFAULT_BACKGROUND_COLOR}
                  onColorChangeComplete={this.handleBackgroundColorChangeComplete}
                  disabled={isBrandingDisabled}
                />
              </div>
              <div className="pageItemBlock">
                <div className="pageItemTitle">{localization.TEAMMATES.BRANDING.titleAppLogo}</div>
                <div className="pageItemCheckbox">
                  <Checkbox
                    label={localization.TEAMMATES.BRANDING.labelBrandedLogo}
                    value={props.team.appBrandedLogoEnable}
                    onChange={this.handleAppBrandedLogoEnable}
                    disabled={isBrandingDisabled}
                  />
                </div>
              </div>
              <div className="pageItemBlock">
                <div className="pageItemTitle">{localization.TEAMMATES.BRANDING.titleCopyright}</div>
                <p>{localization.TEAMMATES.BRANDING.descriptionCopyright}</p>
                <Textarea
                  isDefault
                  className="noResize heightAuto"
                  label={localization.ACCOUNT.inputLabelAbout}
                  value={state.copyright}
                  onChange={this.handleChangeCopyright}
                  onBlur={this.handleBlurCopyright}
                  rows="4"
                  disabled={isBrandingDisabled}
                />
              </div>
              <div className="pageItemBlock">
                <div className="pageItemTitle">{localization.TEAMMATES.BRANDING.titlePages}</div>
                {!state.teamDomains.length && (
                  <div className="warning warningLarge">
                    <div className="warningIcon">
                      <Icon name="warning" />
                    </div>
                    <div className="warningText">
                      Please enter your domain in{' '}
                      <span className="picsioLink" onClick={() => navigate('/teammates?tab=settings')}>
                        Team Settings
                      </span>{' '}
                      to manage your branded pages.
                    </div>
                  </div>
                )}
                <TeamPage
                  label="Enable branded login"
                  defaultPage="signin"
                  pageAccess="loginPageEnable"
                  pageFor="loginPageUrl"
                  domains={state.teamDomains}
                  pageUrl={props.team.loginPageUrl}
                  pageEnabled={props.team.loginPageEnable}
                  handlePageChange={this.handlePageChange}
                  disabled={isBrandingDisabled || !state.teamDomains.length}
                />
                <TeamPage
                  label="Enable branded signup"
                  defaultPage="signup"
                  pageAccess="signupPageEnable"
                  pageFor="signupPageUrl"
                  domains={state.teamDomains}
                  pageUrl={props.team.signupPageUrl}
                  pageEnabled={props.team.signupPageEnable}
                  handlePageChange={this.handlePageChange}
                  disabled={isBrandingDisabled || !state.teamDomains.length}
                />
                <div className="pageItemCheckbox">
                  <Checkbox
                    label={localization.TEAMMATES.BRANDING.labelBrandedDownloadPage}
                    value={props.team.downloadPageEnable}
                    onChange={this.handleDownloadPageEnable}
                    disabled={isBrandingDisabled}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// export default Branding;

const mapStateToProps = (store) => ({
  user: store.user,
  team: store.user.team,
});
const mapDispatchToProps = (dispatch) => ({ userActions: bindActionCreators(actions, dispatch) });
const ConnectedBranding = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Branding);

export default (props) => (
  <Provider store={store}>
    <ConnectedBranding {...props} />
  </Provider>
);
