import React from 'react';
import cn from 'classnames';
import { CSSTransition } from 'react-transition-group';
import _isEmpty from 'lodash/isEmpty';

import remove from 'lodash.remove';
import isEmpty from 'lodash.isempty';
import { Provider, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import pluralize from 'pluralize';
import PermissionsChecker from '@picsio/db/src/helpers/PermissionsChecker';
import CONSTANTS from '@picsio/db/src/constants';
import getPermissionsCollection from '@picsio/db/src/collections/roles/getPermissionsCollection';
import { Button as UiButton } from '@picsio/ui';
import {
  Question,
} from '@picsio/ui/dist/icons';
import * as utils from '../../shared/utils';
import Logger from '../../services/Logger';
import localization from '../../shared/strings';
import ErrorBoundary from '../ErrorBoundary';
import showAssetsLimitExceededDialog from '../../helpers/showAssetsLimitExceededDialog';

import store from '../../store';
import * as mainActions from '../../store/actions/main';
import * as userActions from '../../store/actions/user';
import * as uploadListActions from '../../store/actions/uploadList';
import { getAssets, addRevision } from '../../store/actions/assets';
import { pushCollections, changeCount } from '../../store/actions/collections';

import ResolveDuplicatesDialog from '../resolveDuplicatesDialog';

import Dialogs from '../../ui/dialogs';
import Button from '../toolbars/Button';
import Icon from '../Icon';

import * as UtilsCollections from '../../store/utils/collections';
import Toast from '../Toast';
import * as helpers from './helpers';
import UploadQueue from './UploadQueue';

import Placeholder from '../UploadPlaceholder';
import AdditionalFields from './AdditionalFields';
import UploadItemsList from '../UploadItemsList';
import TempItems from '../UploadTempItems';
import { isRouteFiltering, isRouteSearch } from '../../helpers/history';
import { showDialog, showErrorDialog } from '../dialog';
import sdk from '../../sdk';
import Tooltip from '../Tooltip';

class Import extends React.Component {
  // @TODO: set negative strategy...
  checker = new PermissionsChecker({
    ...this.props.user.role,
    strategy: CONSTANTS.PERMISSIONS_MERGE_STRATEGY.NEGATIVE,
  });

  editCollectionPermission = CONSTANTS.permissions.editAssetCollections;

  pathPrefix = CONSTANTS.ROOT_COLLECTION_PATH + CONSTANTS.PATH_DELIMITER;

  rootCollection = this.props.collectionsTree.my.name;

  isUserOnS3 = store.getState().user.team && store.getState().user.team.storageType === 's3';

  state = {
    canUpload: false,
    inProgress: false,
    collectionName: '',
    groups: {},
    totalSize: '0',
    totalFilesCount: 0,
    selectedKeywords: [],
    selectedUsers: [],
    tmpFilesCount: 0,
    comment: '',
    permissions: getPermissionsCollection(),
    title: '',
    description: '',
    rating: null,
    flag: null,
    color: null,
    selectedCustomFields: [],
    requiredCustomFields: [],
    errors: {},
    isHiddenBtnOpenLiveSupport: false,
  };

  componentDidMount() {
    window.addEventListener('importPanel:add', (e) => this.addFiles(e.detail), false);
    window.addEventListener(
      'importPanel:change:collectionName',
      (e) => this.setCollectionName(e.detail),
      false,
    );
    this.setDropListeners();
    this.checkUploadQueue();
    this.setRequiredCustomFields();

    if (isRouteSearch()) {
      this.getUploadPermission();
    }

    if (this.props.picsioStorage && this.props.chatSupport) {
      this.updateMediaQuery();
      window.addEventListener('resize', this.updateMediaQuery.bind(this));
    }
  }

  componentDidUpdate(prevProps) {
    const { props, state } = this;
    const { errors } = state;
    const { isOpened, location } = props;

    if (
      (isRouteSearch() && prevProps.location !== location)
      || prevProps.activeCollection?._id !== props.activeCollection?._id
    ) {
      this.getUploadPermission();
    }

    if (!prevProps.isOpened && isOpened) {
      this.setRequiredCustomFields('update');
      this.setErrors();
    }
  }

  componentWillUnmount() {
    this.removeDropListeners();
    if (this.props.picsioStorage && this.props.chatSupport) {
      window.removeEventListener('resize', this.updateMediaQuery.bind(this));
    }
  }

  setErrors = (errors = {}) => this.setState({ errors });

  getRequiredFields = () => {
    const {
      team: { policies = {} },
    } = this.props;

    return {
      comments: policies.commentsRequired,
      titleAndDescription: policies.titleAndDescriptionRequired,
      keywords: policies.keywordsRequired,
      assignees: policies.assigneesRequired,
      flag: policies.flagRequired,
      rating: policies.ratingRequired,
      color: policies.colorRequired,
      assetMarks: policies.flagRequired || policies.ratingRequired || policies.colorRequired,
      customFieldsRequired: policies.customFieldsRequired || [],
    };
  };

  getUploadPermission = () => {
    let { canUpload } = this.state;
    const { lightboardId, tagId } = this.props.location.query;
    if (lightboardId) {
      canUpload = true;
    } else if (isRouteFiltering()) {
      canUpload = this.props.collectionsTree.my.permissions.upload;
    } else if (tagId && this.props.activeCollection) {
      canUpload = this.props.activeCollection.permissions.upload;
    }

    this.setState({ canUpload });
  }

  makePermissionsAndFieldsValues = (groups) => {
    const groupsToAnalyze = groups || this.state.groups;
    let permissions = { ...this.state.permissions };
    const additionalFieldsValues = {};

    let collectionPaths = Object.keys(groupsToAnalyze);
    collectionPaths = collectionPaths
      .filter((collectionPath) => !collectionPath.startsWith('Lightboards/'))
      .map((collectionPath) => collectionPath.replace(`${this.rootCollection}/`, this.pathPrefix));

    if (!collectionPaths.length) {
      return { normalizedPermissions: getPermissionsCollection(), additionalFieldsValues: {} };
    }

    permissions = this.checker.permissionsByPaths(collectionPaths);

    for (const permission in permissions) {
      if (permissions[permission] === false) {
        switch (permission) {
        case 'editAssetTitle':
          additionalFieldsValues.title = '';
          break;
        case 'editAssetDescription':
          additionalFieldsValues.description = '';
          break;
        case 'editAssetKeywords':
          additionalFieldsValues.selectedKeywords = [];
          break;
        case 'editAssetAssignees':
          additionalFieldsValues.selectedUsers = [];
          break;
        case 'editAssetMarks':
          additionalFieldsValues.flag = null;
          additionalFieldsValues.rating = null;
          additionalFieldsValues.color = null;
          break;
        case 'editAssetMetadata':
          additionalFieldsValues.selectedCustomFields = [];
          break;
        }
      }
    }

    return { normalizedPermissions: permissions, additionalFieldsValues };
  };

  checkUploadQueue = () => {
    const uploadQueue = utils.LocalStorage.get('uploadQueue');
    if (uploadQueue) {
      const groups = {};
      let totalFilesCount = 0;
      /** prepare files to set inside state */
      Object.keys(uploadQueue).forEach((path) => {
        const notCompletedFiles = uploadQueue[path].filter((file) => !file.complete);
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
        }
      });

      Logger.log('UI', 'ImportRestoreUploadDialog');
      showDialog({
        title: localization.IMPORT.restoreUpload.title,
        text: localization.IMPORT.restoreUpload.text,
        textBtnCancel: localization.IMPORT.restoreUpload.btnCancel,
        textBtnOk: localization.IMPORT.restoreUpload.btnOk,
        onOk: () => {
          this.setState({ groups, totalFilesCount });
          this.props.mainActions.openImport();
          utils.LocalStorage.remove('uploadQueue');
          Logger.log('User', 'ImportRestoreUploadDialogOk');
        },
        onCancel: () => {
          utils.LocalStorage.remove('uploadQueue');
          Logger.log('User', 'ImportRestoreUploadDialogCancel');
        },
        onClose: () => {},
      });
    }
  };

  /**
   * Set collection name
   * @param {string} collectionName
   */
  setCollectionName = (collectionName) => this.setState({ collectionName });

  hasItems = () => !!Object.keys(this.state.groups).length;

  isVisible = () => this.props.isOpened;

  updateState = (data) => this.setState(data);

  /**
   * Receive files
   * @param {Array} files
   * @param {boolean?} alreadyNormalized
   */
  addFiles = (files, alreadyNormalized = false) => {
    const { state, props } = this;

    const { subscriptionFeatures = {} } = props.user;
    const { assetsLimit, assetsCount } = subscriptionFeatures;
    if (assetsCount > assetsLimit) {
      showAssetsLimitExceededDialog();
      return;
    }

    if (!state.canUpload) {
      new Dialogs.Text({
        title: localization.IMPORT.textUpload,
        html: localization.IMPORT.textYouCannotUpload(this.rootCollection),
      });
      return;
    }

    if (state.inProgress) {
      helpers.showBusyDialog();
      return;
    }

    let filesToAdd = files;
    if (!alreadyNormalized) {
      const { normalizedFiles, corruptedFiles } = helpers.normalizeFiles(
        files, null, props.collectionsTree, props.lightboards,
      );
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
        let { totalFilesCount } = state;
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

        const {
          normalizedPermissions,
          additionalFieldsValues,
        } = this.makePermissionsAndFieldsValues(groups);
        this.setState({
          groups,
          totalSize,
          totalFilesCount,
          tmpFilesCount: 0,
          permissions: normalizedPermissions,
          ...additionalFieldsValues,
        });
        this.props.uploadListActions.update({ totalCount: totalFilesCount, totalSize });
      };
      /** if every image is revision or replacing then don't show popup,
       because it doesn't matter what collection was selected */
      if (
        (UtilsCollections.isRootActive() || isRouteFiltering())
        && !resolvedFiles.every(
          (file) => file.action === 'addRevision' || file.action === 'replaceFile',
        )
      ) {
        const params = {
          title: localization.IMPORT.titleSelectCollection,
          text: [
            `<div>${localization.IMPORT.textItBetterToUpload(this.rootCollection)}</div>`,
          ].join(''),
          textBtnCancel: localization.DIALOGS.btnCancel,
          textBtnOk: localization.IMPORT.textContinue,
          onCancel: () => {
            Logger.log('User', 'SelectCollectionDialogCancel');
            this.setState({ tmpFilesCount: 0 });
            this.props.mainActions.closeImport();
          },
          onOk: () => {
            Logger.log('User', 'SelectCollectionDialogContinue');
            doAdd();
          },
          style: { width: 700 },
        };
        Logger.log('UI', 'SelectCollectionDialog');
        showDialog(params);
      } else {
        doAdd();
      }
    };

    const add = async () => {
      const { tagId, lightboardId } = props.location.query;
      this.props.mainActions.openImport();

      // activate Import panel on mobile
      if (window.innerWidth < 1024) {
        this.props.mainActions.setMobileAdditionalScreenPanel('Upload');
      }

      /** Find local duplicates */
      const localDuplicates = helpers.findDuplicatedFilesLocal(this.state.groups, filesToAdd);
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
            (duplicate) => duplicate.name === file.path
              + file.name && duplicate.size === file.file.size,
          ),
        );
        /** If all is duplicates - exit */
        if (filesToAdd.length < 1) return;
      }

      this.setState({ tmpFilesCount: filesToAdd.length });

      /** Find duplicates on server */
      let duplicates;
      try {
        const { data } = await sdk.assets.detectDuplicates(
          filesToAdd.map((file) => file.file.name),
          tagId,
          lightboardId,
        );
        duplicates = data;
      } catch (error) {
        /** if "Too many items to analyze" ( more than 10 000 ) */
        const errorStatus = utils.getStatusFromResponceError(error);
        if (errorStatus === 413) {
          let { text } = localization.IMPORT.toManyAssetsForAnalysis;
          let textBtnCancel = localization.IMPORT.toManyAssetsForAnalysis.btnCancel;
          if (this.isUserOnS3) {
            text = localization.IMPORT.toManyAssetsForAnalysis.textS3;
            textBtnCancel = localization.IMPORT.toManyAssetsForAnalysis.btnCancelS3;
          }
          showDialog({
            title: localization.IMPORT.toManyAssetsForAnalysis.title,
            text,
            textBtnCancel,
            onCancel: this.clearItems,
            textBtnOk: this.isUserOnS3 ? null : localization.IMPORT.toManyAssetsForAnalysis.btnOk,
            onOk: () => {},
            style: { maxWidth: 700 },
          });
        } else {
          Logger.error(
            new Error('Can not find duplicates on the server'),
            { error, showDialog: true },
            ['FindDuplicatesFailed', (error && error.message) || 'NoMessage'],
          );
        }
      }

      if (duplicates && duplicates.length) {
        /** Resolve duplicates */
        const dialog = new ResolveDuplicatesDialog(() => this.setState({ tmpFilesCount: 0 }));
        filesToAdd = await dialog.resolve(duplicates, filesToAdd);
      }

      remove(filesToAdd, (file) => file.action === 'skipFile');
      addToState(filesToAdd);
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
    const { groups, totalSize } = await helpers.restoreFile(
      this.state.groups,
      groupPath,
      itemID,
      file,
    );
    if (groups) {
      this.setState({ groups, totalSize });
    }
  };

  /**
   * Remove file from state
   * @param {number[]} itemIDs
   */
  removeFiles = (itemIDs) => {
    const groups = { ...this.state.groups };
    let { totalFilesCount } = this.state;
    Object.keys(groups).forEach((path) => {
      /** @type {Array} */
      const removed = remove(groups[path], (item) => itemIDs.includes(item.id));
      totalFilesCount -= removed.length;

      /** delete empty path */
      if (groups[path].length === 0) delete groups[path];
    });
    const totalSize = utils.bytesToSize(helpers.calculateTotalSize(groups));

    const { normalizedPermissions } = this.makePermissionsAndFieldsValues(groups);
    this.setState({
      groups,
      totalSize,
      totalFilesCount,
      permissions: normalizedPermissions,
    });
    this.props.uploadListActions.update({ totalCount: totalFilesCount, totalSize });
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
          const connection = utils.getNavigatorConnectionInfo();
          Logger.error(new Error('Import: can not handle dropped files'), { error }, [
            'ImportCantHandleDroppedFiles',
            {
              errorMessage: (error && error.message) || 'NoMessage',
              userDialogueMessage: localization.IMPORT.cantHandleDroppedFiles.text,
              connection,
            },
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
            files,
            this.props.collectionsTree,
            this.props.lightboards,
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
      /** if Preview is open */
      if (document.querySelector('.preview')) return;

      const fileType = event.dataTransfer.types[0];
      const isChromeDataTransferTypes = fileType === 'Files';
      const isMozDataTransferTypes = fileType === 'application/x-moz-file';
      const isSafariDataTransferTypes = fileType === 'public.file-url';

      if (isChromeDataTransferTypes || isMozDataTransferTypes || isSafariDataTransferTypes) {
        !this.props.isOpened && this.props.mainActions.openImport();
      }
    }
  };

  handleDragOver = (event) => event.preventDefault(); // Necessary. Allows us to drop

  /** Click on button "Clear" */
  clearItems = () => {
    this.setState({
      groups: {},
      totalSize: 0,
      totalFilesCount: 0,
      tmpFilesCount: 0,
      errors: {},
    });
    this.props.uploadListActions.update({ totalCount: 0, totalSize: 0 });
    Logger.log('User', 'UploadPanelClearAll');
  };

  validateRequiredFields = () => {
    const {
      comment,
      title,
      description,
      selectedKeywords,
      selectedUsers,
      flag,
      rating,
      color,
      requiredCustomFields,
      permissions,
    } = this.state;
    const requiredFields = this.getRequiredFields();
    const errors = {};

    if (requiredFields.comments && !comment.length) {
      errors.comment = localization.IMPORT.textFieldIsRequired;
    }
    if (requiredFields.titleAndDescription) {
      if (!title.length) {
        errors.title = localization.IMPORT.textFieldIsRequired;
      }
      if (!description.length) {
        errors.description = localization.IMPORT.textFieldIsRequired;
      }
    }
    if (requiredFields.keywords && !selectedKeywords.length) {
      errors.keywords = localization.IMPORT.textFieldIsRequired;
    }
    if (requiredFields.assignees && !selectedUsers.length) {
      errors.assignees = localization.IMPORT.textFieldIsRequired;
    }
    if (requiredFields.flag && !flag) {
      errors.flag = true;
      errors.assetMarks = localization.IMPORT.textFieldIsRequired;
    }
    if (requiredFields.rating && !rating) {
      errors.rating = true;
      errors.assetMarks = localization.IMPORT.textFieldIsRequired;
    }
    if (requiredFields.color && !color) {
      errors.color = true;
      errors.assetMarks = localization.IMPORT.textFieldIsRequired;
    }
    if (requiredCustomFields.length) {
      const requiredCustomFieldsErrors = {};

      requiredCustomFields.forEach((item) => {
        const { type, value } = item;
        const isValid = this.checkValidCustomField(value, type);

        if (!isValid) {
          requiredCustomFieldsErrors[item.title] = localization.IMPORT.textFieldIsRequired;
        }
      });

      if (!_isEmpty(requiredCustomFieldsErrors)) {
        errors.requiredCustomFields = requiredCustomFieldsErrors;
      }
    }
    const isValid = _isEmpty(errors);

    this.setErrors(errors);

    if (errors.keywords && !permissions.editAssetKeywords) {
      showDialog({
        title: localization.DIALOGS.UPLOAD_KEYWORDS_PERMISSION.TITLE,
        text: localization.DIALOGS.UPLOAD_KEYWORDS_PERMISSION.TEXT,
        textBtnCancel: null,
        textBtnOk: localization.DIALOGS.UPLOAD_KEYWORDS_PERMISSION.OK_TEXT,
      });
    }

    return isValid;
  };

  handleClickUpload = () => {
    Logger.log('User', 'UploadPanelStartUploading', this.state.totalFilesCount);
    const isValid = this.validateRequiredFields();

    if (!isValid || this.state.totalFilesCount < 1) return;
    /** start */
    this.setState({ inProgress: true });
  };

  getRequiredAssetMarksNames = () => {
    const requiredFields = this.getRequiredFields();
    const { flag, color, rating } = requiredFields;

    if (flag && color && rating) {
      return null;
    }
    if (flag && color) {
      return localization.IMPORT.flagAndColor;
    }
    if (flag && rating) {
      return localization.IMPORT.flagAndRating;
    }
    if (color && rating) {
      return localization.IMPORT.colorAndRating;
    }
    if (color) {
      return localization.IMPORT.colorOnly;
    }
    if (rating) {
      return localization.IMPORT.ratingOnly;
    }
    if (flag) {
      return localization.IMPORT.flagOnly;
    }
    return null;
  };

  /**
   * Handle upload complete
   * @param {number} countUploadedFiles
   * @param {number} totalUploadedSize
   * @param {string[]} collectionNames
   * @param {string[]} lightboardsIDs
   * @param {string[]} collectionsIDs
   */
  handleUploadComplete = (
    countUploadedFiles,
    totalUploadedSize,
    collectionNames,
    lightboardsIDs,
    collectionsIDs,
  ) => {
    if (countUploadedFiles > 0) {
      /** show alert */
      Toast(
        localization.IMPORT.textFilesUploaded({
          value1: countUploadedFiles,
          value2: utils.bytesToSize(totalUploadedSize),
          value3: collectionNames.join(', '),
        }),
        { audit: true },
      );

      const { tagId, lightboardId } = this.props.location.query;
      /** update catalog view
       * if files loaded in current folder */
      if (
        (tagId && collectionsIDs.includes(tagId))
        || (lightboardId && lightboardsIDs.includes(lightboardId))
      ) {
        /** we use "delay" just after importing assets from import panel
          it's needed, because assets uploading to mongodb, then to the elastic
          but get requests works through the elastic, so we should wait about 2sec,
          when asets will be uploaded to the elastic */
        this.props.assetsActions.getAssets(true, 2000);
      }
      this.props.mainActions.closeImport();
    }

    this.setState({
      inProgress: false,
      groups: {},
      totalFilesCount: 0,
      totalSize: '0',
      selectedKeywords: [],
      selectedUsers: [],
      comment: '',
      errors: {},
      title: '',
      description: '',
      rating: null,
      flag: null,
      color: null,
      selectedCustomFields: [],
      requiredCustomFields: this.getRequiredCustomFields('clear'),
    });
    this.props.uploadListActions.update({ totalCount: 0, totalSize: 0 });
  };

  handleUploadCancel = () => {
    this.setState({
      inProgress: false,
    });
  };

  handleClickClose = () => {
    this.props.mainActions.closeImport();
    Logger.log('User', 'UploadPanelClose');
  };

  checkValidCustomField = (value, type) => {
    if (value === undefined || value === null) {
      return false;
    }
    if ((typeof value === 'string' || typeof value === 'boolean') && !value) {
      return false;
    }
    if (typeof value === 'number') {
      if (type !== 'enum') {
        return value > 0;
      }
    }
    return true;
  };

  getValidCustomFieldValue = ({ type, value, multiple }) => {
    let validValue = value;

    switch (type) {
    case 'enum':
      if (multiple) {
        validValue = typeof value === 'number' ? '' : value;
      } else {
        validValue = 0;
      }
      break;
    case 'int':
      validValue = 0;
      break;
    case 'input':
      validValue = '';
      break;
    case 'boolean':
      validValue = false;
      break;
    default:
      break;
    }
    return validValue;
  };

  selectCustomField = (item) => {
    const { selectedCustomFields } = this.state;
    const value = this.getValidCustomFieldValue(item);

    this.setState({ selectedCustomFields: selectedCustomFields.concat({ ...item, value }) });
  };

  deselectCustomField = (item) => {
    const { selectedCustomFields } = this.state;
    const result = selectedCustomFields.filter((field) => field.title !== item.title);
    this.setState({ selectedCustomFields: result });
  };

  onChangeCustomField = (order, value, config) => {
    const stateKey = config?.required ? 'requiredCustomFields' : 'selectedCustomFields';
    const { [stateKey]: selectedCustomFields } = this.state;

    const selectedCustomFieldsUpdate = selectedCustomFields.map((item) => {
      if (item.order === order) {
        let newItem = item.value;
        if (config?.multipleAttach) {
          if (config?.isAttach) {
            newItem = `${item.value},${value}`;
          } else {
            const values = item.value.split(',');
            const index = values.findIndex((fields) => fields === value);
            values.splice(index, 1);
            newItem = values.join(',');
          }
          return {
            ...item,
            value: newItem,
          };
        }
        return {
          ...item,
          value,
        };
      }
      return item;
    });

    this.setState({ [stateKey]: selectedCustomFieldsUpdate });
  };

  getRequiredCustomFields = (action = 'clear') => {
    const { requiredCustomFields } = this.state;
    const {
      team: { policies },
      allCustomFields,
    } = this.props;
    const { customFieldsRequired } = policies;

    if (customFieldsRequired) {
      return allCustomFields.reduce((acc, field) => {
        const isRequired = customFieldsRequired[field.title];

        if (isRequired) {
          if (action === 'update') {
            const existedField = requiredCustomFields.find(({ title }) => title === field.title);

            if (existedField) {
              acc.push(existedField);

              return acc;
            }
          }
          const value = this.getValidCustomFieldValue(field);

          acc.push({ ...field, value });
        }
        return acc;
      }, []);
    }
    return [];
  };

  setRequiredCustomFields = (action) => {
    const { selectedCustomFields } = this.state;
    const requiredCustomFields = this.getRequiredCustomFields(action);
    const selected = selectedCustomFields.filter(
      (s) => !requiredCustomFields.find((r) => r.title === s.title),
    );

    this.setState({ requiredCustomFields, selectedCustomFields: selected });
  };

  onChangeRequiredCustomField = (order, value, config) => {
    const { errors } = this.state;
    const { allCustomFields } = this.props;
    const customField = allCustomFields.find((item) => item.order === order);

    if (errors.requiredCustomFields) {
      const { title, type } = customField;
      const isValid = this.checkValidCustomField(value, type);

      if (isValid) {
        delete errors.requiredCustomFields[title];

        if (!Object.keys(errors.requiredCustomFields).length) {
          delete errors.requiredCustomFields;
        }
      }
      this.setState({ errors });
    }
    this.onChangeCustomField(order, value, { ...config, required: true });
  };

  handleLiveSupport = () => {
    if (this.props.chatSupport) {
      window.dispatchEvent(new Event('toolbar:ui:liveSupport'));
      Logger.log('User', 'MigrationOfferUploadPanelClicked');
    }
  };

  updateMediaQuery() {
    this.setState({ isHiddenBtnOpenLiveSupport: window.innerWidth < 1170 });
  }

  render() {
    const { state, props } = this;
    const requiredFields = this.getRequiredFields();
    const isCommentsAllowed = Boolean(props.user.subscriptionFeatures?.comments);
    const isCustomFieldsAllowed = Boolean(props.user.subscriptionFeatures?.customFields);
    const isBtnUploadDisabled = !isEmpty(state.errors);
    const { isHiddenBtnOpenLiveSupport } = this.state;

    return (
      <ErrorBoundary>
        <CSSTransition
          in={props.isOpened}
          timeout={300}
          classNames={window.innerWidth < 1024 ? 'fade' : 'showImportPanel'}
        >
          <div id="import">
            <div className={cn('importInner', { uploadInProgress: state.inProgress })}>
              <div className="importTop">
                {state.collectionName}
                <UiButton
                  variant="text"
                  color="primary"
                  endIcon={<Question />}
                  onClick={() => {
                    window.open('https://help.pics.io/en/articles/1269153-uploading-new-files', '_blank');
                    Logger.log('User', 'Help', 'uploadPanel');
                  }}
                  className="importHelpButton"
                >
                  {localization.IMPORT.helpLink}
                </UiButton>
                {/* <HelpButton
                  icon="question"
                  additionalClass="importHelpButton"
                  tooltipPosition="bottom"
                  component="uploadPanel"
                /> */}
                <Button
                  id="button-minimizeImport"
                  icon="minimize"
                  additionalClass="importHideView"
                  onClick={this.handleClickClose}
                  tooltip={localization.GLOBAL.tooltipMinimize}
                  tooltipPosition="bottom"
                />
              </div>
              <div className="importMain">
                {/* Content */}
                <div className="importContent">
                  <If condition={props.isOpened}>
                    <AdditionalFields
                      requiredFields={requiredFields}
                      isCommentRequired={requiredFields.comments}
                      permissions={state.permissions}
                      totalFilesCount={state.totalFilesCount}
                      disabled={state.inProgress}
                      collectionName={state.collectionName}
                      selectedKeywords={state.selectedKeywords}
                      selectedUsers={state.selectedUsers}
                      comment={state.comment}
                      clearItems={this.clearItems}
                      updateState={this.updateState}
                      errors={state.errors}
                      title={state.title}
                      description={state.description}
                      rating={state.rating}
                      flag={state.flag}
                      position="top"
                      color={state.color}
                      selectedCustomFields={state.selectedCustomFields}
                      requiredCustomFields={state.requiredCustomFields}
                      selectCustomField={this.selectCustomField}
                      deselectCustomField={this.deselectCustomField}
                      onChangeCustomField={this.onChangeCustomField}
                      onChangeRequiredCustomField={this.onChangeRequiredCustomField}
                      getRequiredAssetMarksNames={this.getRequiredAssetMarksNames}
                      isKeywordsActionsAllowed={props.user.isKeywordsActionsAllowed}
                      isCommentsAllowed={isCommentsAllowed}
                      isCustomFieldsAllowed={isCustomFieldsAllowed}
                    />
                  </If>
                  <div className="importMainLeft">
                    <div className="importInfo">
                      {/* Number of files */}
                      <div
                        className={cn('importNumberFiles', {
                          hideBtn: state.totalFilesCount === 0,
                          hidden: state.inProgress,
                        })}
                      >
                        <span className="btnRemoveImportFile" onClick={this.clearItems}>
                          <Icon name="close" />
                        </span>
                        {pluralize('file', state.totalFilesCount, true)}
                        <span className="forMobile"> to {state.collectionName}</span>
                      </div>
                    </div>
                    {state.inProgress && (
                      <UploadQueue
                        user={props.user}
                        userActions={props.userActions}
                        groups={state.groups}
                        totalFilesCount={state.totalFilesCount}
                        onComplete={this.handleUploadComplete}
                        onCancel={this.handleUploadCancel}
                        pushCollections={props.collectionsActions.pushCollections}
                        addRevisionAction={props.assetsActions.addRevision}
                        changeCountInCollectionAction={props.collectionsActions.changeCount}
                        isImportPanelShow={props.isOpened}
                        comment={state.comment}
                        title={state.title}
                        description={state.description}
                        selectedKeywords={state.selectedKeywords}
                        selectedUsers={state.selectedUsers}
                        flag={state.flag}
                        color={state.color}
                        rating={state.rating}
                        selectedCustomFields={state.selectedCustomFields}
                        requiredCustomFields={state.requiredCustomFields}
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
                              isImportPanelShow={props.isOpened}
                            />
                          )}
                          <TempItems count={state.tmpFilesCount} />
                        </div>
                        <div className="importButtons">
                          <div className="importTotalSize">Total: {state.totalSize}</div>
                          <div className="importButtonsGroup">
                            <div
                              className={cn('btnClearPanel picsioDefBtn', {
                                disable: isBtnUploadDisabled,
                              })}
                              onClick={isBtnUploadDisabled ? null : this.clearItems}
                              role="presentation"
                            >
                              {localization.IMPORT.textClear}
                            </div>
                          </div>
                          <div className="importButtonsGroup">
                            {(!isHiddenBtnOpenLiveSupport
                              && props.chatSupport
                              && props.picsioStorage) && (
                              <div
                                id="itemliveSupport"
                                className="PicsioButton btnOpenLiveSupport PicsioButton--text PicsioButton--color--primary PicsioButton--size--default"
                                onClick={this.handleLiveSupport}
                                role="presentation"
                                data-testId="import-liveSupportButton"
                              >
                                {localization.IMPORT.uploadPanelOfferText}
                              </div>
                            )}
                            <div
                              className="btnAddMore picsioDefBtn"
                              onClick={() => Logger.log('User', 'UploadPanelAddMoreFiles')}
                              role="presentation"
                              aria-label="add more"
                            >
                              {localization.IMPORT.textBrowse}
                              <input
                                type="file"
                                id="load-files"
                                onChange={this.handleChangeInputFile}
                                multiple
                              />
                            </div>
                            <Tooltip
                              placement="top"
                              content={isBtnUploadDisabled
                                ? localization.IMPORT.textNeedRequiredFields
                                : null}
                            >
                              <div
                                className={cn('btnStartUploading picsioDefBtn btnCallToAction', {
                                  disable: isBtnUploadDisabled,
                                })}
                                onClick={isBtnUploadDisabled ? null : this.handleClickUpload}
                                role="presentation"
                              >
                                <Icon name="upload" />
                                {localization.IMPORT.textUpload}
                              </div>
                            </Tooltip>
                          </div>
                        </div>
                      </>
                    ) : (
                      !state.inProgress && <Placeholder onChange={this.handleChangeInputFile} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CSSTransition>
      </ErrorBoundary>
    );
  }
}

const ConnectedImport = connect(
  (state) => ({
    location: state.router.location,
    isOpened: state.main.importOpened,
    collectionsTree: state.collections.collections,
    activeCollection: state.collections.activeCollection,
    lightboards: state.lightboards.lightboards,
    allCustomFields: state.customFields.items,
    team: state.user.team,
    user: state.user,
    chatSupport: state.user.subscriptionFeatures?.chatSupport || false,
    picsioStorage: state.user.picsioStorage,
  }),
  (dispatch) => ({
    mainActions: bindActionCreators(mainActions, dispatch),
    assetsActions: bindActionCreators({ getAssets, addRevision }, dispatch),
    collectionsActions: bindActionCreators({ pushCollections, changeCount }, dispatch),
    userActions: bindActionCreators(userActions, dispatch),
    uploadListActions: bindActionCreators(uploadListActions, dispatch),
  }),
)(Import);

export default (props) => (
  <Provider store={store}>
    <ConnectedImport {...props} />
  </Provider>
);
