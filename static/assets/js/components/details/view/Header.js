import React from 'react';
import { object, bool, array, number, func } from 'prop-types';
import cn from 'classnames';
import { Button } from '@picsio/ui';
import ua from '../../../ua';
import * as utils from '../../../shared/utils';
import localization from '../../../shared/strings';
import Logger from '../../../services/Logger';
import showExportCsvDialog from '../../../helpers/showExportCsvDialog';
import { showDownloadDialog } from '../../../helpers/fileDownloader';
import { Input } from '../../../UIComponents';
import Icon from '../../Icon';
import LockMenu from './LockMenu';
import AssetsMenu from './AssetsMenu';
import { showDialog } from '../../dialog';
import { isRoutePreview } from '../../../helpers/history';

class Header extends React.Component {
  state = {
    name: '',
    assetNewName: '',
    assetExt: '',
    renaming: false,
    renameInProgress: false,
    error: null,
  };

  static getDerivedStateFromProps(props, state) {
    if (props.collection.length === 1) {
      let newState = { name: props.collection[0].name, error: props.error };
      if (props.collection[0].name !== state.name || state.error !== props.error) {
        /* if name changed */
        newState = {
          ...newState,
          assetNewName: '',
          assetExt: '',
          renaming: false,
          renameInProgress: false,
        };
      }
      return newState;
    }
    return null;
  }

  downloadSelectedImages = () => {
    Logger.log('User', 'InfoPanelDownload');
    showDownloadDialog(this.props.selectedAssetsIds);
  };

  removeSelectedImages = () => {
    Logger.log('User', 'InfoPanelTrash');
    this.props.deleteAll(this.props.selectedAssetsIds, this.props.isRemoveForever);
  };

  initAssetRenaming = () => {
    Logger.log('User', 'InfoPanelRename');
    if (this.props.permissions.fileNameEditable !== true || this.props.collection.length > 1)
      return;

    const assetNameFull = this.props.collection[0].name.split('.');
    const assetExt = assetNameFull.pop();
    const assetNewName = assetNameFull.join('.');
    this.setState(
      {
        renaming: true,
        assetExt,
        assetNewName,
      },
      () => {
        this.$inputName.select();
      }
    );
  };

  handleDuplicate = () => {
    const id = this.props.selectedAssetsIds[0];
    this.props.actions.duplicateAsset(id, true, true)
  }

  handleInputRenameBlur = () => {
    const id = this.props.selectedAssetsIds[0];
    const { collection } = this.props;
    const { assetExt } = this.state;
    const assetNewName = this.state.assetNewName.trim();
    const currentModel = collection.find((model) => model._id === id);
    const name = `${assetNewName}.${assetExt}`;

    /** if name is changed and new name is not empty - do rename */
    if (currentModel.name !== name && assetNewName !== '') {
      this.setState({ renameInProgress: true });
      this.props.actions.rename(id, name);
    } else {
      this.setState({ renaming: false });
    }
  };

  handleInputRenameKeyDown = (event) => {
    if (event.keyCode === 13) {
      this.handleInputRenameBlur();
    }

    if (event.keyCode === 27) {
      this.setState({ renaming: false });
    }
  };

  handleInputRenameChange = () => {
    const assetNewName = this.$inputName.value;
    this.setState({ assetNewName });
  };

  refName = (node) => (this.$inputName = node);

  exportToCSV = () => {
    const ASSETS_LIMIT = 65000;
    if (ua.browser.isNotDesktop()) {
      /** Mobile devices is not supported */
      const { title, text, textBtnCancel } = localization.EXPORT_TO_CSV_DIALOG.notAvailable;
      showDialog({
        title,
        text,
        textBtnCancel,
        textBtnOk: null,
      });
      return;
    }
    if (this.props.selectedAssetsIds.length > ASSETS_LIMIT) {
      /** More than ASSETS_LIMIT */
      const { title, text, textBtnCancel } = localization.EXPORT_TO_CSV_DIALOG.assetsLimit;
      showDialog({
        title,
        text: text(utils.formatNumberWithSpaces(ASSETS_LIMIT)),
        textBtnCancel,
        textBtnOk: null,
      });
      return;
    }
    showExportCsvDialog({ assetIds: this.props.selectedAssetsIds });
  };

