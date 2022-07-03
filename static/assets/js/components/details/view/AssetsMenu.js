import React, {
  memo, useMemo, useState, useCallback, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
  DownloadCsv,
  DotsVertical,
  Delete,
  Edit,
  Download,
  Dublicate,
} from '@picsio/ui/dist/icons';
import cn from 'classnames';
import {
  Menu, IconButton, MenuItem, MenuItemIcon, MenuItemText, Icon,
} from '@picsio/ui';
import Logger from '../../../services/Logger';
import localization from '../../../shared/strings';
import showSelectFromTreeDialog from '../../../helpers/showSelectFromTreeDialog';
import { checkUserAccess } from '../../../store/helpers/user';
import * as collectionsActions from '../../../store/actions/collections';

const AssetsMenu = (props) => {
  const {
    permissions,
    isRestricted,
    isDownloadable,
    isRemoveForever,
    collectionLength,
    downloadSelectedImages,
    exportToCSV,
    removeSelectedImages,
    initAssetRenaming,
    isArchived,
    duplicateAsset,
    isLightboardsView,
    isInbox,
    assetId,
  } = props;
  const ref = useRef();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const toggleMenu = useCallback(() => setMenuOpen((prevValue) => !prevValue), []);
  const isDownloadArchiveAllowed = isArchived ? (checkUserAccess('subscriptions', 'archive') && checkUserAccess('permissions', 'downloadArchive')) : true;
  const isDeleteArchiveAllowed = isArchived ? (checkUserAccess('subscriptions', 'archive') && checkUserAccess('permissions', 'deleteArchive')) : true;
  const isDuplicatable = collectionLength < 2 && permissions.upload === true && (!isLightboardsView && !isInbox);
  const dispatch = useDispatch();
  const myCollection = useSelector((state) => state.collections.collections.my);

  const handleDuplicate = () => {
    Logger.log('User', 'ThumbnailCopyAsset');
    const { _id } = myCollection;
    const onLoadChildren = async (item) => dispatch(collectionsActions.getChildren(item._id));

    showSelectFromTreeDialog({
      title: localization.DIALOGS.DUPLICATE_ASSET_TO.TITLE,
      treeListItems: [myCollection],
      onLoadChildren,
      onOk: async (selectedCollections) => {
        duplicateAsset(assetId, selectedCollections[0], true, true);
      },
      textBtnOk: localization.DIALOGS.DUPLICATE_ASSET_TO.OK,
      textBtnCancel: localization.DIALOGS.DUPLICATE_ASSET_TO.CANCEL,
      type: 'duplicate',
      openedItems: [_id],
    });
  };

  function generateButtons() {
    const controls = [];

    if (
      isDownloadable
      && permissions.assetsIsDownloadable === true
      && (!isRestricted
        || (isRestricted && permissions.restrictedIsDownloadableOrShareable === true))
      && (isArchived ? isDownloadArchiveAllowed : true)
    ) {
      controls.push({
        id: 'menuDownload',
        text: localization.DETAILS.textDownload,
        onClick: downloadSelectedImages,
        icon: () => <Download />,
      });

      if (isDuplicatable) {
        controls.push({
          id: 'menuDuplicate',
          text: localization.DETAILS.textDuplicate,
          onClick: handleDuplicate,
          icon: () => <Dublicate />,
        });
      }

      controls.push({
        id: 'menuExportToCSV',
        text: localization.DETAILS.textExportToCSV,
        onClick: exportToCSV,
        icon: () => <Icon size="lg"><DownloadCsv /></Icon>,
      });
    }

    if (
      permissions.assetsIsRemovable === true
        && (!isRestricted || (isRestricted && permissions.restrictedIsAttachableOrRemovable === true))
        && (isArchived ? isDeleteArchiveAllowed : true)
    ) {
      controls.push({
        id: 'menuRemoveForever',
        text: isRemoveForever
          ? localization.DETAILS.textDeleteForever
          : localization.DETAILS.textDelete,
        onClick: removeSelectedImages,
        icon: () => <Delete />,
      });
    }

    if (collectionLength < 2 && permissions.fileNameEditable === true && !isArchived) {
      controls.push({
        id: 'menuRename',
        text: localization.DETAILS.textRename,
        onClick: initAssetRenaming,
        icon: () => <Edit />,
      });
    }

    return controls;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedControls = useMemo(() => generateButtons(), [
    permissions,
    isRestricted,
    isDownloadable,
    isRemoveForever,
    collectionLength,
  ]);

  return (
    <If condition={memoizedControls.length}>
      <IconButton
        ref={ref}
        buttonSize="default"
        className={cn({ isActive: isMenuOpen })}
        color="default"
        component="button"
        disabled={false}
        id="assetMenuOpener"
        onClick={toggleMenu}
        size="lg"
      >
        <DotsVertical />
      </IconButton>
      <Menu
        target={ref}
        arrow
        padding="s"
        placement="bottom-end"
        isOpen={isMenuOpen}
        onClose={toggleMenu}
        outsideClickListener
      >
        {memoizedControls.map((control) => {
          const {
            id, text, onClick, icon: ControlIcon,
          } = control;

          return (
            <MenuItem
              key={id}
              id={id}
              onClick={() => {
                onClick();
                toggleMenu();
              }}
              className="menuItemDefault"
            >
              <MenuItemIcon size="md">
                <ControlIcon />
              </MenuItemIcon>
              <MenuItemText primary={text} />
            </MenuItem>
          );
        })}
      </Menu>
    </If>
  );
};

AssetsMenu.propTypes = {
  isDownloadable: PropTypes.bool.isRequired,
  isRestricted: PropTypes.bool.isRequired,
  isRemoveForever: PropTypes.bool.isRequired,
  permissions: PropTypes.shape({
    assetsIsDownloadable: PropTypes.bool,
    restrictedIsAttachableOrRemovable: PropTypes.bool,
    restrictedIsDownloadableOrShareable: PropTypes.bool,
    assetsIsRemovable: PropTypes.bool,
    fileNameEditable: PropTypes.bool,
    upload: PropTypes.bool,
  }).isRequired,
  downloadSelectedImages: PropTypes.func.isRequired,
  exportToCSV: PropTypes.func.isRequired,
  removeSelectedImages: PropTypes.func.isRequired,
  initAssetRenaming: PropTypes.func.isRequired,
  collectionLength: PropTypes.number.isRequired,
  isArchived: PropTypes.bool.isRequired,
  duplicateAsset: PropTypes.func.isRequired,
  isInbox: PropTypes.bool.isRequired,
  assetId: PropTypes.string.isRequired,
  isLightboardsView: PropTypes.bool.isRequired,
};

export default memo(AssetsMenu);
