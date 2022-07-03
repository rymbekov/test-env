import React, {
  memo, useMemo, useState, useCallback, useRef,
} from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import {
  Menu, IconButton, MenuItem, MenuItemIcon, MenuItemText,
} from '@picsio/ui';
import { useHistory } from 'react-router-dom';
import Logger from '../../services/Logger';
import {
  CsvImport,
  DotsVertical,
  Delete,
  Edit,
  Download,
  Move,
  StarBorder,
  Upload,
  Web,
} from '@picsio/ui/dist/icons';
import localization from '../../shared/strings';

const CollectionMenu = (props) => {
  const {
    collection,
    handleUpload,
    handleDownload,
    handleDelete,
    handleRename,
    handleWebsite,
    handleFavorite,
    handleMove,
    onChangeUpload,
    websitesAllowed,
    canUploadCsv,
  } = props;
  const history = useHistory();
  const ref = useRef();
  const inputFileRef = useRef(null);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const toggleMenu = useCallback(() => setMenuOpen((prevValue) => !prevValue), []);
  const {
    permissions, path, website, favorites,
  } = collection;

  const handleUploadClick = () => {
    inputFileRef.current.click();
    toggleMenu();
    handleUpload();
  };

  const handleCsvUpload = useCallback(() => {
    Logger.log('User', 'DetailsPanelUploadCsv');
    history.push('/csvUpload');
  }, []);

  function generateButtons() {
    const controls = [];

    if (permissions.upload) {
      controls.push({
        id: 'menuUpload',
        text: localization.TAGSTREE.textUploadFiles,
        onClick: handleUploadClick,
        icon: () => <Upload />,
      });
    }

    if (canUploadCsv) {
      controls.push({
        id: 'csvUpload',
        text: localization.CSV_IMPORT.textUploadCsv,
        onClick: handleCsvUpload,
        icon: () => <CsvImport />,
      });
    }

    if (path !== 'root' && permissions.downloadFiles) {
      controls.push({
        id: 'menuDownload',
        text: localization.TAGSTREE.textDownloadCollection,
        onClick: handleDownload,
        icon: () => <Download />,
      });
    }

    if (path !== 'root' && permissions.deleteCollections) {
      controls.push({
        id: 'menuDelete',
        text: localization.TAGSTREE.textDeleteCollection,
        onClick: handleDelete,
        icon: () => <Delete />,
      });
    }

    if (path !== 'root' && permissions.editCollections) {
      controls.push({
        id: 'menRename',
        text: localization.TAGSTREE.textRenameCollection,
        onClick: handleRename,
        icon: () => <Edit />,
      });
    }

    if (path !== 'root' && permissions.websites && websitesAllowed) {
      controls.push({
        id: 'menuWebsite',
        text: website
          ? localization.TAGSTREE.textUpdateWebsite
          : localization.TAGSTREE.textCreateWebsite,
        onClick: handleWebsite,
        icon: () => <Web />,
      });
    }

    if (path !== 'root') {
      controls.push({
        id: 'menuFavorite',
        text: favorites
          ? localization.TAGSTREE.textRemoveFromFavorites
          : localization.TAGSTREE.textAdToFavorites,
        onClick: handleFavorite,
        icon: () => <StarBorder />,
      });
    }

    if (path !== 'root' && permissions.moveCollections) {
      controls.push({
        id: 'menuMove',
        text: localization.TAGSTREE.textMoveCollection,
        onClick: handleMove,
        icon: () => <Move />,
      });
    }

    return controls;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedControls = useMemo(() => generateButtons(), [
    permissions,
    path,
    website,
    favorites,
    websitesAllowed,
  ]);

  const handleInputFile = (event) => {
    const { files } = event.target;
    if (files && files.length > 0) {
      onChangeUpload(files);
    }
  };

  return (
    <>
      <IconButton
        ref={ref}
        buttonSize="default"
        className={cn({ isActive: isMenuOpen })}
        color="default"
        component="button"
        disabled={false}
        id="collectionMenuOpener"
        onClick={toggleMenu}
        size="lg"
      >
        <DotsVertical />
        <input
          type="file"
          ref={inputFileRef}
          multiple
          className="infoCollectionUpload"
          onChange={handleInputFile}
        />
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
    </>
  );
};

CollectionMenu.defaultProps = {
  canUploadCsv: false,
};

CollectionMenu.propTypes = {
  collection: PropTypes.shape({
    permissions: PropTypes.shape({
      upload: PropTypes.bool,
      downloadFiles: PropTypes.bool,
      deleteCollections: PropTypes.bool,
      editCollections: PropTypes.bool,
      websites: PropTypes.bool,
      moveCollections: PropTypes.bool,
    }),
    path: PropTypes.string,
    website: PropTypes.shape({
      [PropTypes.string]: PropTypes.string,
    }),
    favorites: PropTypes.bool,
  }).isRequired,
  handleUpload: PropTypes.func.isRequired,
  handleDownload: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleRename: PropTypes.func.isRequired,
  handleWebsite: PropTypes.func.isRequired,
  handleFavorite: PropTypes.func.isRequired,
  handleMove: PropTypes.func.isRequired,
  onChangeUpload: PropTypes.func.isRequired,
  websitesAllowed: PropTypes.bool.isRequired,
  canUploadCsv: PropTypes.bool,
};

export default memo(CollectionMenu);
