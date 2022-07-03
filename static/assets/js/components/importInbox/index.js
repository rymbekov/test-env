import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { bool, func } from 'prop-types';
import cn from 'classnames';

import pluralize from 'pluralize';
import Skeleton from 'react-loading-skeleton';
import remove from 'lodash.remove';
import { GoogleReCaptchaProvider, GoogleReCaptcha } from 'react-google-recaptcha-v3';
import * as utils from '../../shared/utils';
import Logger from '../../services/Logger';
import localization from '../../shared/strings';
import ErrorBoundary from '../ErrorBoundary';

import ToolbarInboxTop from '../toolbars/ToolbarInboxTop';
import Icon from '../Icon';

import * as Api from '../../api/inboxes';
import picsioConfig from '../../../../../config';
import { validateFields } from '../../store/inboxApp/actions';

import WithSkeletonTheme from '../WithSkeletonTheme';
import * as helpers from './helpers';
import UploadQueue from './UploadQueue';

import Tooltip from '../Tooltip';
import Placeholder from '../UploadPlaceholder';
import AdditionalFields from './AdditionalFields';
import UploadItemsList from '../UploadItemsList';
import TempItems from '../UploadTempItems';
import Toast from '../Toast';
import { showDialog, showErrorDialog } from '../dialog';
import './styles.scss';

class Import extends React.Component {
  state = {
    canUpload: window.inbox.isProtected || window.inbox.captchaOff,
    inProgress: false,
    inboxName: window.inbox.name,
    groups: {},
    totalSize: '0',
    totalFilesCount: 0,
    totalFilesCountUploadPerSession: 0,
    tmpFilesCount: 0,
    isCaptchaChecking: !window.inbox.isProtected && !window.inbox.captchaOff,
    waitingForValidation: false,
  };

  async componentDidMount() {
    window.addEventListener('importPanel:add', (e) => this.addFiles(e.detail), false);
    this.setDropListeners();
    this.checkUploadQueue();
  }

  componentDidUpdate() {
    const { waitingForValidation } = this.state;
    if (waitingForValidation) this.handleClickUpload(false);
  }

  componentWillUnmount() {
    this.removeDropListeners();
  }

  checkUploadQueue = () => {
    const inboxUploadQueue = utils.LocalStorage.get('inboxUploadQueue');
    if (inboxUploadQueue) {
      const groups = {};
      let totalFilesCount = 0;
      let totalFilesCountUploadPerSession = 0;
      /** prepare files to set inside state */
      Object.keys(inboxUploadQueue).forEach((path) => {
        const notCompletedFiles = inboxUploadQueue[path].filter((file) => !file.complete);
        if (notCompletedFiles.length > 0) {
          notCompletedFiles.forEach((item) => {
            delete item.file;
            delete item.xhr;
            delete item.error;
            item.progress = 0;
            item.shortSize = '?';
            item.numberOfAttempts = 0;
            item.bytesUploaded = 0;
          });
          groups[path] = notCompletedFiles;
          totalFilesCount += notCompletedFiles.length;
          totalFilesCountUploadPerSession += notCompletedFiles.length;
        }
      });

      Logger.log('UI', 'ImportRestoreUploadDialog');
      showDialog({
        title: localization.IMPORT.restoreUpload.title,
        text: localization.IMPORT.restoreUpload.text,
        textBtnCancel: localization.IMPORT.restoreUpload.btnCancel,
        textBtnOk: localization.IMPORT.restoreUpload.btnOk,
        onOk: () => {
          this.setState({ groups, totalFilesCount, totalFilesCountUploadPerSession });
          utils.LocalStorage.remove('inboxUploadQueue');
          Logger.log('User', 'ImportRestoreUploadDialogOk');
        },
        onCancel: () => {
          utils.LocalStorage.remove('inboxUploadQueue');
          Logger.log('User', 'ImportRestoreUploadDialogCancel');
        },
        onClose: () => {},
      });
    }
  };

