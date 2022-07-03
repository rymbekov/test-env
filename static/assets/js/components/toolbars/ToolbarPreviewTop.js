import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  ArrowPrev,
  Download,
  Info,
  Forum,
  Close,
  Statistics,
  Edit,
} from '@picsio/ui/dist/icons';

import RevisionsDropdown from './RevisionsDropdown';
import * as utils from '../../shared/utils';
import * as actions from '../../store/actions/assets';
import { Input } from '../../UIComponents';

import Button from './Button';
import Group from './Group';
import Logo from './Logo';
import ua from '../../ua';

import localization from '../../shared/strings';
import picsioConfig from '../../../../../config';

export default function ToolbarPreviewTop(props) {
  const {
    assetName,
    pages,
    activePageNumber,
    analytics,
    download,
    historyPanel,
    details,
    onClose,
    historyItems,
    isSupportedForDiff,
    setActive,
    isDownloadable,
    activeRevisionID,
    lastRevisionNumber,
    addRevision,
    subscriptionFeatures,
    isAllowedUploadingRevision,
    isRevisionUploading,
    showRevisions,
    assetId,
  } = props;

  const isMainApp = picsioConfig.isMainApp();

  const [isRenaming, setIsRenaming] = useState(false);
  const [ext, setAssetExt] = useState('');
  const [newName, setAssetNewName] = useState('');
  const [renameInProgress, setRenameInProgress] = useState(false);
  const inputRef = useRef();
  const dispatch = useDispatch();
  const initAssetRenaming = () => {
    const assetNameFull = assetName.split('.');
    const assetExt = assetNameFull.pop();
    const assetNewName = assetNameFull.join('.');
    setIsRenaming(true);
    setRenameInProgress(false);
    setAssetExt(assetExt);
    setAssetNewName(assetNewName);
  };
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  }, [isRenaming]);
  const handleInputRenameBlur = () => {
    const name = `${newName}.${ext}`;

    if (assetName !== name && newName !== '') {
      setRenameInProgress(true);
      dispatch(actions.rename(assetId, name));
      setIsRenaming(false);
    } else {
      setIsRenaming(false);
    }
  };
  const handleInputRenameKeyDown = (event) => {
    if (event.keyCode === 13) {
      handleInputRenameBlur();
    }

    if (event.keyCode === 27) {
      setIsRenaming(false);
    }
  };

  const handleInputRenameChange = () => {
    const assetNewName = inputRef.current.value;
    setAssetNewName(assetNewName);
  };

  return (
    <div className="toolbar toolbarPreviewTop">
      <Group>
        <If condition={onClose}>
          <Choose>
            <When condition={ua.isMobileApp() || ua.browser.isNotDesktop()}>
              <Button
                id="button-backToCatalog"
                icon={() => <ArrowPrev />}
                iconSize="xl"
                onClick={onClose}
              />
            </When>
            <When condition={isMainApp}>
              <Logo handleLogoClick={onClose} />
            </When>
            <Otherwise>
              <Button
                id="button-backToCatalog"
                icon={() => <ArrowPrev />}
                iconSize="xl"
                additionalClass="color"
                onClick={onClose}
              />
            </Otherwise>
          </Choose>
        </If>
      </Group>

      <Group additionalClass="assetNameWrapper">
        <span className="previewTitle" />
        <If condition={isMainApp}>
          <Button
            icon={() => <Edit />}
            onClick={initAssetRenaming}
          />
        </If>
        <div
          className="assetName"
          onDoubleClick={isMainApp && initAssetRenaming}
        >
          <Choose>
            <When condition={isRenaming}>
              <Input
                isDefault
                type="text"
                className="assetRenaming"
                value={newName}
                onChange={handleInputRenameChange}
                onKeyDown={handleInputRenameKeyDown}
                onBlur={handleInputRenameBlur}
                disabled={renameInProgress}
                customRef={inputRef}
              />
            </When>
            <Otherwise>
              <Choose>
                <When condition={assetName}>{assetName}</When>
                <Otherwise>
                  {localization.DETAILS.textSelectedFiles(
                    utils.formatNumberWithSpaces(assetId.length),
                  )}
                </Otherwise>
              </Choose>
            </Otherwise>
          </Choose>
        </div>
        <If condition={showRevisions}>
          <RevisionsDropdown
            setActive={setActive}
            disabled={historyItems?.length === 0}
            isSupportedForDiff={isSupportedForDiff}
            isSearchable={false}
            modified
            isRevisionUploading={isRevisionUploading}
            menuPlacement="auto"
            menuPosition="fixed"
            isDownloadable={isDownloadable}
            activeRevisionID={activeRevisionID()}
            lastRevisionNumber={lastRevisionNumber}
            addRevision={addRevision}
            subscriptionFeatures={subscriptionFeatures}
            historyItems={historyItems}
            isAllowedUploadingRevision={isAllowedUploadingRevision}
          />
        </If>
        <If condition={pages || activePageNumber}>
          <span className="multipagePaging">
            <b>{activePageNumber}</b> / {pages}
          </span>
        </If>
      </Group>
      <Group>
        <If condition={download}>
          <Button
            id="button-previewDownloadTop"
            icon={() => <Download />}
            onClick={download.handler}
            additionalClass={download.additionalClass}
          />
        </If>
        <If condition={picsioConfig.isMainApp()}>
          <Button
            id="button-previewAnalytics"
            icon={() => <Statistics />}
            onClick={analytics.handler}
            isActive={analytics.isActive}
            tooltip={localization.TOOLBARS.titleAnalytics}
            tooltipPosition="bottom"
          />
        </If>

        <If condition={historyPanel}>
          <Button
            id="button-previewActivity"
            icon={() => <Forum />}
            onClick={historyPanel.handler}
            isActive={historyPanel.isActive}
            tooltip={localization.TOOLBARS.titleActivity}
            tooltipPosition="bottom"
          />
        </If>
        <If condition={details}>
          <Button
            id="button-previewDetails"
            icon={() => <Info />}
            onClick={details.handler}
            isActive={details.isActive}
            tooltip={localization.TOOLBARS.titleDetails}
            tooltipPosition="bottom"
          />
        </If>
        <If condition={onClose}>
          <Button
            id="button-previewClose"
            icon={() => <Close />}
            iconSize="xxl"
            additionalClass="mobileHidden"
            onClick={onClose}
            tooltip={localization.TOOLBARS.titleClosePreview}
            tooltipPosition="bottom"
          />
        </If>
      </Group>
    </div>
  );
}

ToolbarPreviewTop.propTypes = {
  assetName: PropTypes.string,
  pages: PropTypes.string,
  activePageNumber: PropTypes.number,
  analytics: PropTypes.object,
  download: PropTypes.bool,
  historyPanel: PropTypes.object,
  details: PropTypes.object,
  onClose: PropTypes.func,
  historyItems: PropTypes.array,
  isSupportedForDiff: PropTypes.bool,
  setActive: PropTypes.func,
  isDownloadable: PropTypes.bool,
  activeRevisionID: PropTypes.func,
  lastRevisionNumber: PropTypes.number,
  addRevision: PropTypes.func,
  subscriptionFeatures: PropTypes.object,
  isAllowedUploadingRevision: PropTypes.bool,
  isRevisionUploading: PropTypes.bool,
  showRevisions: PropTypes.bool,
  assetId: PropTypes.string,
};
