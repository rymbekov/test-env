import React from 'react';

import { useSelector, useDispatch } from 'react-redux';
import {
  Close,
  Compare,
  Download,
  DownloadList,
  Delete,
  DeleteFrom,
  RestoreFrom,
  Share,
  ArrowPrev,
  Info,
} from '@picsio/ui/dist/icons';
import picsioConfig from '../../../../../config';
import Logger from '../../services/Logger';

import { showDownloadDialog } from '../../helpers/fileDownloader';
import { setMobileMainScreenPanel, toggleDownloadList } from '../../store/actions/main';
import {
  deselectAll, trashAssets, deleteAssets, restoreAssets,
} from '../../store/actions/assets';
import { allowedActionsSelector, selectedAssetsIdsSelector } from '../../store/selectors/assets';
import { navigate } from '../../helpers/history';

import Group from './Group';
import Button from './Button';

export default function MobileToolbarSelectedAssetsTop() {
  const dispatch = useDispatch();
  const allowedActions = useSelector((state) => allowedActionsSelector(state));
  const selectedItems = useSelector((state) => selectedAssetsIdsSelector(state));

  const { mobileMainScreenPanelActive, downloadListOpened, importOpened } = useSelector(
    (state) => state.main,
  );
  const { trashed, inboxId } = useSelector((state) => state.router.location.query);
  const { items: downloadListItems } = useSelector((state) => state.downloadList);
  const { subscriptionFeatures } = useSelector((state) => state.user);

  const toggleMainPanels = (panelName) => {
    const newPanelName = mobileMainScreenPanelActive === panelName ? 'catalog' : panelName;
    dispatch(setMobileMainScreenPanel(newPanelName));
  };

  const compareAssets = () => {
    Logger.log('User', 'ComparePanelShow', subscriptionFeatures.diffTool);
    if (subscriptionFeatures.diffTool) {
      navigate(`/compare/${selectedItems.join('=')}`);
    }
  };

  const handleDeleteFromInbox = () => {
    Logger.log('UI', 'DeleteAssetsFromInbox', selectedItems.length);
    dispatch(deleteAssets(selectedItems, true));
  };

  const handleDeleteFromTrash = () => {
    Logger.log('UI', 'DeleteAssetsFromTrashDialog', selectedItems.length);
    dispatch(deleteAssets(selectedItems));
  };

  const handleRestore = () => {
    Logger.log('UI', 'ToolbarRestoreFromTrash');
    dispatch(restoreAssets(selectedItems));
  };

  const handleShare = () => {
    Logger.log('User', 'ThumbnailShareAsset');
    navigate(`/singlesharing/${selectedItems[0]}`);
  };

  const isTrash = Boolean(trashed);
  const isInbox = Boolean(inboxId);
  let canBeCompared = false;
  if (picsioConfig.isMainApp() && !isTrash && selectedItems.length === 2) {
    canBeCompared = allowedActions.canBeCompared;
  }

  return (
    <div className="toolbar toolbarSelectedAssetsTop">
      <Group>
        <Button icon={() => <Close />} iconSize="xxl" onClick={() => dispatch(deselectAll())} />
        <div className="selectedAssets">{selectedItems.length}</div>
      </Group>
      <Group>
        <If condition={canBeCompared}>
          <Button
            id="button-diff"
            icon={() => <Compare />}
            onClick={compareAssets}
            additionalClass={importOpened ? 'disabled' : null}
            isDisabled={!subscriptionFeatures.diffTool || importOpened}
          />
        </If>

        <If
          condition={
            subscriptionFeatures.assetSharing && !isTrash && !isInbox && selectedItems.length === 1
          }
        >
          <Button id="button-share" icon={() => <Share />} onClick={handleShare} />
        </If>

        <If
          condition={
            selectedItems.length > 0
            && picsioConfig.isMainApp()
            && allowedActions.isRemovable
            && !isTrash
            && !isInbox
            && allowedActions.deleteAssets === true
          }
        >
          <Button
            id="button-trash"
            icon={() => <Delete />}
            onClick={() => {
              dispatch(trashAssets());
            }}
            additionalClass={importOpened ? 'disabled' : null}
          />
        </If>

        <If condition={isTrash && selectedItems.length > 0}>
          <>
            <Button id="button-restoreFromTrash" icon={() => <RestoreFrom />} onClick={handleRestore} />
            <Button
              id="button-deleteFromTrash"
              icon={() => <DeleteFrom />}
              onClick={handleDeleteFromTrash}
            />
          </>
        </If>

        <If condition={isInbox && selectedItems.length > 0}>
          <Button id="button-trash" icon={() => <Delete />} onClick={handleDeleteFromInbox} />
        </If>

        <If
          condition={
            selectedItems.length > 0
            && picsioConfig.isMainApp()
            && allowedActions.isDownloadable
            && !isTrash
            && allowedActions.downloadFiles === true
          }
        >
          <Button
            id="button-download"
            icon={() => <Download />}
            onClick={showDownloadDialog}
            additionalClass={importOpened ? 'disabled' : null}
          />
        </If>

        <If condition={downloadListItems.length > 0 || downloadListOpened}>
          <Button
            id="button-downloadList-selected"
            icon={() => <DownloadList />}
            onClick={() => {
              Logger.log('User', 'DonwloadPanelShowClicked');
              dispatch(toggleDownloadList());
            }}
            additionalClass={downloadListOpened ? 'active' : null}
            counter={downloadListItems.length}
          />
        </If>

        <Button
          icon={mobileMainScreenPanelActive === 'details' ? () => <ArrowPrev /> : () => <Info />}
          isActive={mobileMainScreenPanelActive === 'details'}
          onClick={() => toggleMainPanels('details')}
        />
      </Group>
    </div>
  );
}
