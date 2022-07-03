import React from 'react';

import Q from 'q';
import { Button } from '@picsio/ui';
import { bindActionCreators } from 'redux';
import Spinner from '../spinner';
import * as Api from '../../api/team';
import * as utils from '../../shared/utils';
import localization from '../../shared/strings';
import Logger from '../../services/Logger';
import UiBlocker from '../../services/UiBlocker';
import picsioConfig from '../../../../../config';
import ToolbarScreenTop from '../toolbars/ToolbarScreenTop';
import Icon from '../Icon';
import store from '../../store';
import ua from '../../ua';
import { requestMoreStorage, requestMigration } from '../../store/actions/billing';
import Toast from '../Toast';
import { showDialog } from '../dialog';
import { back, reloadApp } from '../../helpers/history';
import sdk from '../../sdk';

const billingActions = bindActionCreators({ requestMoreStorage, requestMigration }, store.dispatch);

export default class View extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      config: {},
    };

    this.user = store.getState().user;
    this.userStorageName = this.user.team.storageType;
    this.workingFolder = this.user.team.workingFolderId;
    this.teamOwnerEmail = this.user.team.email;
    this.workingFolderId = this.user.team.workingFolderId;
    this.picsioStorage = this.user.team.picsioStorage;

    this.spinner = null;
    this.destroy = this.destroy.bind(this);
    this.makeConfig = this.makeConfig.bind(this);
    this.fetch = this.fetch.bind(this);
    this.destroySpinner = this.destroySpinner.bind(this);
    this.initSpinner = this.initSpinner.bind(this);
    this.renderContent = this.renderContent.bind(this);
    this.renderGoogleStats = this.renderGoogleStats.bind(this);
    this.onChangeAccountClick = this.onChangeAccountClick.bind(this);
    this.onChangeTokenClick = this.onChangeTokenClick.bind(this);
  }

  componentDidMount() {
    this.initSpinner();

    Q.all([this.fetch()])
      .spread((storageStats) => {
        this.setState({
          config: this.makeConfig(storageStats),
        });
        this.destroySpinner();
      })
      .catch((err) => {
        Logger.error(
          new Error('Can not load storage stats'),
          { error: err },
          [
            'StorageStatsLoadFailed',
            (err && err.message) || 'NoMessage',
          ],
        );
        Toast(localization.STORAGE.alertCantLoadStat, {
          autoClose: false,
        });
        this.destroySpinner();
      });
  }

  onChangeAccountClick() {
    const url = this.userStorageName === 's3'
      ? '/setup/s3/connect?noBackButton=true'
      : '/setup/selectGoogleDrive';
    Logger.log('User', 'SettingsStorageChangeStorage');
    Logger.log('UI', 'ChangeStorageDialog');
    showDialog({
      icon: 'warning',
      title: localization.DIALOGS.CHANGE_GOOGLE_DRIVE.TITLE,
      text: localization.DIALOGS.CHANGE_GOOGLE_DRIVE.TEXT,
      textBtnCancel: localization.DIALOGS.CHANGE_GOOGLE_DRIVE.CANCEL_TEXT,
      textBtnOk: localization.DIALOGS.CHANGE_GOOGLE_DRIVE.OK_TEXT,
      onOk: () => {
        Logger.log('User', 'ChangeStorageDialogOk');
        if (picsioConfig.ENV === 'production') {
          Api.sendChangeStorageWebhook({
            username: 'Change  google drive',
            fields: [{ title: store.getState().user.email }],
          });
        }
        window.open(url, '_blank');
      },
      onCancel: () => Logger.log('User', 'ChangeStorageDialogCancel'),
    });
  }

  onChangeTokenClick() {
    Logger.log('User', 'SettingsStorageChangeFolder');
    Logger.log('UI', 'ChangeFolderDialog');
    const url = this.userStorageName === 's3'
      ? '/setup/s3/bucketOptions?noBackButton=true'
      : '/setup/selectWorkingFolder?noBackButton=true';
    const phrase = 'erase all data in my library';
    showDialog({
      title: localization.DIALOGS.CHANGE_WORKING_FOLDER.TITLE,
      text:
        typeof localization.DIALOGS.CHANGE_WORKING_FOLDER.TEXT === 'function'
          ? localization.DIALOGS.CHANGE_WORKING_FOLDER.TEXT(this.user.storageType)
          : localization.DIALOGS.CHANGE_WORKING_FOLDER.TEXT,
      textBtnCancel: localization.DIALOGS.CHANGE_WORKING_FOLDER.CANCEL_TEXT,
      textBtnOk: localization.DIALOGS.CHANGE_WORKING_FOLDER.OK_TEXT,
      input: {
        placeholder: '',
      },
      disableOk: ({ input }) => input !== phrase,
      onOk: ({ input }) => {
        if (input === phrase) {
          Logger.log('User', 'ChangeFolderDialogOk');
          if (picsioConfig.ENV === 'production') {
            Api.sendChangeStorageWebhook({
              username: 'Change  working folder',
              fields: [{ title: store.getState().user.email }],
            });
          }
          window.open(url, '_blank');
        }
      },
      onCancel: () => Logger.log('User', 'ChangeFolderDialogCancel'),
    });
  }

  initSpinner() {
    this.destroySpinner();
    this.spinner = new Spinner({
      parentEl: document.querySelector('.pageContent'),
      classList: ['partial'],
      styleList: {
        'z-index': '11',
      },
    });
  }

  destroySpinner() {
    this.spinner && this.spinner.destroy();
  }

  fetch() {
    return Q(Api.getStorageMetrics());
  }

  makeConfig(stats) {
    if (!stats.googleDriveAccount) stats.googleDriveAccount = {};
    if (!stats.workingFolderName) stats.workingFolderName = this.workingFolder;
    if (!stats.googleDriveQuota) stats.googleDriveQuota = {};

    const config = {
      email: stats.googleDriveAccount.email || this.teamOwnerEmail,
      workingFolderName: stats.workingFolderName,
      statsGoogle: stats.googleDriveQuota,
    };

    if (config.statsGoogle) {
      config.statsGoogle.usageWithoutTrash = Number(config.statsGoogle.usage) - Number(config.statsGoogle.usageInDriveTrash);
      config.Full = config.statsGoogle.limit
        ? utils.bytesToSize(Number(config.statsGoogle.limit))
        : 'Unlimited';
      config.FreeSize = utils.bytesToSize(
        Number(config.statsGoogle.limit) - Number(config.statsGoogle.usage),
      );
      config.TrashedSize = utils.bytesToSize(Number(config.statsGoogle.usageInDriveTrash));
      config.Usage = utils.bytesToSize(Number(config.statsGoogle.usage));
      config.UsagePercent = utils.getPercent(config.statsGoogle.limit, config.statsGoogle.usage);
      config.UsageWithoutTrash = utils.bytesToSize(config.statsGoogle.usageWithoutTrash);
      config.UsageWithoutTrashPercent = utils.getPercent(
        config.statsGoogle.limit,
        config.statsGoogle.usageWithoutTrash,
      );
      config.TrashedPercent = utils.getPercent(
        config.statsGoogle.limit,
        config.statsGoogle.usageInDriveTrash,
      );
      config.FreeSizePercent = utils.getPercent(
        config.statsGoogle.limit,
        config.statsGoogle.limit - config.statsGoogle.usage,
      );
      config.quotientRealUsage = config.statsGoogle.limit
        ? config.statsGoogle.usageWithoutTrash / Number(config.statsGoogle.limit)
        : config.statsGoogle.usageWithoutTrash / Number(config.statsGoogle.usage);
    }

    if (stats.quota && stats.quota.usage !== undefined) {
      const { usage, limit } = stats.quota;
      const usageSize = utils.bytesToSize(Number(usage));
      const storageGB = utils.convertUnit(limit, 'B', 'GB');
      const isGB = storageGB <= 200;
      const to = isGB ? 'GB' : 'TB';
      const availableSize = `${utils.convertUnit(limit - usage, 'B', to)} ${to}`;

      config.storageStats = {
        usageSize,
        availableSize,
      };
    }

    return config;
  }

  destroy() {
    Logger.log('User', 'SettingsGoogleDriveHide', 'SettingsStorageHide');
    back();
  }

  handleRequestMoreStorageClick = () => {
    Logger.log('User', 'SettingsStorageRequestStorage');
    billingActions.requestMoreStorage();
  }

  changeStorage = async () => {
    try {
      UiBlocker.block(localization.STORAGE.resetingStorage);
      const { data } = await sdk.users.resetStorage();
      if (data.success) {
        reloadApp();
      }
      UiBlocker.unblock();
    } catch (err) {
      UiBlocker.unblock();
      Logger.error(
        new Error('Can not reset storage type'),
        { error: err },
        [
          'StorageResetFailed',
          (err && err.message) || 'NoMessage',
        ],
      );
      Toast(localization.STORAGE.alertCantReset, {
        autoClose: false,
      });
    }
  }

  handleChangeStorageClick = async () => {
    Logger.log('User', 'SettingsStorageResetStorage');
    Logger.log('UI', 'SettingsStorageResetStorageDialog');
    const { title, text, textBtnOk } = localization.STORAGE.DIALOG_RESET_STORAGE;
    showDialog({
      title,
      text,
      textBtnOk,
      onOk: () => {
        Logger.log('User', 'SettingsStorageResetStorageDialogOk');
        this.changeStorage();
      },
      onCancel: () => Logger.log('User', 'SettingsStorageResetStorageDialogCancel'),
    });
  }

  handleRequestMigrationClick = (storageName) => {
    Logger.log('User', 'SettingsStorageRequestMigration', { storageName });
    billingActions.requestMigration({ storageName });
  }

  renderContent() {
    const { config } = this.state;
    const googleDriveFolder = `https://drive.google.com/drive/u/2/folders/${this.workingFolder}`;

    return (
      <div>
        <div className="storageTools">
          <div className="storageTool storageToolsEmail">
            <Choose>
              <When condition={this.userStorageName === 's3'}>
                <img
                  src="https://assets.pics.io/img/s3.svg"
                  style={{ width: '24px', height: '24px', top: '-2px' }}
                  className="svg-icon icon"
                  alt="Amazon S3 logo"
                />
              </When>
              <Otherwise>
                <img
                  src="https://assets.pics.io/img/gd.svg"
                  style={{ width: '23px', height: '19px', top: '0' }}
                  className="svg-icon icon"
                  alt="Google drive logo"
                />
              </Otherwise>
            </Choose>
            <div
              dangerouslySetInnerHTML={{
                __html: utils.sanitizeXSS(localization.STORAGE.textConnectedTo(config.email)),
              }}
            />
            <If condition={!ua.isMobileApp()}>
              <span className="changeLink" onClick={this.onChangeAccountClick}>
                {localization.STORAGE.textChange}
              </span>
            </If>
          </div>
          <div className="storageTool storageToolsFolder">
            <Icon name="folderFull" />

            <div
              dangerouslySetInnerHTML={{
                __html: utils.sanitizeXSS(
                  localization.STORAGE.textFolderConnectedTo({
                    name: config.workingFolderName,
                    linkToGoogleDriveFolder: googleDriveFolder,
                    storageType: this.userStorageName,
                  }),
                  {
                    ALLOWED_TAGS: ['a'],
                    ALLOWED_ATTR: ['target', 'class', 'href'],
                  },
                ),
              }}
            />

            <If condition={!ua.isMobileApp()}>
              <span className="changeLink" onClick={this.onChangeTokenClick}>
                {localization.STORAGE.textChange}
              </span>
            </If>
          </div>
        </div>
      </div>
    );
  }

  renderGoogleStats() {
    const { config } = this.state;

    return (
      <div className="storage-info__block">
        <span className="storage-info__column-title">
          <Choose>
            <When condition={config.statsGoogle.limit}>
              <div
                dangerouslySetInnerHTML={{
                  __html: utils.sanitizeXSS(localization.STORAGE.textSizeTotal(
                    config.Full,
                    this.userStorageName
                  )),
                }}
              />
            </When>
            <Otherwise>
              <div
                dangerouslySetInnerHTML={{
                  __html: utils.sanitizeXSS(localization.STORAGE.textGDSizeUnlimited),
                }}
              />
            </Otherwise>
          </Choose>
        </span>
        <If condition={config.statsGoogle.limit}>
          <ul className="storage-info__list">
            <li>
              <span>{config.UsageWithoutTrash}</span> {localization.STORAGE.textUsedWithoutTrash} —{' '}
              {config.UsageWithoutTrashPercent}
            </li>
            <li>
              <span>{config.FreeSize}</span> {localization.STORAGE.textFree} — {config.FreeSizePercent}
            </li>
            <li>
              <span>{config.TrashedSize}</span> {localization.STORAGE.textTrashed} — {config.TrashedPercent}
            </li>
          </ul>
        </If>
        {/* Unlimited GD */}
        <If condition={!config.statsGoogle.limit}>
          <ul className="storage-info__list">
            <li>
              <span>{config.UsageWithoutTrash}</span> {localization.STORAGE.textUsedWithoutTrash}
            </li>
            <li>
              <span>{config.TrashedSize}</span> {localization.STORAGE.textTrashed}
            </li>
          </ul>
        </If>
      </div>
    );
  }

  renderPicsioStorageStats() {
    const { config } = this.state;
    const { subscriptionFeatures = {}, team = {}, storageName } = this.user;
    const title = localization.STORAGE.title(storageName);
    const { usageSize, availableSize } = config.storageStats || {};
    const { planId, externalStorage } = subscriptionFeatures;
    const isTrialUser = planId === 'trial';

    return (
      <div className="storage-info__block">
        <span className="storage-info__column-title">
          {title}
        </span>
        <span className="storage-info__list">
          <ul className="storage-info__list">
            <li>
              <span>{usageSize}</span> {localization.STORAGE.textUsed}
            </li>
            <li>
              <span>{availableSize}</span> {localization.STORAGE.textAvailable}
            </li>
          </ul>
        </span>
        <div className="storage-info__button">
          <Choose>
            <When condition={isTrialUser && externalStorage}>
              <Button
                variant="contained"
                component="button"
                color="primary"
                size="md"
                onClick={this.handleChangeStorageClick}
              >
                {localization.STORAGE.textChangeStorage}
              </Button>
            </When>
            <When condition={!isTrialUser}>
              <Button
                variant="contained"
                component="button"
                color="primary"
                size="md"
                onClick={this.handleRequestMoreStorageClick}
              >
                {localization.STORAGE.textRequestMoreStorage}
              </Button>
            </When>
            <Otherwise>
              {null}
            </Otherwise>
          </Choose>
        </div>
        {/* <div className="storage-info__additional">
          <div>{localization.STORAGE.textLabelMigration}</div>
          <Button
            variant="text"
            component="button"
            color="primary"
            size="md"
            onClick={() => this.handleRequestMigrationClick('Google Drive')}
          >
            {localization.STORAGE.textRequestMigrationGD}
          </Button>
          <br />
          <Button
            variant="text"
            component="button"
            color="primary"
            size="md"
            onClick={() => this.handleRequestMigrationClick('Amazon S3')}
          >
            {localization.STORAGE.textRequestMigrationS3}
          </Button>
        </div> */}
      </div>
    );
  }

  render() {
    const { config } = this.state;
    const showStorageStats = this.picsioStorage && config.storageStats;

    return (
      <div className="page pageStorage">
        <ToolbarScreenTop title={[localization.STORAGE.title()]} onClose={this.destroy} helpLink="storage" />
        <div className="pageContent">
          <div className="pageInnerContent">
            <If condition={(config.statsGoogle || config.statsPicsio) && !this.picsioStorage}>
              {this.renderContent()}
            </If>
            <div className="storage-info">
              <div className="storage-info__column">
                <If condition={this.userStorageName !== 's3' && config.statsGoogle}>
                  {this.renderGoogleStats()}
                </If>
                <If condition={showStorageStats}>
                  {this.renderPicsioStorageStats()}
                </If>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
