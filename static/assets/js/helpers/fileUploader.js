import picsioConfig from '../../../../config';
import Q from 'q';
import * as utils from '../shared/utils';
import Logger from '../services/Logger';
import localization from '../shared/strings';
import { showErrorDialog } from '../components/dialog';

// eslint-disable-next-line jsx-control-statements/jsx-jcs-no-undef
const isMobileApp = __IS_MOBILE__; // it's constant from Webpack

/**
 * Upload file
 * @param {string} url
 * @param {File} file
 * @param {Object?} options
 * @param {string?} options.method - by default PUT
 * @returns {Object} { promise: Promise, cancel: Function }
 */
export function uploadFile(url, file, { method = 'PUT' }) {
	let normalizedApiUrl = url;
	if (isMobileApp) {
		normalizedApiUrl = `${picsioConfig.getApiBaseUrl()}${url}`;
		if (url.startsWith('https://') || url.startsWith('http://')) {
			normalizedApiUrl = url;
		}
	}
	const deferred = Q.defer();
	const xhr = new XMLHttpRequest();

	deferred.notify({ msg: 'Uploading image...', percent: 0 });
	xhr.upload.onprogress = event => {
		if (event.lengthComputable) {
			const percent = event.loaded / event.total;
			deferred.notify({ msg: `Uploading image... ${Math.round(percent * 100)}%`, progress: percent });
		}
	};

	xhr.onload = () => {
		if (xhr.status >= 400) return deferred.reject(xhr);
		else {
			try {
				deferred.resolve(JSON.parse(xhr.response));
			} catch (err) {
				deferred.resolve(xhr.response);
			}
		}
	};
	xhr.onabort = deferred.reject;
	xhr.onerror = () => {
		deferred.reject();
	};
	xhr.open(method, normalizedApiUrl, true);

	// atach Bearer for mobile app
	if (isMobileApp) {
		const userToken = utils.MobileStorage.get('picsio.userToken');
		xhr.setRequestHeader('Authorization', `Bearer ${userToken}`);
	};
	xhr.send(file);

	return {
		promise: deferred.promise,
		cancel: xhr.abort,
	};
}

export function showUploadFileErrorDialog(error) {
	const { FILE_TO_LARGE, INVALID_FILE_TYPE } = localization.DIALOGS;
	let title;
	let text = 'Can not upload file';
	if (error && error.response) {
		try {
			const { subcode } = JSON.parse(error.response);
			if (subcode === 'FileIsToBig') {
				text = FILE_TO_LARGE.TEXT_IN_GENERAL;
				title = FILE_TO_LARGE.TITLE;
			}
			if (subcode === 'UnsupportedFileType') {
				text = INVALID_FILE_TYPE.TEXT_IN_GENERAL;
				title = INVALID_FILE_TYPE.TITLE;
			}
		} catch (err) {
			Logger.warn('Can not upload file BAD RESPONSE', err);
		}
	}
	showErrorDialog(text, title);
	Logger.error(new Error('Can not upload file'), { error });
}
