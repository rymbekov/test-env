import React from 'react';
import { connect } from 'react-redux';
import {
  func, array, object, string, number,
} from 'prop-types';
import Q from 'q';

import remove from 'lodash.remove';
import throttle from 'lodash.throttle';
import isEmpty from 'lodash.isempty';
import uniq from 'lodash.uniq';
import pluralize from 'pluralize';
import localization from '../../shared/strings';
import * as utils from '../../shared/utils';

import Logger from '../../services/Logger';
import queue from './libs/queue';

import ua from '../../ua';
import showAssetsLimitExceededDialog from '../../helpers/showAssetsLimitExceededDialog';

import UploadItemsList from '../UploadItemsList';
import * as helpers from './helpers';
import { handleErrors } from '../../helpers/errorHandler';
import { showDialog } from '../dialog';

class UploadQueue extends React.Component {
  constructor(props) {
    super(props);

    this.queueManager = queue.getPoolTaskRunner({
      simultaneously: 5,
    });

    this.state = {
      groups: props.groups,
      totalSize: helpers.calculateTotalSize(props.groups),
      totalFilesCount: props.totalFilesCount,
      totalFilesCountUploadPerSession: props.totalFilesCountUploadPerSession,
      uploadedSize: 0,
      statusText: null,
      additionalFields: {
        comment: props.comment,
        title: props.title,
        description: props.description,
        keywordsIds: [],
        assigneeIds: [],
        flag: props.flag,
        color: props.color,
        rating: props.rating,
        selectedCustomFields: props.selectedCustomFields,
      },
    };
    this.errorsCount = 0;
    this.filesCompleted = 0;
    this.handleUploadingProgress = throttle(this.handleUploadingProgress, 250);
    this.uploadId = Date.now();
  }

  async componentDidMount() {
    window.addEventListener('beforeunload', this.unloadListener);

    if (isEmpty(this.state.groups)) {
      this.onComplete();
    } else {
      let defaultLocalStorageSize = 1024 * 10;
      const family = ua.browser.family.toLowerCase();
      if (family === 'safari' || family === 'mobile safari') {
        defaultLocalStorageSize = 1024 * 5;
      }

      // if weight groups object is more than default LocalStorage size, we show warning dialog
      const groupSizeWhenFinishedUpload = ((((JSON.stringify(this.props.groups).length || 0) + ('inboxUploadQueue'.length || 0)) * 2) / 1024).toFixed(2)
        * 1.35; // 1.35 - factor of increase when all files finished loading.

      if (groupSizeWhenFinishedUpload > defaultLocalStorageSize) {
        const logData = {
          collectionsLength: Object.keys(this.state.groups).length,
          totalFilesCount: this.state.totalFilesCount,
        };
        Logger.log('UI', 'ImportManyAssetsDialog', logData);
        showDialog({
          title: localization.IMPORT.toManyAssetsForUpload.title,
          text: localization.IMPORT.toManyAssetsForUpload.text,
          textBtnCancel: null,
          onCancel: () => this.props.onCancel(),
          textBtnOk: localization.IMPORT.toManyAssetsForUpload.btnOk,
          onOk: () => this.props.onCancel(),
          style: { maxWidth: 525 },
        });
        return;
      }
      this.start();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.unloadListener);
  }

  /**
   * Save to localStorage
   * @param {Object} groups
   */
  saveToLocalStorage = (groups) => {
    utils.LocalStorage.set('inboxUploadQueue', groups);
  };

  unloadListener = (event) => {
    event.returnValue = 'Changes you made may not be saved.';
  };

  start = async () => {
    this.queueStarted = true;
    this.lastIntProgress = 0;
    window.dispatchEvent(
      new CustomEvent('import:uploading:progress', { detail: { percantage: 0, ElParent: '#button-upload' } }),
    );
    this.errorsCount = 0;
    const { groups } = this.state;

    Object.keys(groups).forEach((path) => {
      groups[path].forEach((item) => {
        // if we restarted queue
        if (item.complete) return;

        item.bytesUploaded = 0;
        item.progress = 0;
        item.error = null;

        this.addToQueue(item);
      });
    });

    this.saveToLocalStorage(groups);
    this.forceUpdate();
  };

