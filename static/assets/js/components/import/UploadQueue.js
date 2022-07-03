import React from 'react';
import { func, array, object, string, number, bool } from 'prop-types';
import Q from 'q';

import picsioUtils from '@picsio/utils';
import remove from 'lodash.remove';
import throttle from 'lodash.throttle';
import isEmpty from 'lodash.isempty';
import uniq from 'lodash.uniq';
import pluralize from 'pluralize';
import { ROOT_COLLECTION_PATH, PATH_DELIMITER } from '@picsio/db/src/constants';

import GDriveStorage from '../../storage/GDriveStorage';
import S3Storage from '../../storage/S3Storage';

import ua from '../../ua';
import showAssetsLimitExceededDialog from '../../helpers/showAssetsLimitExceededDialog';

import * as collectionsApi from '../../api/collections';
import * as importApi from '../../api/import';
import * as lightboardsApi from '../../api/lightboards';

import { handleErrors } from '../../helpers/errorHandler';
import { findCollection } from '../../store/helpers/collections';
import * as UtilsCollections from '../../store/utils/collections';
import * as utils from '../../shared/utils';
import Logger from '../../services/Logger';
import localization from '../../shared/strings';
import * as helpers from './helpers';
import UploadItemsList from '../UploadItemsList';
import queue from './libs/queue';
import Toast from '../Toast';
import { showDialog } from '../dialog';

class UploadQueue extends React.Component {
	constructor(props) {
		super(props);

		const settings = this.props.user.settings;
		if (settings && settings.disableParallelUpload) {
			this.queueManager = queue.getConsequentiallyTaskRunner();
		} else {
			this.queueManager = queue.getPoolTaskRunner({
				simultaneously: 5,
			});
		}

		const updatedSelectedCustomFields = [...props.requiredCustomFields, ...props.selectedCustomFields].map(field => {
			let newField = { ...field };
			if (newField.type === 'enum' && !newField.multiple) {
				newField.value = newField.options && newField.options[newField.value];
				return newField;
			}
			return newField;
		});

		this.state = {
			groups: props.groups,
			totalSize: helpers.calculateTotalSize(props.groups),
			totalFilesCount: props.totalFilesCount,
			uploadedSize: 0,
			statusText: null,
			additionalFields: {
				comment: props.comment,
				title: props.title,
				description: props.description,
				keywordsIds: props.selectedKeywords.map(keyword => keyword._id),
				assigneeIds: props.selectedUsers.map(user => user._id),
				flag: props.flag,
				color: props.color,
				rating: props.rating,
				selectedCustomFields: updatedSelectedCustomFields,
			},
		};
		this.errorsCount = 0;
		this.filesCompleted = 0;
		this.handleUploadingProgress = throttle(this.handleUploadingProgress, 250);
		this.uploadId = Date.now();
		this.uploadToS3 = this.props.user.team.storageType === 's3';
	}

