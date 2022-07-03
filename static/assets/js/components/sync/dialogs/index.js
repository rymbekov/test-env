import Store from '../../../store';
import { getWorkingFolderId } from '../../../store/helpers/user';
import emptyWorkingFolderDialog from './configs/emptyWorkingFolderDialog';
import syncSuccessDialog from './configs/syncSuccessDialog';
import slowSyncDialog from './configs/slowSyncDialog';
import syncFailedDialog from './configs/syncFailedDialog';
import syncAlreadyRunningDialog from './configs/syncAlreadyRunningDialog';
import destructiveSyncWebsitesWarningDialog from './configs/destructiveSyncWebsitesWarningDialog';
import destructiveSyncWarningDialog from './configs/destructiveSyncWarningDialog';
import syncLimitExceededDialog from './configs/syncLimitExceededDialog';
import { showDialog } from '../../dialog';

export const showEmptyWorkingFolder = () => {
  const folderId = getWorkingFolderId();
  emptyWorkingFolderDialog.onOk = () => window.open(`http://drive.google.com/#folders/${folderId}`);
	showDialog(emptyWorkingFolderDialog);
};

export const showSyncSuccess = () => {
	showDialog(syncSuccessDialog);
};

export const showAlreadyRunning = (progress = 0) => {
	showDialog(syncAlreadyRunningDialog(progress));
};

export const showSyncLimitExceededDialog = minutesBeforeNextSync => {
	const config = {
		...syncLimitExceededDialog,
		text: syncLimitExceededDialog.text(minutesBeforeNextSync.toFixed()),
	};
	showDialog(config);
};

function websiteToOrderedListHtml(website) {
	return `<li>${website.path.replace('/root', Store.getState().collections.collections.my.name)}</li>`;
}
export const showDestructiveSyncWarning = onOk => {
	destructiveSyncWarningDialog.onOk = onOk;
	showDialog(destructiveSyncWarningDialog);
};
export const showDestructiveSyncWebsitesWarning = (websites = []) => {
	const html = `<ol>${websites.map(websiteToOrderedListHtml).join('')}</ol>`;
	destructiveSyncWebsitesWarningDialog.text = destructiveSyncWebsitesWarningDialog.text(html);
	showDialog(destructiveSyncWebsitesWarningDialog);
};

export const showFailed = () => {
	showDialog(syncFailedDialog);
};

export const showSlowSync = () => {
	showDialog(slowSyncDialog);
};