  /**
   * Receive files
   * @param {Array} files
   * @param {boolean?} alreadyNormalized
   */
  addFiles = async (files, alreadyNormalized = false) => {
    const { state } = this;

    if (state.inProgress) {
      helpers.showBusyDialog();
      return;
    }

    let filesToAdd = files;
    if (!alreadyNormalized) {
      const { normalizedFiles, corruptedFiles } = helpers.normalizeFiles(files, window.inbox);
      filesToAdd = normalizedFiles;

      if (corruptedFiles.length > 0) {
        const { title, text } = localization.IMPORT.corruptedFiles;
        showErrorDialog(
          text(corruptedFiles.map((f) => f.name)), title(corruptedFiles.length),
        );
      }
      if (filesToAdd.length < 1) return;
    }

    const addToState = (resolvedFiles) => {
      const doAdd = () => {
        const groups = { ...state.groups };
        let { totalFilesCount, totalFilesCountUploadPerSession } = state;
        resolvedFiles.forEach((item, index) => {
          item.id = new Date().getTime() + index;
          item.shortSize = utils.bytesToSize(item.file.size);
          if (groups[item.path]) {
            groups[item.path].push(item);
          } else {
            groups[item.path] = [item];
          }
        });
        const totalSize = utils.bytesToSize(helpers.calculateTotalSize(groups));
        totalFilesCount += resolvedFiles.length;
        totalFilesCountUploadPerSession += resolvedFiles.length;

        this.setState({
          groups,
          totalSize,
          totalFilesCount,
          totalFilesCountUploadPerSession,
          tmpFilesCount: 0,
        });
      };
      doAdd();
    };

    const add = async () => {
      /** Find local duplicates */
      const localDuplicates = helpers.findDuplicatedFilesLocal(this.state.groups, filesToAdd);
      const largeFiles = helpers.findLargeFiles(filesToAdd);
      if (localDuplicates.length > 0) {
        /** Show warning */
        showDialog({
          title: 'Files already added',
          text: `The following ${
            localDuplicates.length
          } files are already added for uploading: <ul>${localDuplicates
            .map((file) => `<li>${file.name}</li>`)
            .join('')}</ul><p>Press OK to skip these files and proceed with uploading</p>`,
          textBtnCancel: null,
          textBtnOk: 'Ok',
        });
        /** Remove local duplicates */
        remove(
          filesToAdd,
          (file) => !!localDuplicates.find(
            (duplicate) => duplicate.name === file.path + file.name && duplicate.size === file.file.size,
          ),
        );
        /** If all is duplicates - exit */
        if (filesToAdd.length < 1) return;
      }

      if (largeFiles.length > 0) {
        showDialog({
          title: 'Files size exceed 40GB',
          text: `The following ${largeFiles.length} files are too large for upload: <ul>${largeFiles
            .map((file) => `<li>${file.name}</li>`)
            .join('')}</ul><p>Press ok to skip these files and proceed with upload.</p>`,
          textBtnCancel: null,
          textBtnOk: 'Ok',
        });
        /** Remove large files */
        remove(
          filesToAdd,
          (file) => !!largeFiles.find(
            (largeFile) => largeFile.name === file.path + file.name && largeFile.size === file.file.size,
          ),
        );
        /** If all is large - exit */
        if (filesToAdd.length < 1) return;
      }

      this.setState({ tmpFilesCount: filesToAdd.length });

      const filesToAddFiltered = filesToAdd.filter((file) => file.action !== 'skipFile');
      addToState(filesToAddFiltered);
    };

    add();
  };

  /**
   * Restore file when previous upload not succeded
   * @param {string} groupPath
   * @param {number} itemID
   * @param {File} file
   */
  restoreFile = async (groupPath, itemID, file) => {
    const { groups, totalSize } = await helpers.restoreFile(this.state.groups, groupPath, itemID, file);
    if (groups) {
      this.setState({ groups, totalSize });
    }
  };