	async componentDidMount() {
		window.addEventListener('beforeunload', this.unloadListener);
		await this.checkCollections();

		if (isEmpty(this.state.groups)) {
			this.onComplete();
		} else {
			let defaultLocalStorageSize = 1024 * 10;
			const family = ua.browser.family.toLowerCase();
			if (family === 'safari' || family === 'mobile safari') {
				defaultLocalStorageSize = 1024 * 5;
			}

			// if weight groups object is more than default LocalStorage size, we show warning dialog
			const groupSizeWhenFinishedUpload =
				((((JSON.stringify(this.props.groups).length || 0) + ('uploadQueue'.length || 0)) * 2) / 1024).toFixed(2) *
				1.35; // 1.35 - factor of increase when all files finished loading.

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
	saveToLocalStorage = groups => {
		utils.LocalStorage.set('uploadQueue', groups);
	};

	unloadListener = event => {
		event.returnValue = 'Changes you made may not be saved.';
	};

	checkCollections = async () => {
		const { groups } = this.state;
		/** @type {string[]} */
		let processedDeepPathes = [];
		let createCollectionRequests = [];
		const fillCollectionRequests = (path, collection, deepPath) => {
			/** if current deepPath already processed - EXIT */
			if (processedDeepPathes.includes(deepPath)) return;

			processedDeepPathes.push(deepPath);
			let deepPathArray = deepPath.slice(0, -1).split('/');
			const name = deepPathArray.splice(-1, 1)[0];
			/** if files structure has collections without files (only folders) */
			if (deepPathArray.length) {
				fillCollectionRequests(null, collection, deepPathArray.join('/') + '/');
			}
			const fullPath =
				collection.path === 'root'
					? `/${deepPathArray.length > 0 ? deepPathArray.join('/') + '/' : ''}`
					: `${collection.path}${collection.name}/${deepPathArray.length > 0 ? deepPathArray.join('/') + '/' : ''}`;
			const data = { tag: { name } };
			/** if path not root */
			if (fullPath !== '/') data.path = fullPath;

			createCollectionRequests.push(async () => {
				this.setState({ statusText: `Creating collection ${name}` });
				try {
					let findedCollection = findCollection({ collection }, null, { name, path: fullPath });
					if (findedCollection === undefined) {
						findedCollection = await collectionsApi.add(data);
					}
					return { path, collection: findedCollection };
				} catch (error) {
					const errorSubcode = utils.getDataFromResponceError(error, 'subcode');
					if (errorSubcode === 'UnsafeCharactersError') {
						Toast(`Cannot create a collection [${data?.tag?.name}] because its name contains unsafe characters. A name must contain only: 0-9, a-z, A-Z, /, !, - (hyphen), – (middle-length dash), — (dash),  _ (underscore), . (dot), * (asterisk), ’ (single quote), ().`, { autoClose: false });
					}
					return { path, error };
				}
			});
		};

		Object.keys(groups)
			/** sort groups by deepPath */
			.sort((pathA, pathB) => {
				const itemA = groups[pathA][0];
				const itemB = groups[pathB][0];
				if (itemA.deepPath && itemB.deepPath) {
					const deepCountA = itemA.deepPath.split('/').length;
					const deepCountB = itemB.deepPath.split('/').length;
					return deepCountA - deepCountB;
				}
				if (!itemA.deepPath && !itemB.deepPath) {
					return 0;
				}
				if (!itemB.deepPath) {
					return 1;
				}
				return -1;
			})
			/** get collection.storageId for every path */
			.forEach(path => {
				const firstItem = groups[path][0];
				if (firstItem.deepPath) {
					const { collection, deepPath } = firstItem;
					fillCollectionRequests(path, collection, deepPath);
				}
			});

		if (createCollectionRequests.length > 0) {
			/** create collections one by one */
			const createdCollections = await (async () => {
				let result = [];
				for (let i = 0; i < createCollectionRequests.length; i++) {
					result[i] = await createCollectionRequests[i]();
				}
				this.setState({ statusText: null });
				return result;
			})();

			createdCollections.forEach(item => {
				if (groups[item.path] && item.collection && item.collection.storageId) {
					groups[item.path].forEach(file => {
            const pathArr = item.collection.path.split(PATH_DELIMITER);
            const name = pathArr.pop();
            const path = `${pathArr.join(PATH_DELIMITER).replace(ROOT_COLLECTION_PATH, '')}${PATH_DELIMITER}`;
						file.collection = {
              ...item.collection,
              name,
              path,
            };
						delete file.collection.user;
						delete file.collection.permissions;
						delete file.deepPath;
					});
				}
				/** push collection to store */
				if (item.collection) {
					this.props.pushCollections([item.collection]);
				}
			});
			const createCollectionErrors = createdCollections.filter(item => !!item.error);
			if (createCollectionErrors.length) {
				Logger.error(new Error('Can not create collections'), { errors: createCollectionErrors }, [
					'ImportCantCreateCollectionsDialog',
					{ errors: createCollectionErrors },
				]);
				return new Promise(resolve => {
					showDialog({
						title: localization.IMPORT.cantCreateCollections.title,
						text: localization.IMPORT.cantCreateCollections.text.replace(
							'{$list}',
							createCollectionErrors.map(item => '<li>' + item.path + '</li>').join('')
						),
						onCancel: () => {
							let removedFilesCount = 0;
							createCollectionErrors.forEach(item => {
								removedFilesCount += groups[item.path].length;
								delete groups[item.path];
							});
							this.setState(
								{
									totalSize: helpers.calculateTotalSize(groups),
									totalFilesCount: this.state.totalFilesCount - removedFilesCount,
									groups,
								},
								resolve
							);
						},
						onOk: () => {
							resolve(this.checkCollections());
						},
						textBtnCancel: localization.IMPORT.cantCreateCollections.btnCancel,
						textBtnOk: localization.IMPORT.cantCreateCollections.btnOk,
					});
				});
			}
			this.setState({ groups });
		}
	};

	start = async () => {
		this.queueStarted = true;
		this.lastIntProgress = 0;
		window.dispatchEvent(
			new CustomEvent('import:uploading:progress', { detail: { percantage: 0, ElParent: '#button-upload' } })
		);
		this.errorsCount = 0;
		const { groups } = this.state;

		Object.keys(groups).forEach(path => {
			groups[path].forEach(item => {
				// if we restarted queue
				if (item.complete) return;

				item.bytesUploaded = 0;
				item.progress = 0;
				item.error = null;

				this.addToQueue(item);
			});
		});

		this.saveToLocalStorage(groups);
	};

	addToQueue = item => {
		const { groups, additionalFields } = this.state;
		const self = this;
		/** @type {boolean} */
		const updateRevision = item.action === 'addRevision';

		/** if ReplaceFile */
		const assetIdToReplace = item.action === 'replaceFile' && item.duplicatedModel && item.duplicatedModel._id;

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

					if (self.errorsCount + self.filesCompleted === self.state.totalFilesCount) self.onComplete();
					next();
					return;
				}

				let gdAsset;
				let asset;

				/** Upload */
				try {
					gdAsset = await self.uploadFile(item);
				} catch (error) {
					if (!item.cancelled) {
						Logger.info('Error upload asset to GD: ', error);
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

					if (self.errorsCount + self.filesCompleted === self.state.totalFilesCount) self.onComplete();
					next();
					return;
				}

				/** Save on BackEnd */
				const assetData = updateRevision ? self.createRevisionData(gdAsset) : self.createAssetData(gdAsset, item);
				try {
					if (updateRevision) {
						await importApi.createRevision(item.duplicatedModel._id, { assetData, additionalFields });
						asset = gdAsset;
					} else {
						const dataToSave = { assetData, additionalFields: { ...additionalFields } };
						if (assetIdToReplace) dataToSave.additionalFields.assetIdToReplace = assetIdToReplace;
						asset = await importApi.saveAsset(dataToSave);
					}
				} catch (error) {
					Logger.info('Can not save asset to db: ', error);
					/** limit for Free plan */
					const errorMessage = utils.getDataFromResponceError(error, 'msg');
					const errorSubcode = utils.getDataFromResponceError(error, 'subcode');
					const errorStatus = utils.getStatusFromResponceError(error);
					if (
						errorSubcode === 'CreateAssetLimitsApiError'
					) {
						item.error = {
							code: 403,
							reason: 'subscriptionLimits',
							message: error.response ? `${errorSubcode}: ${errorMessage}` : error,
						};
						showDialog({
							title: localization.DIALOGS.ASSETS_LIMIT.TITLE,
							text: localization.DIALOGS.ASSETS_LIMIT.TEXT,
							textBtnCancel: null,
						});
					} else if (!window.navigator.onLine) {
						/** if user offline */
						item.error = {
							code: 403,
							reason: 'slowConnection',
							message: 'No internet',
						};
					} else {
						item.error = {
							code: error.status || errorStatus,
							reason: 'cantSaveToDB',
							message: error.response ? `${errorSubcode}: ${errorMessage}` : error,
						};
					}
					Logger.error(new Error('Import: can not save asset on the server'), {
						error,
						item: { ...item },
						isRevision: updateRevision,
					});

					self.errorsCount += 1;
					item.bytesUploaded = 0;
					item.progress = 0;
					self.handleUploadingProgress();
					self.saveToLocalStorage(groups);

					if (self.errorsCount + self.filesCompleted === self.state.totalFilesCount) self.onComplete();
					next();
					return;
				}

				item.bytesUploaded = item.file.size;
				item.progress = 100;
				item.complete = true;
				delete item.xhr;
				delete item.path;
				delete item.top;

				item._id = asset._id || item.duplicatedModel._id;
				if (item.action === 'addRevision') item.revisionId = asset.headRevisionId;

				self.filesCompleted += 1;

				self.saveToLocalStorage(groups);
				self.handleUploadingProgress();

				/** if all files done */
				if (self.filesCompleted + self.errorsCount === self.state.totalFilesCount) self.onComplete();

				if (item.action !== 'addRevision' && item.action !== 'replaceFile') {
					self.props.changeCountInCollectionAction(1);
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
		return Object.keys(state.groups).reduce((total, groupPath) => {
			return total + state.groups[groupPath].reduce((total, item) => total + (item.bytesUploaded || 0), 0);
		}, 0);
	}

	getGoogleFolderIDs = async item => {
		if (item.collection) {
			return [item.collection.storageId];
		}
		if (item.lightboard) {
			const user = this.props.user.isTeammate ? this.props.user.team : this.props.user;
			let storageId = user.lightboardsFolderId;
			if (!storageId) {
				storageId = await lightboardsApi.getLightboardsFolderId();
				this.props.userActions.updateTeamValue('lightboardsFolderId', storageId);
			}
			return [storageId];
		}
	};

	handleUploadingProgress = () => {
		const totalUploaded = this.calculateUploadedSize(this.state);
		// change ui only with int values
		const totalPercent = Math.floor((totalUploaded * 100) / this.state.totalSize);
		if (this.lastIntProgress !== totalPercent) {
			this.lastIntProgress = totalPercent;
			window.dispatchEvent(
				new CustomEvent('import:uploading:progress', {
					detail: { percantage: totalPercent, ElParent: '#button-upload' },
				})
			);
		}
		if (!this.isCompleted) {
			this.setState({ uploadedSize: totalUploaded });
		}
	};

	uploadFile = item => {
		/** @type {number} */
		let numberOfAttempts = 0;
		const deferred = Q.defer();
		const updateRevision = item.action === 'addRevision';

    if(item.collection) {
      const collectionPath = item.collection.path === 'root' ?
        ROOT_COLLECTION_PATH :
        `${ROOT_COLLECTION_PATH}${item.collection.path}${item.collection.name}`;

      if (!helpers.checkPermissionToUpload(this.props.user.role, collectionPath)) {
        deferred.reject({
          code: 403,
          reason: 'badResponse',
          message: localization.IMPORT.textDontHavePermissionToUpload,
        });
        return deferred.promise;
      }
    }

		const onUploadProgress = ({ xhr, percentage }) => {
			item.xhr = xhr;
			item.progress = percentage;
			item.bytesUploaded = (item.file.size * percentage) / 100;

			this.handleUploadingProgress();
		};

		const upload = async () => {
			numberOfAttempts += 1;
			item.progress = 0;
			item.bytesUploaded = 0;
			item.numberOfAttempts = numberOfAttempts;

			if (this.uploadToS3) {
				/** Upload to s3 */
				try {
					const { file, collection, lightboard } = item;
					const result = await S3Storage.uploadFile({
						file,
						collectionId: collection && collection._id,
						lightboardId: lightboard && lightboard._id,
						onUploadProgress,
						id: updateRevision ? item.duplicatedModel._id : null,
					});
					deferred.resolve(result);
				} catch (err) {
					handleS3UploadError(err);
				}
			} else {
				/** Upload to GoogleDrive */
				let folderIDs;
				if (item.action !== 'replaceFile') {
					folderIDs = await this.getGoogleFolderIDs(item);
				}

				const config = {};
				if (folderIDs) config.folderIds = folderIDs;
				if (item.action === 'replaceFile') config.assetIdToReplace = item.duplicatedModel._id;
				if (updateRevision) config.fileId = item.duplicatedModel._id;

				GDriveStorage.uploadFile(item.file, config)
					.progress(onUploadProgress)
					.then(gdAsset => deferred.resolve(gdAsset))
					.catch(response => {
						handleGDUploadError(response);
					});
			}
		};

		function handleS3UploadError(error) {
			let message = localization.IMPORT.textCantSaveImageToGD;
			let code = 403;
			const { response } = error;
			if (response && response.data) {
				code = response.status;
				message = response.data.msg || message;
			}
			if (code === 402) {
				showDialog({
					title: localization.DIALOGS.NO_SIZE_LEFT.TITLE,
					text: localization.DIALOGS.NO_SIZE_LEFT.TEXT,
				});
			}
			const errorSubcode = utils.getDataFromResponceError(error, 'subcode');
			if (errorSubcode === 'AssetsLimitExceededError' || message.startsWith('Assets limit')) {
				showAssetsLimitExceededDialog();
			}
      const connection = utils.getNavigatorConnectionInfo();
			Logger.error(new Error(message), { error }, ['ImportBadResponseFromS3', {
					errorMessage: message,
					userDialogueMessage: code === 402 ? localization.DIALOGS.NO_SIZE_LEFT.TEXT : null,
					connection,
				},
			]);
			deferred.reject({
				code,
				reason: 'badResponse',
				message,
			});
		}

		function handleGDUploadError(response) {
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
					(code === 429 ||
						code === 500 ||
						(code === 403 && (reason === 'userRateLimitExceeded' || reason === 'rateLimitExceeded'))) &&
					numberOfAttempts < 11
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
			} else {
				const { message } = response;
				if (message.startsWith('Assets limit')) {
					showAssetsLimitExceededDialog();
				}
				const errorMessageForUser = message || localization.IMPORT.textCantSaveImageToGD;
				const connection = utils.getNavigatorConnectionInfo();
				Logger.error(new Error(message || 'Import: bad response from GD'), { error: response }, [
					'ImportBadResponseFromGD', { userDialogueMessage: errorMessageForUser, connection }
				]);
				deferred.reject({
					code: 403,
					reason: 'badResponse',
					message: errorMessageForUser,
				});
			}
		}

		upload();
		return deferred.promise;
	};

	createAssetData = (uploadResult, uploadItem) => {
		const { collection, lightboard } = uploadItem;
		const data = { ...uploadResult, uploadId: this.uploadId };

		if (this.uploadToS3) {
			const mimeType = picsioUtils.lookupMimeType(uploadItem.name.split('.').pop()) || 'application/octet-stream';
			data.fileSize = uploadItem.file.size;
			data.name = uploadItem.name;
			data.mimeType = uploadItem.file.type || mimeType;
		} else {
			/** if upload result from Google Drive */
			data.googleId = uploadResult.id;
			delete data.id;
		}
		if (collection) {
			const rootTagId = UtilsCollections.getRootId();
			if (rootTagId !== collection._id) {
				data.tags = [{ _id: collection._id }];
			}
		} else if (lightboard) {
			data.lightboards = [{ _id: lightboard._id }];
		}

		return data;
	};

	createRevisionData = storageAsset => {
		const { headRevisionId, revisionId, fileSize, imageMediaMetadata } = storageAsset;
		const { width, height, rotation } = imageMediaMetadata || {};
		return {
			revisionId: headRevisionId || revisionId,
			fileSize,
			width,
			height,
			rotation,
		};
	}

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
				new CustomEvent('import:uploading:progress', { detail: { percantage: 0, ElParent: '#button-upload' } })
			);

			let lightboardsIDs = [];
			let collectionsIDs = [];
			Object.keys(groups).forEach(path => {
				groups[path].forEach(item => {
					if (item.collection) collectionsIDs.push(item.collection._id);
					if (item.lightboard) lightboardsIDs.push(item.lightboard._id);
				});
			});

			this.props.onComplete(
				totalFilesCount,
				this.calculateUploadedSize(this.state),
				Object.keys(groups),
				uniq(lightboardsIDs),
				uniq(collectionsIDs)
			);
			this.isCompleted = true;
			Logger.log('App', 'UploadFinished', totalFilesCount);

			utils.LocalStorage.remove('uploadQueue');
			return;
		}