  render() {
    const { props, state } = this;
    const {
      collection,
      isRestricted,
      isRemoveForever,
      isDownloadable,
      permissions,
      isArchived,
      actions,
      selectedAssetsIds,
    } = props;

    const showAssetMenu =
      (permissions.assetsIsDownloadable === true &&
        (!isRestricted ||
          (isRestricted && permissions.restrictedIsDownloadableOrShareable === true))) ||
      (permissions.assetsIsRemovable === true &&
        (!isRestricted ||
          (isRestricted && permissions.restrictedIsAttachableOrRemovable === true))) ||
      (collection.length < 2 && permissions.fileNameEditable === true);

    return (
      <div data-qa="details-header" className="detailsPanel__header  detailsPanel__btns">
        <div className="detailsPanel__statistics">
          {/* filename */}
          <If condition={permissions.fileNameShow}>
            <div
              className={cn('filename', {
                disabled: state.renameInProgress,
                isRenaming: state.renaming,
              })}
              onDoubleClick={this.initAssetRenaming}
            >
              <Choose>
                <When condition={state.renaming}>
                  <Input
                    isDefault
                    type="text"
                    className="assetRenaming"
                    value={state.assetNewName}
                    onChange={this.handleInputRenameChange}
                    onKeyDown={this.handleInputRenameKeyDown}
                    onBlur={this.handleInputRenameBlur}
                    disabled={state.renameInProgress}
                    customRef={this.refName}
                  />
                </When>
                <Otherwise>
                  <Choose>
                    <When condition={collection.length === 1}>{collection[0].name}</When>
                    <Otherwise>
                      {localization.DETAILS.textSelectedFiles(
                        utils.formatNumberWithSpaces(props.selectedAssetsIds.length),
                      )}
                    </Otherwise>
                  </Choose>
                </Otherwise>
              </Choose>
            </div>
          </If>
          {/* actions buttons */}
          <If condition={props.isMainApp}>
            <div className="detailsPanel__statistics__btns">
              <LockMenu
                currentLock={props.currentLock}
                detailsPanelEditable={props.detailsPanelEditable}
                toggleEditable={props.toggleEditable}
                disabled={props.lockMenuDisabled}
              />

              <If condition={showAssetMenu}>
                <AssetsMenu
                  assetId={selectedAssetsIds[0]}
                  isDownloadable={isDownloadable}
                  isRestricted={isRestricted}
                  isRemoveForever={isRemoveForever}
                  permissions={permissions}
                  downloadSelectedImages={this.downloadSelectedImages}
                  exportToCSV={this.exportToCSV}
                  removeSelectedImages={this.removeSelectedImages}
                  initAssetRenaming={this.initAssetRenaming}
                  isLightboardsView={Boolean(collection[0].lightboards?.length > 0)}
                  isInbox={Boolean(collection[0].inbox)}
                  collectionLength={collection.length}
                  isArchived={Boolean(isArchived)}
                  duplicateAsset={actions.duplicateAsset}
                />
              </If>
            </div>
          </If>
        </div>
        <If condition={isArchived}>
          <div className="detailsPanel__note">
            <Icon name="archive" />
            <span>{`Asset${
              props.selectedAssetsIds.length > 1 ? 's are' : ' is'
            } archived, read only`}</span>
          </div>
        </If>
        {/* selectAll/deselectAll buttons */}
        <If condition={props.total >= 1}>
          <div className="detailsPanel__btns__holder">
            {props.total !== props.selectedAssetsIds.length && (
              <Button
                id="button-selectAll"
                variant="contained"
                color="secondary"
                onClick={() => {
                  props.selectAll();
                  Logger.log('User', 'InfoPanelSelectAll');
                }}
                size="md"
                fullWidth
              >
                {localization.DETAILS.textSelectedAll}
              </Button>
            )}
            <If condition={!isRoutePreview()}>
              <Button
                id="button-deselectAll"
                variant="contained"
                color="secondary"
                onClick={() => {
                  props.deselectAll();
                  Logger.log('User', 'InfoPanelDeselectAll');
                }}
                size="md"
                fullWidth
              >
                {localization.DETAILS.textDeselectAll}
              </Button>
            </If>
          </div>
        </If>
      </div>
    );
  }
}

Header.propTypes = {
  actions: object,
  isMainApp: bool,
  permissions: object,
  collection: array,
  total: number,
  selectedAssetsIds: array,
  detailsPanelEditable: object,
  currentLock: bool,
  toggleEditable: func,
  selectAll: func,
  deselectAll: func,
  deleteAll: func,
  isDownloadable: bool,
  error: object,
  lockMenuDisabled: bool,
  isRestricted: bool,
  isRemoveForever: bool,
  isArchived: bool,
};

export default Header;