  /**
   * Remove file from state
   * @param {number[]} itemIDs
   */
  removeFiles = (itemIDs) => {
    let { totalFilesCount, totalFilesCountUploadPerSession } = this.state;
    const groups = { ...this.state.groups };
    Object.keys(groups).forEach((path) => {
      const length = groups[path].length;
      /** remove items */
      groups[path] = groups[path].filter(({ id }) => !itemIDs.includes(id));
      const removedCount = length - groups[path].length;

      totalFilesCount -= removedCount;
      totalFilesCountUploadPerSession -= removedCount;

      /** delete empty path */
      if (groups[path].length === 0) delete groups[path];
    });
    const totalSize = utils.bytesToSize(helpers.calculateTotalSize(groups));

    this.setState({
      groups, totalSize, totalFilesCount, totalFilesCountUploadPerSession,
    });
  };

  handleChangeInputFile = (event) => {
    const { files } = event.target;
    if (files && files.length > 0) {
      this.addFiles(files);
    }
    event.target.value = '';
  };

  setDropListeners = () => {
    this.$app = document.querySelector('.wrapperPicsioApp');

    this.$app.addEventListener('drop', this.handleDropFiles);
    this.$app.addEventListener('dragenter', this.handleDragEnter);
    this.$app.addEventListener('dragover', this.handleDragOver);
  };

  removeDropListeners = () => {
    if (this.$app) {
      this.$app.removeEventListener('drop', this.handleDropFiles);
      this.$app.removeEventListener('dragenter', this.handleDragEnter);
      this.$app.removeEventListener('dragover', this.handleDragOver);
    }
  };

  /**
   * On drop files
   * @param {DragEvent} event
   */
  handleDropFiles = async (event) => {
    event.preventDefault();
    /** if no permissions */
    if (!this.state.canUpload) return;
    /** if Preview is opened */
    if (document.querySelector('.preview')) return;

    if (event.dataTransfer) {
      const { items } = event.dataTransfer;
      if (items.length) {
        const promises = [];
        for (let i = 0; i < items.length; i++) {
          const entry = items[i].webkitGetAsEntry();
          if (entry) {
            promises.push(helpers.getFilesFromEntry(entry));
          }
        }
        let files;
        try {
          files = await Promise.all(promises);
        } catch (error) {
          Logger.error(new Error('Import: can not handle dropped files'), { error }, [
            'ImportCantHandleDroppedFiles',
            (error && error.message) || 'NoMessage',
          ]);
          showDialog({
            title: localization.IMPORT.cantHandleDroppedFiles.title,
            text: localization.IMPORT.cantHandleDroppedFiles.text,
            textBtnOk: null,
            textBtnCancel: localization.IMPORT.cantHandleDroppedFiles.btnCancel,
          });
        }
        if (files) {
          const { normalizedFiles, corruptedFiles } = helpers.normalizeDroppedFiles(
            files, window.inbox,
          );
          if (normalizedFiles.length > 0) {
            this.addFiles(normalizedFiles, true);
          }
          if (corruptedFiles.length > 0) {
            const { title, text } = localization.IMPORT.corruptedFiles;
            showErrorDialog(
              text(corruptedFiles.map((f) => f.name)),
              title(corruptedFiles.length),
            );
          }
        }
      } else if (event.dataTransfer.files.length) {
        this.addFiles(event.dataTransfer.files);
      }
    }
  };

  /**
   * On drag enter
   * @param {DragEvent} event
   */
  handleDragEnter = (event) => {
    if (event.dataTransfer) {
      event.preventDefault();
      /** if no permissions */
      if (!this.state.canUpload) return;
    }
  };

  handleDragOver = (event) => event.preventDefault(); // Necessary. Allows us to drop

  /** Click on button "Clear" */
  clearItems = () => {
    this.setState({
      groups: {},
      totalSize: '0',
      totalFilesCount: 0,
      totalFilesCountUploadPerSession: 0,
      tmpFilesCount: 0,
    });
    Logger.log('User', 'UploadPanelClearAll');
  };