		/** if retry just one file */
		if (!this.queueStarted) return;

		/** handle queue errors */
		this.queueStarted = false;

		let errors = [];
		Object.keys(groups).forEach(path => {
			groups[path].forEach(item => {
				/** if file without error - skip */
				if (item.complete) return;
				/** push error */
				if (item.lightboard) item.error.reason = 'notFoundLightboardFolder';
				errors.push(item.error);
			});
		});

		handleErrors(errors, this.start);
	};

	retryFile = id => {
		const { groups } = this.state;
		let item = null;
		/** find item */
		Object.keys(groups).forEach(path => {
			groups[path].forEach(file => {
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
		let items = [];
		/** find items */
		Object.keys(groups).forEach(path => {
			groups[path].forEach(file => {
				if (file.error) items.push(file);
			});
		});
		if (items.length) {
			this.errorsCount -= items.length;
			items.forEach(item => this.addToQueue(item));
		}
	};

	/**
	 * Remove file from queue
	 * @param {number[]} ids
	 */
	removeFiles = ids => {
		const { groups } = this.state;
		let { totalFilesCount } = this.state;
		let removedItems = [];
		let items = [];
		/** find item */
		Object.keys(groups).forEach(path => {
			groups[path].forEach(file => {
				if (ids.includes(file.id)) items.push(file);
			});
		});

		items.forEach(item => {
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
			Object.keys(groups).forEach(path => {
				removedItems = [...removedItems, ...remove(groups[path], item)];
				if (groups[path].length === 0) {
					delete groups[path];
				}
			});
			totalFilesCount -= 1;
		});

		this.setState({ totalSize: helpers.calculateTotalSize(groups), totalFilesCount, groups }, () => {
			let cancelledWithErrors = 0;
			removedItems.forEach(item => {
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

		Object.keys(groups).forEach(path => {
			groups[path].forEach(item => {
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

			remove(groups[path], item => item.cancelled);
			if (groups[path].length === 0) delete groups[path];
		});

		this.queueManager.reset();

		Logger.log('User', 'UploadCancelUploadFiles', `${cancelledFilesCount}`);

		totalFilesCount = totalFilesCount - cancelledFilesCount;
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
			}
		);
	};

	render() {
		const { state } = this;

		return (
			<React.Fragment>
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
						isImportPanelShow={this.props.isImportPanelShow}
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
			</React.Fragment>
		);
	}
}

UploadQueue.propTypes = {
	groups: object,
	totalFilesCount: number,
	onComplete: func,
	onCancel: func,
	pushCollections: func,
	addRevisionAction: func,
	changeCountInCollectionAction: func,
	isImportPanelShow: bool,
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

export default UploadQueue;
