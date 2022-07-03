import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';

import cn from 'classnames';
import {
  Archive,
  Collections,
  Plugin,
  SavedSearch,
  DownloadList,
  Label as Keyword,
  Lamp,
  Inbox,
  Upload,
} from '@picsio/icons';
import { IconButton } from '@picsio/ui';
import ua from '../../ua';
import localization from '../../shared/strings';
import Tooltip from '../Tooltip';
import Group from './Group';
import HelpButton from './HelpButton';
import Button from './Button';
import AdBlockButton from './AdBlockButton';
import LiveSupportButton from './LiveSupportButton';

const isMobile = ua.browser.isNotDesktop();

const ToolbarCatalogLeft = (props) => {
  const {
    chatSupport,
    downloadListItemsLength,
    downloadListOpened,
    handleAddonsClick,
    handleChangeTree,
    handleDownloadList,
    handleImportList,
    handleLiveSupport,
    handleToggleAdBlockWarning,
    importOpened,
    isAllowedArchive,
    isAllowedLightboards,
    manageInboxes,
    openedTree,
    permissions,
    uploadListCount,
  } = props;

  const onDragOver = (event, buttonName) => {
    event.preventDefault(); // neccessary
    event.stopPropagation(); // neccessary
    if (openedTree !== buttonName) {
      handleChangeTree(buttonName);
    }
  };

  const onDragLeave = (event) => {
    if (event.target.classList.contains('lightboard')) {
      event.target.style.border = null;
    }
  };

  /** Generate additional class for Tree button
   * @param {string} treeName
   * @returns {(string|null)}
   */
  const generateClassName = useCallback((treeName) => {
    if (importOpened) {
      return 'disabled';
    } if (openedTree === treeName && !downloadListOpened) {
      return 'active';
    }
    return null;
  }, [openedTree, downloadListOpened, importOpened]);

  return (
    <div className="toolbar toolbarVertical toolbarCatalogLeft">
      <Group>
        <Tooltip content={localization.TOOLBARS.titleCollections}>
          <IconButton
            id="button-collections"
            className={cn('toolbarButton', {
              [generateClassName('collections')]: generateClassName('collections'),
            })}
            onClick={() => handleChangeTree('collections')}
            componentProps={{
              onDragOver: (event) => onDragOver(event, 'collections'),
            }}
            size="lg"
          >
            <Collections />
          </IconButton>
        </Tooltip>
        <Tooltip content={localization.TOOLBARS.titleKeywords}>
          <IconButton
            id="button-keyword"
            className={cn('toolbarButton', {
              [generateClassName('keywords')]: generateClassName('keywords'),
            })}
            onClick={() => handleChangeTree('keywords')}
            size="lg"
            componentProps={{
              onDragOver: (event) => onDragOver(event, 'keywords'),
              onDragLeave,
            }}
          >
            <Keyword />
          </IconButton>
        </Tooltip>
        <Tooltip content={localization.TOOLBARS.titleSearches}>
          <IconButton
            id="button-search"
            className={cn('toolbarButton', {
              [generateClassName('savedSearches')]: generateClassName('savedSearches'),
            })}
            onClick={() => handleChangeTree('savedSearches')}
            size="xl"
          >
            <SavedSearch />
          </IconButton>
        </Tooltip>
        <If condition={isAllowedLightboards}>
          <Tooltip content={localization.TOOLBARS.titleLightboards}>
            <IconButton
              id="button-lightboards"
              className={cn('toolbarButton', {
                [generateClassName('lightboards')]: generateClassName('lightboards'),
              })}
              onClick={() => handleChangeTree('lightboards')}
              size="xl"
              componentProps={{
                onDragOver: (event) => onDragOver(event, 'lightboards'),
                onDragLeave,
              }}
            >
              <Lamp />
            </IconButton>
          </Tooltip>
        </If>
        <If condition={manageInboxes === true}>
          <Tooltip content={localization.TOOLBARS.titleInbox}>
            <IconButton
              id="button-inboxes"
              className={cn('toolbarButton', {
                [generateClassName('inbox')]: generateClassName('inbox'),
              })}
              onClick={() => handleChangeTree('inbox')}
              size="lg"
            >
              <Inbox />
            </IconButton>
          </Tooltip>
        </If>
        <If condition={isAllowedArchive}>
          <Tooltip content={localization.TOOLBARS.titleArchive}>
            <IconButton
              id="button-archive"
              className={cn('toolbarButton', {
                [generateClassName('archive')]: generateClassName('archive'),
              })}
              onClick={() => handleChangeTree('archive')}
              size="lg"
            >
              <Archive />
            </IconButton>
          </Tooltip>
        </If>
        <If condition={permissions.upload === true && uploadListCount}>
          <Tooltip content={localization.TOOLBARS.titleUpload}>
            <IconButton
              id="button-upload"
              className={cn('toolbarButton', {
                active: importOpened && !downloadListOpened,
              })}
              onClick={handleImportList}
              size="lg"
            >
              <Upload />
            </IconButton>
          </Tooltip>
        </If>
        {(downloadListItemsLength > 0 || downloadListOpened) && (
          <Button
            id="button-downloadList"
            icon={() => <DownloadList />}
            iconSize="xl"
            tooltip={localization.TOOLBARS.titleDownloadDialog}
            onClick={handleDownloadList}
            additionalClass={
              importOpened ? 'disabled' : downloadListOpened ? 'active' : null
            }
            counter={downloadListItemsLength}
          />
        )}
      </Group>
      <Group>
        <Tooltip content={localization.TOOLBARS.textIntegrations}>
          <IconButton
            className="toolbarButton"
            onClick={handleAddonsClick}
            size="xl"
          >
            <Plugin />
          </IconButton>
        </Tooltip>
        <If condition={!isMobile && !ua.isMobileApp()}>
          <AdBlockButton toggleAdBlockWarning={handleToggleAdBlockWarning} />
        </If>
        <HelpButton id="button-helpCatalogView" tooltipPosition="left" component="catalogView" />
        <LiveSupportButton handleLiveSupport={handleLiveSupport} chatSupport={chatSupport} />
      </Group>
    </div>
  );
};

ToolbarCatalogLeft.defaultProps = {
  permissions: {},
  openedTree: null,
};

ToolbarCatalogLeft.propTypes = {
  chatSupport: PropTypes.bool.isRequired,
  downloadListItemsLength: PropTypes.number.isRequired,
  downloadListOpened: PropTypes.bool.isRequired,
  handleAddonsClick: PropTypes.func.isRequired,
  handleChangeTree: PropTypes.func.isRequired,
  handleDownloadList: PropTypes.func.isRequired,
  handleImportList: PropTypes.func.isRequired,
  handleLiveSupport: PropTypes.func.isRequired,
  handleToggleAdBlockWarning: PropTypes.func.isRequired,
  importOpened: PropTypes.bool.isRequired,
  isAllowedArchive: PropTypes.bool.isRequired,
  isAllowedLightboards: PropTypes.bool.isRequired,
  manageInboxes: PropTypes.bool.isRequired,
  openedTree: PropTypes.string,
  permissions: PropTypes.object,
  uploadListCount: PropTypes.number.isRequired,
};

export default memo(ToolbarCatalogLeft);