  addToQueue = (item) => {
    const { groups, additionalFields } = this.state;
    const self = this;
    /** @type {boolean} */

    item.bytesUploaded = 0;
    item.progress = 0;
    item.error = null;
    this.handleUploadingProgress();

    this.queueManager.addTask({
      /** @param {Function} next */
      async task(next) {
        /** if user cancels upload */
        if (item.cancelled) {
          next();
          return;
        }
        /** if restored upload and file not choosen */
        if (!item.file) {
          item.error = {
            code: 0,
            reason: 'fileNotChoosen',
            message: 'File for restore not choosen',
          };

          self.errorsCount += 1;
          self.handleUploadingProgress();
          self.saveToLocalStorage(groups);

          if (self.errorsCount + self.filesCompleted === self.state.totalFilesCountUploadPerSession) self.onComplete();
          next();
          return;
        }

        /** Upload to Storage */
        try {
          await self.uploadFile(item, additionalFields);
        } catch (error) {
          console.log('/** Upload to Storage */ error: ', error);
          if (!item.cancelled) {
            Logger.info(`Error upload asset [size: ${item.size}] to inbox: `, error);
            if (!error.reason) {
              item.error = {
                code: 408,
                reason: 'networkError',
                message: 'Network Error',
              };
            } else {
              item.error = error;
            }

            self.errorsCount += 1;
            item.bytesUploaded = 0;
            item.progress = 0;
          } else {
            Logger.info(`file [${item.file.name}] cancelled`);
          }

          self.handleUploadingProgress();
          self.saveToLocalStorage(groups);

          if (self.errorsCount + self.filesCompleted === self.state.totalFilesCountUploadPerSession) {
            self.onComplete();
          }
          next();
          return;
        }

        item.bytesUploaded = item.file.size;
        item.progress = 100;
        item.complete = true;
        delete item.xhr;
        delete item.path;

        self.filesCompleted += 1;

        self.saveToLocalStorage(groups);
        self.handleUploadingProgress();

        /** if all files done */
        if (self.filesCompleted + self.errorsCount === self.state.totalFilesCountUploadPerSession) {
          self.onComplete();
        }

        next();
      },
    });
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

  calculateUploadedSize(state) {
    return Object.keys(state.groups).reduce((total, groupPath) => total + state.groups[groupPath].reduce((total, item) => total + (item.bytesUploaded || 0), 0), 0);
  }

  handleUploadingProgress = () => {
    const totalUploaded = this.calculateUploadedSize(this.state);
    // change ui only with int values
    const totalPercent = Math.floor((totalUploaded * 100) / this.state.totalSize);
    if (this.lastIntProgress !== totalPercent) {
      this.lastIntProgress = totalPercent;
      window.dispatchEvent(
        new CustomEvent('import:uploading:progress', {
          detail: { percantage: totalPercent, ElParent: '#button-upload' },
        }),
      );
    }
    if (!this.isCompleted) {
      this.setState({ uploadedSize: totalUploaded });
    }
  };

  uploadFile = (item, additionalFields) => {
    /** @type {number} */
    let numberOfAttempts = 0;
    const deferred = Q.defer();

    const upload = async () => {
      numberOfAttempts += 1;
      item.progress = 0;
      item.bytesUploaded = 0;
      item.numberOfAttempts = numberOfAttempts;

      try {
        const gdAsset = await helpers.uploadFile(item.file, additionalFields, ({ xhr, percentage }) => {
          item.xhr = xhr;
          item.progress = percentage;
          item.bytesUploaded = (item.file.size * percentage) / 100;

          this.handleUploadingProgress();
        });
        deferred.resolve(gdAsset);
      } catch (err) {
        handleUploadError(err);
      }
    };

    function handleUploadError(response) {
      const errorMessage = utils.getDataFromResponceError(response.error, 'message');
      const errorCode = utils.getDataFromResponceError(response.error, 'code');

      if (errorCode === 409 && errorMessage.startsWith('Assets limit')) {
        showAssetsLimitExceededDialog();
      }

      if (errorCode === 402 && errorMessage.startsWith('Uploads denied by subscription limits')) {
        showDialog({
          text: 'Not enough space in your storage.',
          title: 'Cannot upload an asset',
        });
      }

      if (errorCode && errorMessage) {
        Logger.error(
          new Error('Import: error from the server'),
          { error: errorMessage },
          ['InboxBadResponseFromTheServer'],
        );
        deferred.reject({
          code: errorCode,
          reason: 'errorFromTheServer',
          message: errorMessage,
        });
        return;
      }

      /** if normal google response */
      if (response.error && response.error.code) {
        const { code, errors, message } = response.error;
        const { reason } = errors[0];
        const errorData = {
          code,
          reason,
          message,
        };

        if (code === 401 && numberOfAttempts < 2) {
          upload();
        } else if (
          (code === 429
            || code === 500
            || (code === 403 && (reason === 'userRateLimitExceeded' || reason === 'rateLimitExceeded')))
          && numberOfAttempts < 11
        ) {
          /** Exponential backoff */
          setTimeout(upload, 500 * numberOfAttempts);
        } else {
          deferred.reject(errorData);
        }
      } else if (!window.navigator.onLine) {
        /** if user offline */
        deferred.reject({
          code: 403,
          reason: 'slowConnection',
          message: 'No internet',
        });
      } else if (response.reason === 'slowConnection' || response.reason === 'xhrAborted') {
        if (item.numberOfAttempts < 3 && !item.cancelled) {
          /** Exponential backoff */
          setTimeout(upload, 500 * numberOfAttempts);
        } else {
          /** if slow connection or xhr aborted */
          deferred.reject(response);
        }
      } else if (response.error && response.error.status === 500) {
        Logger.error(new Error('Import: internal server error'), { error: response }, ['ImportBadResponseFromDB']);
        deferred.reject({
          code: 500,
          reason: 'internalServerError',
          message: localization.IMPORT.textCantSaveImageToDB,
        });
      } else {
        Logger.error(new Error('Import: bad response from storage'), { error: response }, [
          'ImportBadResponseFromStorage',
        ]);
        deferred.reject({
          code: 403,
          reason: 'badResponse',
          message: localization.IMPORT.textCantSaveImageToStorage,
        });
      }
    }

    upload();
    return deferred.promise;
  };

  createAssetData = (gdAsset, inbox) => {
    const data = { ...gdAsset };
    data.googleId = gdAsset.id;
    delete data.id;
    data.uploadId = this.uploadId;

    data.inbox = inbox;

    return data;
  };

  createRevisionData = (gdAsset) => ({ revisionId: gdAsset.headRevisionId, fileSize: gdAsset.fileSize });

  onComplete = () => {
    /*
     * if complete without errors already triggered
     * e.g. 'clear all' and then handle xhr abort
     */
    if (this.isCompleted) return;

    const { groups, totalFilesCount } = this.state;
    /** If NO errors */
    if (this.errorsCount === 0) {
      this.lastIntProgress = 0;
      window.dispatchEvent(
        new CustomEvent('import:uploading:progress', { detail: { percantage: 0, ElParent: '#button-upload' } }),
      );

      const lightboardsIDs = [];
      const collectionsIDs = [];
      Object.keys(groups).forEach((path) => {
        groups[path].forEach((item) => {
          if (item.collection) collectionsIDs.push(item.collection._id);
          if (item.lightboard) lightboardsIDs.push(item.lightboard._id);
        });
      });

      this.props.onComplete(
        totalFilesCount,
        this.calculateUploadedSize(this.state),
        Object.keys(groups),
        uniq(lightboardsIDs),
        uniq(collectionsIDs),
      );
      this.isCompleted = true;
      Logger.log('App', 'UploadFinished', totalFilesCount);

      utils.LocalStorage.remove('inboxUploadQueue');
      return;
    }

    /** if retry just one file */
    if (!this.queueStarted) return;

    /** handle queue errors */
    this.queueStarted = false;

    const errors = [];
    Object.keys(groups).forEach((path) => {
      groups[path].forEach((item) => {
        /** if file without error - skip */
        if (item.complete) return;
        /** push error */
        if (item.lightboard) item.error.reason = 'notFoundLightboardFolder';
        errors.push(item.error);
      });
    });

    handleErrors(errors, this.start);
  };

  retryFile = (id) => {
    const { groups } = this.state;
    let item = null;
    /** find item */
    Object.keys(groups).forEach((path) => {
      groups[path].forEach((file) => {
        if (file.id === id) item = file;
      });
    });
    if (item.error) {
      this.errorsCount -= 1;
      this.addToQueue(item);
    }
  };

  retryAll = () => {
    const { groups } = this.state;
    const items = [];
    /** find items */
    Object.keys(groups).forEach((path) => {
      groups[path].forEach((file) => {
        if (file.error) items.push(file);
      });
    });
    if (items.length) {
      this.errorsCount -= items.length;
      items.forEach((item) => this.addToQueue(item));
    }
  };

  /**
   * Remove file from queue
   * @param {number[]} ids
   */
  removeFiles = (ids) => {
    const { groups } = this.state;
    let { totalFilesCount } = this.state;
    let removedItems = [];
    const items = [];
    /** find item */
    Object.keys(groups).forEach((path) => {
      groups[path].forEach((file) => {
        if (ids.includes(file.id)) items.push(file);
      });
    });

    items.forEach((item) => {
      /** if file uploaded to GD - no cancel */
      if (item.file && item.bytesUploaded === item.file.size && !item.error) return;

      /** cancel */
      item.cancelled = true;
      if (item.xhr) {
        item.xhr.abort();
        delete item.xhr;
      }
      if (item.error) this.errorsCount -= 1;
      /** remove */
      Object.keys(groups).forEach((path) => {
        removedItems = [...removedItems, ...remove(groups[path], item)];
        if (groups[path].length === 0) {
          delete groups[path];
        }
      });
      totalFilesCount -= 1;
    });

    this.setState({ totalSize: helpers.calculateTotalSize(groups), totalFilesCount, groups }, () => {
      let cancelledWithErrors = 0;
      removedItems.forEach((item) => {
        if (item.xhr) item.xhr.abort();
        if (item.error) cancelledWithErrors++;
      });

      /** if cancel files with error - check groups */
      if (cancelledWithErrors && this.errorsCount + this.filesCompleted === this.state.totalFilesCount) {
        this.onComplete();
      }
    });
    this.saveToLocalStorage(groups);
  };

  removeAllFiles = () => {
    let { groups, totalFilesCount } = this.state;
    let cancelledFilesCount = 0;

    Object.keys(groups).forEach((path) => {
      groups[path].forEach((item) => {
        /** if file uploaded to GD or completed - no cancel */
        if (item.complete || (item.file && item.bytesUploaded === item.file.size && !item.error)) return;

        /** cancel */
        item.cancelled = true;
        if (item.xhr) {
          item.xhr.abort();
          delete item.xhr;
        }
        if (item.error) this.errorsCount -= 1;
        cancelledFilesCount += 1;
      });

      remove(groups[path], (item) => item.cancelled);
      if (groups[path].length === 0) delete groups[path];
    });

    this.queueManager.reset();

    Logger.log('User', 'UploadCancelUploadFiles', `${cancelledFilesCount}`);

    totalFilesCount -= cancelledFilesCount;
    this.handleUploadingProgress();

    this.setState(
      {
        totalFilesCount,
        totalSize: helpers.calculateTotalSize(groups),
        groups,
      },
      () => {
        if (this.errorsCount + this.filesCompleted === totalFilesCount) {
          this.onComplete();
        } else {
          this.saveToLocalStorage(groups);
        }
      },
    );
  };

  render() {
    const { state } = this;

    return (
      <>
        {/** Status text, create collections */}
        {state.statusText && (
          <div className="importStatus">
            <div className="text">
              {state.statusText}
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </div>
          </div>
        )}
        <div className="filesCountProgress">
          {this.filesCompleted}{' '}
          {this.errorsCount > 0 && (
            <span>
              / <span className="errorsNumber">{this.errorsCount}</span>
            </span>
          )}{' '}
          / {pluralize('file', state.totalFilesCount, true)}
        </div>
        <div className="importFiles">
          <UploadItemsList
            groups={state.groups}
            retry={this.retryFile}
            restoreFile={this.restoreFile}
            remove={this.removeFiles}
            filesCompleted={this.filesCompleted}
            totalFilesCount={state.totalFilesCount}
            errorsCount={this.errorsCount}
            isImportPanelShow
            showCompleted
          />
        </div>
        <div className="importButtons">
          <div className="importTotalSize">
            {state.uploadedSize ? utils.bytesToSize(state.uploadedSize) : '0B'} /{' '}
            {utils.bytesToSize(this.state.totalSize)}
          </div>
          <div className="importButtonsGroup">
            {this.errorsCount > 0 && (
              <div className="btnClearPanel picsioDefBtn" onClick={this.retryAll}>
                {localization.IMPORT.textRetryAll}
              </div>
            )}
            <div className="btnClearPanel picsioDefBtn" onClick={this.removeAllFiles}>
              {localization.IMPORT.textCancel}
            </div>
          </div>
        </div>
      </>
    );
  }
}

UploadQueue.propTypes = {
  groups: object,
  totalFilesCount: number,
  onComplete: func,
  onCancel: func,
  comment: string,
  title: string,
  description: string,
  selectedKeywords: array,
  selectedUsers: array,
  flag: string,
  color: string,
  rating: number,
  selectedCustomFields: array,
};

const mapStateToProps = (state) => ({
  comment: state.comment.value || '',
  title: state.titleAndDescription.title || '',
  description: state.titleAndDescription.description || '',
  flag: state.flag.value || null,
  color: state.color.value || null,
  rating: state.rating.value || null,
  selectedCustomFields: state.customFields.map((cf) => {
    if (
      typeof cf.value === 'undefined'
      || (typeof cf.value === 'string' && !cf.value.trim())
    ) return null;
    return { title: cf.title, value: cf.value };
  }).filter(Boolean),
});
export default connect(mapStateToProps)(UploadQueue);
