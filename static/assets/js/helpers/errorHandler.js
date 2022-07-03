import localization from '../shared/strings';
import Logger from '../services/Logger';
import { showDialog, showErrorDialog } from '../components/dialog';

/** Show file deleted dialog
 * @param {Function} afterOk
 */
export function showFileDeletedDialog(afterOk = Function.prototype) {
  Logger.log('Error', 'showFileDeletedDialog');
  showDialog({
    title: localization.DIALOGS.FILE_DELETED_FROM_GD.TITLE,
    text: localization.DIALOGS.FILE_DELETED_FROM_GD.TEXT,
    className: 'errorDialog',
    icon: 'warning',
    textBtnOk: localization.DIALOGS.FILE_DELETED_FROM_GD.OK_TEXT,
    textBtnCancel: null,
    onOk: afterOk,
  });
}

/** Show lightboard folder not found dialog
 * @param {Function} afterOk
 */
export function showLightboardFolderNotFoundDialog(afterOk = Function.prototype) {
  Logger.log('Error', 'showLightboardFolderNotFoundDialog');
  showDialog({
    title: localization.DIALOGS.LIGHTBOARD_FOLDER_NOT_FOUND_IN_GD.TITLE,
    text: localization.DIALOGS.LIGHTBOARD_FOLDER_NOT_FOUND_IN_GD.TEXT,
    className: 'errorDialog',
    icon: 'warning',
    textBtnOk: localization.DIALOGS.LIGHTBOARD_FOLDER_NOT_FOUND_IN_GD.OK_TEXT,
    textBtnCancel: null,
    onOk: afterOk,
  });
}

/** Show dialog when file not choosen after restore uploading */
export function showFileNotChoosenDialog(afterOk = Function.prototype) {
  Logger.log('Error', 'showFileNotChoosenDialog');
  showDialog({
    title: localization.DIALOGS.FILES_NOT_SELECTED.TITLE,
    text: localization.DIALOGS.FILES_NOT_SELECTED.TEXT,
    textBtnOk: null,
    textBtnCancel: localization.DIALOGS.btnOk,
    onCancel: afterOk,
  });
}

/** Show no more space dialog
 * @param {Function} onOk
 * @param {Function} afterOk
 */
export function showNoMoreSpaceDialog(onOk, afterOk) {
  Logger.log('Error', 'showNoMoreSpaceDialog');
  showDialog({
    title: localization.DIALOGS.NO_SPACE_LEFT.TITLE,
    text: localization.DIALOGS.NO_SPACE_LEFT.TEXT,
    className: 'errorDialog',
    icon: 'warning',
    textBtnOk: localization.DIALOGS.NO_SPACE_LEFT.OK_TEXT,
    textBtnCancel: localization.DIALOGS.NO_SPACE_LEFT.CANCEL_TEXT,
    onOk: () => {
      onOk();
      afterOk();
    },
  });
}

/** Show wait and retry dialog
 * @param {Object} error
 * @param {nubmer} numberOfFiles
 * @param {Function} onOk
 * @param {Function} afterOk
 */
export function showWaitDialog(error = {}, numberOfFiles, onOk, afterOk) {
  Logger.log('Error', 'showWaitDialog', (error && error.message) || 'NoMessage');
  const title = localization.DIALOGS.WAIT_AND_RETRY.TITLE;
  const body = `code: ${error.code}<br/>reason: ${error.reason}<br/>message: ${error.message}<br/>files: ${numberOfFiles}<br/>url: ${window.location.href}`;
  const text = localization.DIALOGS.WAIT_AND_RETRY.TEXT({
    subject: encodeURIComponent(title),
    body: encodeURIComponent(`\n${body.replace(/<br\/>/g, '\n')}`),
    code: body,
  });
  showDialog({
    title,
    text,
    icon: 'warning',
    className: 'errorDialog',
    textBtnCancel: localization.DIALOGS.WAIT_AND_RETRY.CANCEL_TEXT,
    textBtnOk: localization.DIALOGS.WAIT_AND_RETRY.OK_TEXT,
    onOk: () => {
      onOk();
      afterOk();
    },
  });
}

/** Show slow connection dialog
 * @param {Function} onOk
 * @param {Function} afterOk
 */