  handleClickUpload = (needValidation = true) => {
    const { validate, hasErrors } = this.props;
    if (needValidation) {
      validate();
      this.setState({ waitingForValidation: true });
      return;
    }

    this.setState({ waitingForValidation: false });
    if (hasErrors) return;

    Logger.log('User', 'UploadPanelStartUploading', this.state.totalFilesCount);
    if (this.state.totalFilesCount < 1) return;

    const isConsentNeeded = window.inbox.actionConsentEnable;
    if (isConsentNeeded) {
      Logger.log('UI', 'UploadingConsentDialog');
      showDialog({
        title: localization.DIALOGS.DOWNLOAD_CONSENT.TITLE(window.inbox.actionConsentTitle),
        text: localization.DIALOGS.DOWNLOAD_CONSENT.TEXT(window.inbox.actionConsentMessage),
        textBtnCancel: localization.DIALOGS.DOWNLOAD_CONSENT.CANCEL_TEXT,
        textBtnOk: localization.DIALOGS.DOWNLOAD_CONSENT.OK_TEXT,
        onOk: () => {
          Logger.log('User', 'UploadingConsentDialogConfirm');
          /** start */
          this.setState({ inProgress: true });
        },
        onCancel: () => {
          Logger.log('User', 'UploadingConsentDialogReject');
        },
      });
      return;
    }

    /** start */
    this.setState({ inProgress: true });
  };

  /**
   * Handle upload complete
   * @param {number} countUploadedFiles
   * @param {number} totalUploadedSize
   * @param {string[]} inboxNames
   */
  handleUploadComplete = (countUploadedFiles, totalUploadedSize, inboxNames) => {
    if (countUploadedFiles > 0) {
      /** show alert */
      Toast(
        localization.IMPORT.textFilesUploaded({
          value1: countUploadedFiles,
          value2: utils.bytesToSize(totalUploadedSize),
          value3: inboxNames.join(', '),
        }),
        { autoClose: false },
      );
    }

    this.setState({
      inProgress: false,
      // groups: {}, // comment for leave items after upload
      // totalFilesCount: 0, // comment for leave items after upload
      totalFilesCountUploadPerSession: 0,
      totalSize: '0',
    });
  };

  handleUploadCancel = () => {
    this.setState({
      inProgress: false,
    });
  };

  getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  };

  checkCaptcha = async (token) => {
    const result = await Api.checkCaptcha(token);
    this.setState({ isCaptchaChecking: false });
    let attempts = 0;

    const showCaptchaDialog = () => {
      const digitA = this.getRandomInt(1, 10);
      const digitB = this.getRandomInt(1, 10);
      const answer = digitA + digitB;
      const question = `${digitA} + ${digitB}`;
      return showDialog({
        title: localization.DIALOGS.CAPTCHA.TITLE,
        text: localization.DIALOGS.CAPTCHA.TEXT(question),
        textBtnCancel: null,
        textBtnOk: localization.DIALOGS.CAPTCHA.OK_TEXT,
        input: {
          placeholder: '',
        },
        onOk: ({ input }) => {
          attempts = ++attempts;
          if (input === answer.toString()) {
            this.setState({ canUpload: true });
          } else if (attempts < 3) {
            showCaptchaDialog();
          } else {
            showErrorDialog(localization.DIALOGS.CAPTCHA_ERROR.TEXT);
          }
        },
      });
    };

    if (!result.success || result.score <= 0.3) {
      showCaptchaDialog();
    }
    if (result.success) {
      this.setState({ canUpload: true });
    }
  };

  render() {
    const { state, props } = this;
    const isInboxProtected = window.inbox && window.inbox.isProtected;

    return (
      <ErrorBoundary>
        <GoogleReCaptchaProvider useRecaptchaNet reCaptchaKey={picsioConfig.RECAPTCHA_KEY}>
          <div id="import" className="importInbox">
            <div className="importInner">
              {/* TODO: change to "Teamname inbox" */}
              <ToolbarInboxTop title={[`Inbox ${state.inboxName}`]} helpLink="inboxes" />
              <div className="importMain">
                {/* Content */}
                <div className="importContent">
                  <AdditionalFields disabled={state.inProgress} />
                  <div className="importMainLeft">
                    <div className="importInfo">
                      {/* Number of files */}
                      <div
                        className={cn('importNumberFiles', {
                          hideBtn: state.totalFilesCount === 0,
                          hidden: state.inProgress,
                        })}
                      >
                        <span
                          className="btnRemoveImportFile"
                          role="button"
                          tabIndex={0}
                          onClick={this.clearItems}
                          onKeyPress={this.clearItems}
                        >
                          <Icon name="close" />
                        </span>
                        {pluralize('file', state.totalFilesCount, true)}{' '}
                        <span className="forMobile"> to {state.inboxName}</span>
                      </div>
                    </div>
                    {!isInboxProtected && !window.inbox.captchaOff && state.isCaptchaChecking && (
                      <div className="importPlaceholder">
                        <div className="inner">
                          <WithSkeletonTheme>
                            <div className="btnIconUpload">
                              <Skeleton width={100} height={100} />
                            </div>
                            <div>
                              <Skeleton width={287} height={32} />
                            </div>
                            <div>
                              <Skeleton width={260} height={32} />
                            </div>
                          </WithSkeletonTheme>
                          <GoogleReCaptcha onVerify={(token) => this.checkCaptcha(token)} />
                        </div>
                      </div>
                    )}
                    {state.inProgress && (
                      <UploadQueue
                        groups={state.groups}
                        totalFilesCount={state.totalFilesCount}
                        totalFilesCountUploadPerSession={state.totalFilesCountUploadPerSession}
                        onComplete={this.handleUploadComplete}
                        onCancel={this.handleUploadCancel}
                      />
                    )}
                    {!state.inProgress && (state.totalFilesCount > 0 || state.tmpFilesCount > 0) ? (
                      <>
                        <div className="importFiles">
                          {!state.inProgress && (
                            <UploadItemsList
                              groups={state.groups}
                              restoreFile={this.restoreFile}
                              remove={this.removeFiles}
                              isImportPanelShow
                              showCompleted
                            />
                          )}
                          <TempItems count={state.tmpFilesCount} />
                        </div>
                        <div className="importButtons">
                          <div className="importTotalSize">Total: {state.totalSize}</div>
                          <div className="importButtonsGroup">
                            <div
                              className={cn('btnClearPanel picsioDefBtn', {
                                disable: props.hasErrors,
                              })}
                              onClick={this.clearItems}
                            >
                              {localization.IMPORT.textClear}
                            </div>
                          </div>
                          <div className="importButtonsGroup">
                            <div
                              className="btnAddMore picsioDefBtn"
                              onClick={() => Logger.log('User', 'UploadPanelAddMoreFiles')}
                            >
                              {localization.IMPORT.textBrowse}
                              <input
                                id="load-files"
                                onChange={this.handleChangeInputFile}
                                type="file"
                                multiple
                              />
                            </div>
                            {state.totalSize !== '0' && (
                              <Tooltip
                                placement="top"
                                content={props.hasErrors ? localization.IMPORT.textNeedRequiredFields : null}
                              >
                                <div
                                  className={cn('btnStartUploading picsioDefBtn btnCallToAction', {
                                    disable: props.hasErrors,
                                  })}
                                  onClick={this.handleClickUpload}
                                >
                                  <Icon name="upload" />
                                  {localization.IMPORT.textUpload}
                                </div>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      !state.inProgress && state.canUpload && <Placeholder onChange={this.handleChangeInputFile} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GoogleReCaptchaProvider>
      </ErrorBoundary>
    );
  }
}

Import.propTypes = {
  hasErrors: bool.isRequired,
  validate: func.isRequired,
};

export default connect(
  (state) => ({ hasErrors: state.hasErrors }),
  (dispatch) => ({ validate: bindActionCreators({ validateFields }, dispatch).validateFields }),
)(Import);