export function showSlowConnectionDialog(onOk, afterOk) {
  Logger.log('Error', 'showSlowConnectionDialog');
  showDialog({
    className: 'errorDialog',
    title: localization.DIALOGS.SLOW_CONNECTION.TITLE,
    text: localization.DIALOGS.SLOW_CONNECTION.TEXT,
    icon: 'warning',
    textBtnCancel: localization.DIALOGS.SLOW_CONNECTION.CANCEL_TEXT,
    textBtnOk: localization.DIALOGS.SLOW_CONNECTION.OK_TEXT,
    onOk: () => {
      onOk();
      afterOk();
    },
  });
}

/** Show write to support dialog
 * @param {Object} error
 * @param {number} error.code
 * @param {string} error.reason
 * @param {string} error.message
 * @param {number} numberOfFiles
 */
export function showWriteToSupportDialog(error = {}, numberOfFiles) {
  Logger.error(
    new Error('Write to support dialog triggered'),
    { error, numberOfFiles, showDialog: true },
    ['showWriteToSupportDialog', error.message || 'NoMessage']
  );
}

/**
 * Errors handler
 * @param {Object[]} errors - [{
 * code: {number},
 * reason: {string},
 * message: {string}
 * }]
 * @param {Function} retryHandler - on press "Retry"
 * @returns {void}
 */
export function handleErrors(errors, retryHandler) {
  let fileNotChoosen = [];
  let writeToSupport = [];
  let wait = [];
  let fileDeleted = [];
  let ligthboardFolderDeleted = [];
  let noMoreSpace = [];
  const errorFromTheServer = [];
  let slowConnection = [];

  errors.forEach((error) => {
    const { code, reason, status, response, message } = error;
    if (
      (code === 403 && reason === 'quotaExceeded') ||
      (code === 403 && message === 'The user has exceeded their Drive storage quota')
    ) {
      /** No more space */
      noMoreSpace.push(error);
    } else if (code === 404 && reason === 'notFoundLightboardFolder') {
      /** Lightboard folder deleted from GD */
      ligthboardFolderDeleted.push(error);
    } else if (code === 404) {
      /** File deleted from GD */
      fileDeleted.push(error);
    } else if (
      code === 429 ||
      code === 500 ||
      (code === 403 && (reason === 'userRateLimitExceeded' || reason === 'rateLimitExceeded'))
    ) {
      /** Wait for a few minutes */
      wait.push(error);
    } else if (code === 403 && reason === 'slowConnection') {
      slowConnection.push(error);
    } else if (reason === 'fileNotChoosen') {
      fileNotChoosen.push(error);
    } else if (reason === 'xhrAborted') {
      /** if request aborted - do nothing */
    } else if (status === 400 && response && response.data && response.data.msg) {
      errorFromTheServer.push(response.data.msg);
    } else {
      /** Write to support */
      writeToSupport.push(error);

      /** FOR TEST - all dialogs */
      // wait.push(error);
      // fileDeleted.push(error);
      // noMoreSpace.push(error);
      // slowConnection.push(error);
    }
  });

  const showDialog = () => {
    if (fileNotChoosen.length > 0) {
      showFileNotChoosenDialog(showDialog);
      fileNotChoosen = [];
      return;
    }
    /** File deleted dialog */
    if (fileDeleted.length > 0) {
      showFileDeletedDialog(showDialog);
      fileDeleted = [];
      return;
    }
    /** Lightboard folder deleted dialog */
    if (ligthboardFolderDeleted.length > 0) {
      showLightboardFolderNotFoundDialog(showDialog);
      ligthboardFolderDeleted = [];
      return;
    }
    /** No more space dialog */
    if (noMoreSpace.length > 0) {
      showNoMoreSpaceDialog(retryHandler, showDialog);
      noMoreSpace = [];
      return;
    }
    /** Wait and retry dialog */
    if (wait.length > 0) {
      showWaitDialog(wait[0], wait.length, retryHandler, showDialog);
      wait = [];
      return;
    }
    /** Slow connection dialog */
    if (slowConnection.length > 0) {
      showSlowConnectionDialog(retryHandler, showDialog);
      slowConnection = [];
      return;
    }
    /** Show errors from the server */
    if (errorFromTheServer.length > 0) {
      showErrorDialog(errorFromTheServer.join(', '));
      return;
    }
    /** Write to support dialog */
    if (writeToSupport.length > 0) {
      showWriteToSupportDialog(writeToSupport[0], writeToSupport.length, showDialog);
      writeToSupport = [];
    }
  };

  showDialog();
}
