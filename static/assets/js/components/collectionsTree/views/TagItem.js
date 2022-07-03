import React from 'react';
import ReactDOM from 'react-dom';
import {
  number, object, objectOf, func, string, array,
} from 'prop-types';
import cn from 'classnames';
import memoize from 'memoize-one';
import styled from 'styled-components';

import { CSSTransition } from 'react-transition-group';
import {
  Popper, Hidden, IconButton, Icon as UiIcon,
} from '@picsio/ui';
import {
  CopyToClipboard,
  DotsVertical,
  AddCircleFilledBold,
  Archive,
  StarBorder,
  Download,
  Delete,
  Move,
  Edit,
  Upload,
  Web,
  Folder,
  CsvImport,
  Sync,
} from '@picsio/ui/dist/icons';
import outy from 'outy';

import ua from '../../../ua';
import showDropAssetsOnlyDialog from '../../../helpers/showDropAssetsOnlyDialog';
import * as utils from '../../../shared/utils';
import localization from '../../../shared/strings';
import copyTextToClipboard from '../../../helpers/copyTextToClipboard';
import picsioConfig from '../../../../../../config';
import Logger from '../../../services/Logger';
import DialogRadios from '../../dialogRadios';
import Icon from '../../Icon';
import { Textarea } from '../../../UIComponents';
import { checkUserAccess } from '../../../store/helpers/user';
import WithSkeletonTheme from '../../WithSkeletonTheme';

import Swipeable from '../../Swipeable';
import SkeletonItem from './SkeletonItem';
import { navigate } from '../../../helpers/history';
import TreeButton from '../../TreeButton';
import TreeMenuItem from '../../TreeMenuItem';
import Tooltip from '../../Tooltip';
import { showDialog } from '../../dialog';
import sendEventToIntercom from '../../../services/IntercomEventService';

const holdTime = 500; // ms
const holdDistance = 3 ** 2; // pixels squared

let timeoutId = null;
let popperWrapper = null;
const getPopperWrapper = () => {
  if (!popperWrapper) {
    popperWrapper = document.querySelector('.popperWrapper');
  }
  return popperWrapper;
};
export default class Item extends React.Component {
  isMobile = ua.browser.isNotDesktop();

  btnCLicked = false;

  $item = React.createRef();

  $dropItem = React.createRef();

  $target = React.createRef();

  state = {
    isOpen:
      this.props.node.isOpen
      || (this.props.openedCollections
      && this.props.openedCollections.includes(this.props.node._id)),
    isRenaming: false,
    isAdding: false,
    newName: null,
    isValid: true,
    isMenuOpen: false,
    // 👇 this HACK for mobile view.
    //  We don't unmount treeMenu, until user selecting file [type='file']
    isNotUploading: true,
    clickPosition: [0, 0],
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { props } = this;
    if (
      /** if add first child */
      (nextProps.node.nodes && !props.node.nodes)
      /** OR if add another child */
      || (nextProps.node.nodes
        && props.node.nodes
        && nextProps.node.nodes.length
        && props.node.nodes.length !== nextProps.node.nodes.length)
    ) {
      this.setState({ newName: null });
    }
    if (nextProps.openedCollections !== props.openedCollections) {
      this.setState({
        isOpen: nextProps.openedCollections && nextProps.openedCollections.includes(props.node._id),
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { props, state } = this;
    const isPropsChaged = nextProps !== props;
    const isStateChaged = nextState !== state;
    const isChangedOnlyActiveCollectionId = Object.keys(nextProps)
      .filter((key) => key !== 'activeCollectionID')
      .every((key) => props[key] === nextProps[key]);

    /** if changed only 'activeCollectionID' prop */
    if (!isStateChaged && isPropsChaged && isChangedOnlyActiveCollectionId) {
      const equalsBefore = props.activeCollectionID === props.node._id;
      const equalsAfter = nextProps.activeCollectionID === nextProps.node._id;

      /** update component only if changed *active collection id* AND this affects render */
      if (state.isOpen || (equalsBefore && !equalsAfter) || (!equalsBefore && equalsAfter)) {
        return true;
      }
      return false;
    }
    return true;
  }

  componentWillUnmount() {
    if (this.outsideTap) this.outsideTap.remove();
  }

  refTextareaRename = (textarea) => {
    this.textareaRename = textarea;
  };

  refTextareaAdd = (textarea) => {
    this.textareaAdd = textarea;
    if (textarea) textarea.select();
  };

  generateTitleAndBtns = (
    node,
    handlers,
    subscriptionFeatures,
    wrapperForPopper,
    isMenuOpen,
    isNotUploading,
    isValid,
    isRenaming,
    newName,
  ) => {
    const { permissions = {} } = node;
    const { websites: websitesAllowed } = subscriptionFeatures;
    const isRoot = node._id === this.props.rootCollectionId;

    let title = null;
    let buttons = null;

    if (['favorites', 'websites'].includes(node.path)) {
      title = <span className="collectionTextValue">{utils.decodeSlash(node.name)}</span>;
      return { title, buttons };
    }

    if (!isRenaming) {
      const btns = [];
      let btnDownload = null;
      let btnCopyLink = null;
      let btnWebsite = null;
      let btnCsvImport = null;
      /** Create */
      if (picsioConfig.isMainApp() && handlers.add && permissions.createCollections) {
        let text = localization.TAGSTREE.textCreateCollection;
        let eventName = 'CollectionsPanelAddCollection';
        if (!isRoot) {
          text = localization.TAGSTREE.textCreateNestedCollection;
          eventName = 'CollectionsPanelAddSubCollection';
        }

        btns.push(
          {
            icon: () => <AddCircleFilledBold />,
            dataTestId: 'collectionCreate',
            additionalClassName: cn('treeMenuItemDownload', { disabled: newName }),
            tooltip: text,
            menuName: text,
            onClick: (event) => {
              this.setAdding(event);
              Logger.log('User', eventName);
            },
          },
        );
      }
      /** Upload csv */
      if (picsioConfig.isMainApp()
        && isRoot
        && this.props.rolePermissions.importCSV
        && this.props.team.featureFlags.importCSV
        && this.props.subscriptionFeatures.csvImport) {
        btnCsvImport = {
          icon: () => <CsvImport />,
          dataTestId: 'collectionItemUploadCsv',
          tooltip: localization.CSV_IMPORT.textUploadCsv,
          onClick: (event) => {
            event.stopPropagation();
            Logger.log('User', 'CollectionItemsUploadCsv');
            navigate('/csvUpload');
          },
        };
      }

      /** Upload */
      if (picsioConfig.isMainApp() && handlers.inputUpload && permissions.upload) {
        btns.push(
          {
            icon: () => <Upload />,
            dataTestId: 'collectionUpload',
            additionalClassName: 'treeMenuItemUpload',
            tooltip: localization.TAGSTREE.textUploadFiles,
            menuName: localization.TAGSTREE.textUploadFiles,
            onClick: this.handleClickUpload,
            onChange: this.handleInputFile,
            upload: true,
          },
        );
      }

      /** Download collection */
      if (picsioConfig.isMainApp() && node.path !== 'root' && permissions.downloadFiles) {
        btnDownload = {
          icon: () => <Download />,
          dataTestId: 'collectionDownload',
          additionalClassName: 'treeMenuItemDownload',
          tooltip: localization.TAGSTREE.textDownloadCollection,
          menuName: localization.TAGSTREE.textDownloadCollection,
          onClick: this.handleDownloadCollection,
        };
        if (ua.browser.isNotDesktop()) {
          btns.push(btnDownload);
        }
      }

      /** Remove */
      if (
        picsioConfig.isMainApp()
        && handlers.remove
        && permissions.deleteCollections
        && node.path !== 'root'
      ) {
        btns.push(
          {
            icon: () => <Delete />,
            dataTestId: 'collectionDelete',
            additionalClassName: 'treeMenuItemRemove',
            tooltip: localization.TAGSTREE.textDeleteCollection,
            menuName: localization.TAGSTREE.textDeleteCollection,
            onClick: (event) => {
              this.handleRemove(event);
              Logger.log('User', 'CollectionsPanelDeleteCollection', {
                collectionId: node._id,
              });
            },
          },
        );
      }

      /** Rename */
      if (
        picsioConfig.isMainApp()
        && handlers.rename
        && permissions.editCollections
        && node.path !== 'root'
      ) {
        btns.push(
          {
            icon: () => <Edit />,
            dataTestId: 'collectionRename',
            additionalClassName: 'treeMenuItemRename',
            tooltip: localization.TAGSTREE.textRenameCollection,
            menuName: localization.TAGSTREE.textRenameCollection,
            onClick: (event) => {
              this.setRenaming(event);
              Logger.log('User', 'CollectionsPanelRenameCollection', {
                collectionId: node._id,
              });
            },
          },
        );
      }

      /** Copy to clipboard */
      if (picsioConfig.isMainApp() && node.website) {
        btnCopyLink = {
          icon: () => <UiIcon size="sm" color="inherit"><CopyToClipboard /></UiIcon>,
          dataTestId: 'collectionCopyUrl',
          additionalClassName: 'treeMenuItemRemoveCopy',
          tooltip: localization.TAGSTREE.textCopyWebsiteLink,
          menuName: localization.TAGSTREE.textCopyWebsiteLink,
          dataClipboardText: 'websiteurl',
          onClick: this.copyToClipboard,
        };
        if (ua.browser.isNotDesktop()) {
          btns.push(btnCopyLink);
        }
      }

      /** Website */
      if (
        picsioConfig.isMainApp()
        && handlers.public
        && permissions.websites
        && node.path !== 'root'
      ) {
        const text = !websitesAllowed
          ? `${localization.TAGSTREE.textCreateWebsite}. ${localization.UPGRADE_PLAN.tooltip}`
          : node.website
            ? localization.TAGSTREE.textUpdateWebsite
            : localization.TAGSTREE.textCreateWebsite;
        btnWebsite = {
          icon: () => <Web />,
          dataTestId: 'collectionShare',
          additionalClassName: cn('treeMenuItemFavorites', {
            readOnly: !websitesAllowed,
            disabled: newName,
            shared: node.website,
          }),
          tooltip: text,
          menuName: text,
          onClick: (event) => {
            sendEventToIntercom('website settings');
            if (!websitesAllowed) {
              event.stopPropagation();
              navigate('/billing?tab=overview');
              return;
            }
            this.handlePublic(event);
            Logger.log('User', 'CollectionsPanelPublishToWeb', {
              collectionId: node._id,
            });
          },
        };
        if (ua.browser.isNotDesktop()) {
          btns.push(btnWebsite);
        }
      }

      /** Favorites */
      if (picsioConfig.isMainApp() && handlers.favorite && node.path !== 'root') {
        btns.push(
          node.favorites
            ? {
              icon: () => <StarBorder />,
              dataTestId: 'collectionRemoveFromFavorite',
              additionalClassName: 'treeMenuItemFavorites yellow',
              tooltip: localization.TAGSTREE.textRemoveFromFavorites,
              menuName: localization.TAGSTREE.textRemoveFromFavorites,
              onClick: this.handleAddToFavorites,
            }
            : {
              icon: () => <StarBorder />,
              dataTestId: 'collectionAddToFavorite',
              additionalClassName: 'treeMenuItemFavorites',
              tooltip: localization.TAGSTREE.textAdToFavorites,
              menuName: localization.TAGSTREE.textAdToFavorites,
              onClick: this.handleAddToFavorites,
            },
        );
      }

      /** Move */
      if (
        picsioConfig.isMainApp()
        && handlers.favorite
        && permissions.moveCollections
        && node.path !== 'root'
      ) {
        btns.push(
          {
            icon: () => <Move />,
            dataTestId: 'collectionMove',
            additionalClassName: 'treeMenuItemMove',
            tooltip: localization.TAGSTREE.textMoveCollection,
            menuName: localization.TAGSTREE.textMoveCollection,
            onClick: this.handleOpenMoveDialog,
          },
        );
      }

      // Archive
      if (
        picsioConfig.isMainApp()
        && node.path !== 'root'
        && checkUserAccess('subscriptions', 'archive')
        && checkUserAccess('permissions', 'manageArchive')
      ) {
        btns.push(
          {
            icon: () => <Archive />,
            dataTestId: 'collectionArchive',
            additionalClassName: 'treeMenuItemMove',
            tooltip: localization.TAGSTREE.textMoveToArchive,
            menuName: localization.TAGSTREE.textMoveToArchive,
            onClick: this.handleArchiveCollection,
          },
        );
      }

      // Folder Sync
      if (
        picsioConfig.isMainApp()
        && node.path !== 'root'
        && this.props.team.featureFlags.folderSync
        && checkUserAccess('permissions', 'sync')
        && (this.props.team.storageType === 'gd' || !this.props.team.picsioStorage)
      ) {
        btns.push(
          {
            icon: () => <Sync />,
            dataTestId: 'collectionFolderSync',
            additionalClassName: 'treeMenuItemMove',
            tooltip: localization.TAGSTREE.textSyncFolder,
            menuName: localization.TAGSTREE.textSyncFolder,
            onClick: this.handleFolderSync,
          },
        );
      }

      let firstBtn;
      let secondBtn;
      let lastBtns;
      // let [firstBtn, secondBtn, ...lastBtns] = btns;
      if (ua.browser.isNotDesktop()) {
        [...lastBtns] = btns;
        btnDownload = null;
        btnCopyLink = null;
      } else if (btnCopyLink) {
        if (btnDownload) {
          btns.splice(2, 0, btnDownload);
          btnDownload = null;
        }
        [firstBtn, secondBtn, ...lastBtns] = btns;
      } else {
        [firstBtn, secondBtn, ...lastBtns] = btns;
      }
      title = utils.decodeSlash(node.name);
      title = utils.trimWithAsciiDots(title);
      title = (
        <span className="collectionTextValue" onDoubleClick={this.onDoubleClickName}>
          {title}
        </span>
      );

      const moreBtns = (
        <>
          <Hidden implementation="js" desktopUp>
            <div className="moreBtns" ref={this.$target}>
              <IconButton
                buttonSize="default"
                className={cn('btnCollection btnCollectionOpener', { act: isMenuOpen })}
                color="default"
                component="button"
                onClick={this.handleTargetClick}
                size="lg"
                componentProps={{
                  'data-testid': 'menuOpener',
                }}
              >
                <DotsVertical />
              </IconButton>
              <CSSTransition
                unmountOnExit={isNotUploading}
                in={isMenuOpen}
                timeout={1000}
                classNames="bottomPanelSlide"
              >
                <>
                  {ReactDOM.createPortal(
                    <Swipeable className="SwipeableDialog" onSwipedDown={this.handleSwipeDown}>
                      <div className="treeMenu" role="navigation" aria-label="Collection settings">
                        <header
                          className="treeMenuHeader"
                          onClick={this.handleTargetClick}
                          role="presentation"
                        >
                          <div className="treeMenuName">Operations</div>
                          <span className="treeMenuClose">
                            <Icon name="close" />
                          </span>
                        </header>
                        {lastBtns.map((btn) => (
                          <TreeMenuItem
                            key={btn.icon}
                            dataTestId={btn.dataTestId}
                            icon={btn.icon}
                            // iconComponent={btn.iconComponent}
                            className={btn.className}
                            additionalClassName={btn.additionalClassName}
                            tooltip={btn.tooltip}
                            menuName={btn.menuName}
                            onClick={btn.onClick}
                            upload={btn.upload}
                            onChange={btn.onChange}
                          />
                        ))}
                      </div>
                    </Swipeable>,
                    wrapperForPopper,
                  )}
                </>
              </CSSTransition>
            </div>
          </Hidden>
          <Hidden implementation="js" desktopDown>
            <div className="moreBtns" ref={this.$target}>
              <IconButton
                buttonSize="default"
                className={cn('btnCollection btnCollectionOpener', { act: isMenuOpen })}
                color="default"
                component="button"
                onClick={this.handleTargetClick}
                size="lg"
                componentProps={{
                  'data-testid': 'menuOpener',
                }}
              >
                <DotsVertical />
              </IconButton>
              <Popper
                target={this.$target}
                isOpen={isMenuOpen}
                onClose={() => this.setState((prevState) => ({
                  isMenuOpen: !prevState.isMenuOpen,
                }))}
                placement="right-start"
                disablePortal={false}
                offset={[0, 10]}
                hide={false}
                arrow
                autoWidth
                outsideClickListener
                portalContainer={wrapperForPopper}
              >
                <div className="treeMenu" role="navigation" aria-label="Collection settings">
                  <header
                    className="treeMenuHeader"
                    onClick={this.handleTargetClick}
                    role="presentation"
                    aria-label="button"
                  >
                    <div className="treeMenuName">Operations</div>
                    <span className="treeMenuClose">
                      <Icon name="close" />
                    </span>
                  </header>
                  {/* {lastBtns} */}
                  {lastBtns.map((btn) => (
                    <TreeMenuItem
                      key={btn.icon}
                      dataTestId={btn.dataTestId}
                      icon={btn.icon}
                      className={btn.className}
                      additionalClassName={btn.additionalClassName}
                      tooltip={btn.tooltip}
                      menuName={btn.menuName}
                      onClick={btn.onClick}
                    />
                  ))}
                </div>
              </Popper>
            </div>
          </Hidden>
        </>
      );

      buttons = (
        <div className="btnsManageCollection leftShadow">
          {lastBtns && !!lastBtns.length && moreBtns}
          {/* {!ua.browser.isNotDesktop() && btnWebsite} */}
          {!ua.browser.isNotDesktop() && btnWebsite && (
            <TreeButton
              key={btnWebsite.icon}
              dataTestId={btnWebsite.dataTestId}
              icon={btnWebsite.icon}
              className={btnWebsite.className}
              additionalClassName={btnWebsite.additionalClassName}
              tooltip={btnWebsite.tooltip}
              onClick={btnWebsite.onClick}
            />
          )}
          {/* {firstBtn} */}
          <If condition={firstBtn}>
            <TreeButton
              key={firstBtn.icon}
              dataTestId={firstBtn.dataTestId}
              icon={firstBtn.icon}
              className={firstBtn.className}
              additionalClassName={firstBtn.additionalClassName}
              tooltip={firstBtn.tooltip}
              onClick={firstBtn.onClick}
            >
              <If condition={firstBtn.upload}>
                <input
                  type="file"
                  multiple
                  className="btnCollectionUpload"
                  onChange={this.handleInputFile}
                  onClick={this.handleClickFileInput}
                />
              </If>
            </TreeButton>
          </If>
          {/* {secondBtn} */}
          <If condition={secondBtn}>
            <TreeButton
              key={secondBtn.icon}
              dataTestId={secondBtn.dataTestId}
              icon={secondBtn.icon}
              className={secondBtn.className}
              additionalClassName={secondBtn.additionalClassName}
              tooltip={secondBtn.tooltip}
              onClick={secondBtn.onClick}
            >
              <If condition={secondBtn.upload}>
                <input
                  type="file"
                  multiple
                  className="btnCollectionUpload"
                  onChange={this.handleInputFile}
                  onClick={this.handleClickFileInput}
                />
              </If>
            </TreeButton>
          </If>
          <If condition={btnCsvImport}>
            <TreeButton
              key={btnCsvImport.icon}
              dataTestId={btnCsvImport.dataTestId}
              icon={btnCsvImport.icon}
              tooltip={btnCsvImport.tooltip}
              onClick={btnCsvImport.onClick}
            />
          </If>
          {/* {btnDownload} */}
          <If condition={btnDownload}>
            <TreeButton
              key={btnDownload.icon}
              dataTestId={btnDownload.dataTestId}
              icon={btnDownload.icon}
              className={btnDownload.className}
              additionalClassName={btnDownload.additionalClassName}
              tooltip={btnDownload.tooltip}
              onClick={btnDownload.onClick}
            >
              <If condition={btnDownload.upload}>
                <input
                  type="file"
                  multiple
                  className="btnCollectionUpload"
                  onChange={this.handleInputFile}
                  onClick={this.handleClickFileInput}
                />
              </If>
            </TreeButton>
          </If>

          <If condition={btnCopyLink}>
            <TreeButton
              key={btnCopyLink.icon}
              dataTestId={btnCopyLink.dataTestId}
              icon={btnCopyLink.icon}
              className={btnCopyLink.className}
              additionalClassName={btnCopyLink.additionalClassName}
              tooltip={btnCopyLink.tooltip}
              onClick={btnCopyLink.onClick}
            />
          </If>
        </div>
      );
      return { title, buttons };
    }

    title = (
      <Textarea
        isDefault
        className={cn('collectionTextValue', { error: !isValid })}
        defaultValue={utils.decodeSlash(node.name)}
        onClick={this.stopPropagation}
        onKeyDown={this.onKeyDownTextarea}
        onBlur={this.onBlurRename}
        onChange={this.onChangeTextarea}
        customRef={this.refTextareaRename}
      />
    );
    buttons = (
      <div className="btnsEditCollection leftShadow">
        <TreeButton
          key="ok"
          icon="ok"
          dataTestId="ok"
          additionalClassName={cn('btnOkFolder', { disabled: !isValid })}
          tooltip={localization.TAGSTREE.textSave}
          onClick={this.doRename}
        />
        <TreeButton
          key="cancel"
          icon="close"
          dataTestId="cancel"
          additionalClassName="btnCancelFolder"
          tooltip={localization.TAGSTREE.textCancel}
          onClick={this.cancelRenaming}
        />
      </div>
    );
    return { title, buttons };
  };

  memoizedGenerateTitleAndBtns = memoize(this.generateTitleAndBtns);

  handleInputFile = (event) => {
    const { files } = event.target;
    if (files && files.length > 0) {
      this.props.handlers.inputUpload(files);
    }
    this.setState({ isNotUploading: true }, () => window.removeEventListener('focus', this.handleWindowFocusBack));
    event.target.value = '';
  };

  handleWindowFocusBack = () => {
    setTimeout(() => this.setState({ isNotUploading: true }), 1000);
    window.removeEventListener('focus', this.handleWindowFocusBack);
  };

  handleClickFileInput = () => {
    window.addEventListener('focus', this.handleWindowFocusBack);
  };

  handleAddToFavorites = (event) => {
    const { node } = this.props;
    event.stopPropagation();

    this.props.handlers.favorite(node._id, node.name, node.path, !node.favorites);
  };

  handleRemove = (event) => {
    event.stopPropagation();
    this.props.handlers.remove(this.props.node);
  };

  handlePublic = (event) => {
    event.stopPropagation();
    // fix DoubleClick
    if (this.isBtnWebsiteWasClicked) return;
    this.isBtnWebsiteWasClicked = true;
    setTimeout(() => {
      this.isBtnWebsiteWasClicked = false;
      /** wait for change route to this collection - then go to website page */
      this.props.handlers.public(this.props.node._id);
    }, 300);
  };

  handleOpenMoveDialog = (event) => {
    const { node } = this.props;
    event.stopPropagation();
    this.props.handlers.move(node._id, node.name, node.path);
  };

  handleArchiveCollection = (event) => {
    event.stopPropagation();
    const { node } = this.props;
    Logger.log('User', 'CollectionMoveToArchiveClicked', { collectionId: node._id });

    this.props.handlers.archive(node);
  };

  handleFolderSync = (event) => {
    event.stopPropagation();
    const { node } = this.props;
    this.props.handlers.syncFolder(node._id);
  };

  handleDownloadCollection = (event) => {
    const { node } = this.props;
    event.stopPropagation();
    this.props.handlers.download(node._id);
  };

  setOutsideTap = () => {
    const elements = [this.$target.current];

    if (this.outsideTap) {
      this.outsideTap.remove();
    }

    this.outsideTap = outy(elements, ['click'], this.handleOutsideTap);
  };

  handleOutsideTap = () => {
    const popperWrapper = getPopperWrapper();
    this.setState({ isMenuOpen: false });
    popperWrapper.classList.remove('active');
    this.outsideTap && this.outsideTap.remove();
  };

  handleTargetClick = (event) => {
    const popperWrapper = getPopperWrapper();
    event.stopPropagation();
    if (picsioConfig.isMainApp()) this.setOutsideTap();
    this.setState((prevState) => ({
      isMenuOpen: !prevState.isMenuOpen,
    }));
    popperWrapper.classList.toggle('active');
  };

  handleSwipeDown = (eventData) => {
    const { dir, velocity } = eventData;
    if (dir === 'Down' && velocity > 0.7) {
      this.handleOutsideTap();
    }
  };

  makeNewCollectionName = () => {
    const { node } = this.props;
    let name = 'New collection';

    // we can use while(true) or smth like that but 10000
    // prevent infinite cycle and other stuff which can break down browser:)
    // first folder name without number, second has "2", third "3" etc
    if (node.nodes && node.nodes.length > 0) {
      for (let i = 1; i < 10000; i++) {
        const testName = i !== 1 ? `${name} ${i}` : name;
        if (
          node.nodes.every((item) => utils.decodeSlash(item.name) !== utils.decodeSlash(testName))
        ) {
          name = testName;
          break;
        }
      }
    }

    /* if new name = in progress */
    if (name === this.state.newName) {
      const nameArr = name.split(' ');
      const lastNumber = Number(nameArr[nameArr.length - 1]);
      if (isNaN(lastNumber)) {
        name += ' 1';
      } else {
        nameArr[nameArr.length - 1] += 1;
        name = nameArr.join(' ');
      }
    }

    return name;
  };

  /**
   * Copy website url to clipboard
   * @param {MouseEvent} event
   */
  copyToClipboard = (event) => {
    Logger.log('User', 'WebsiteDotsMenuCopyLink');
    event.stopPropagation();
    const { node } = this.props;
    const websiteURL = node.website?.alias || '';
    const toastText = localization.DETAILS.websiteUrlCopied;
    copyTextToClipboard(websiteURL, toastText);
  };

  onDoubleClickName = (event) => {
    if (this.props.node.deletedByTeammate) return;
    const { permissions } = this.props.node;

    if (
      picsioConfig.isMainApp()
      && this.props.node.path !== 'root'
      && this.props.node.path !== 'favorites'
      && this.props.node.path !== 'websites'
      && permissions
      && permissions.createCollections
      && event.target.classList.contains('collectionTextValue')
    ) {
      this.setRenaming(event);
    }
  };

  /**
   * @param {MouseEvent} event
   */
  onClickArrow = (event) => {
    event.stopPropagation();

    const { node } = this.props;

    if (!['favorites', 'websites', 'root'].includes(node.path)) {
      this.props.toggle(node._id);
    }

    function setCookie() {
      if (['favorites', 'websites', 'root'].includes(node.path)) {
        const cookieTreeName = node.path === 'root' ? 'my' : node.path;
        utils.LocalStorage.set(`picsio.tagsTree.${cookieTreeName}.open`, this.state.isOpen);
      }
    }
    this.setState((state) => ({ isOpen: !state.isOpen }), setCookie);

    if (!node.nodes) {
      this.props.handlers.arrow(this.props.node._id);
    }
  };

  setAdding = (event) => {
    event.stopPropagation();
    this.setState(
      { isAdding: true, isValid: true, isOpen: true },
      () => this.textareaAdd && this.textareaAdd.select(),
    );
    if (!this.props.node.nodes) {
      this.props.handlers.arrow(this.props.node._id);
    }
  };

  setRenaming = (event) => {
    if (this.isMobile) {
      event.stopPropagation();
    }
    const nodeID = this.props.node._id;
    this.currentLevel = this.getCurrentLevel(nodeID);
    this.setState(
      { isRenaming: true, isMenuOpen: false },
      () => this.textareaRename && this.textareaRename.select(),
    );
  };

  doRename = (event) => {
    if (this.isMobile) {
      event.stopPropagation();
    }
    this.btnCLicked = true;
    if (this.state.isValid && this.textareaRename) {
      this.rename(this.textareaRename.value, event);
    } else if (this.textareaRename) {
      this.textareaRename.select();
    } else {
      this.cancelRenaming(event);
    }
  };

  doAdd = () => {
    Logger.log('User', 'CollectionsPanelAddCollectionOK');
    this.btnCLicked = true;
    if (this.state.isValid && this.textareaAdd) {
      if (this.textareaAdd.value.length >= 499) {
        showDialog({
          title: localization.DIALOGS.WARNING_COLLECTION_NAME_LENGTH.TITLE,
          text: localization.DIALOGS.WARNING_COLLECTION_NAME_LENGTH.TEXT,
          textBtnOk: localization.DIALOGS.WARNING_COLLECTION_NAME_LENGTH.OK_TEXT,
          textBtnCancel: null,
        });
      } else {
        this.add(this.textareaAdd.value);
      }
    } else if (this.textareaAdd) {
      this.textareaAdd.select();
    } else {
      this.cancelAdd();
    }
  };

  /**
   * @param {string} _value
   */
  rename = (_value, event) => {
    // const value = _value.replace(/\s\s+/g, ' ').trim(); // fix multiple spaces
    const value = _value.trim();
    if (value === this.props.node.name) return this.cancelRenaming(event);

    this.props.handlers.rename(this.props.node, value);
    this.cancelRenaming(event);
  };

  /**
   * @param {string} _value
   */
  add = (_value) => {
    const value = _value.trim();
    this.props.handlers.add(
      `${this.props.node.path + this.props.node.name}/`,
      value,
      this.props.node._id,
      this.resetNewName,
    );
    this.setState({ newName: _value, isAdding: false, isValid: true });
  };

  resetNewName = () => {
    this.setState({ newName: null });
  };

  stopPropagation = (event) => event.stopPropagation();

  /**
   * Handle keydown on textarea
   * @param {KeyboardEvent} event
   */
  onKeyDownTextarea = (event) => {
    const { isAdding, isRenaming } = this.state;
    const ENTER = 13;
    const ESC = 27;
    switch (event.keyCode) {
    case ENTER: {
      event.stopPropagation();
      if (isRenaming) this.doRename(event);
      if (isAdding) this.doAdd();
      break;
    }
    case ESC: {
      event.stopPropagation();
      if (isRenaming) this.cancelRenaming(event);
      if (isAdding) this.cancelAdd();
      break;
    }
    default:
      return true;
    }
  };

  onBlurRename = (event, value) => {
    this.btnCLicked = false;

    setTimeout(() => {
      if (!this.btnCLicked && this.state.isRenaming) {
        if (this.state.isValid) {
          this.rename(value, event);
        } else {
          this.cancelRenaming(event);
        }
      }
    }, 200);
  };

  onBlurAdd = (event, value) => {
    this.btnCLicked = false;

    setTimeout(() => {
      if (!this.btnCLicked && this.state.isAdding) {
        if (this.state.isValid) {
          this.add(value);
          Logger.log('User', 'CollectionsPanelAddCollectionOK');
        } else {
          this.cancelAdd();
        }
      }
    }, 200);
  };

  onChangeTextarea = (event, value) => this.validate(value);

  getCurrentLevel = (nodeID) => {
    const lvl = [...this.props.handlers.getCurrentLevelCollections(nodeID)];
    const filteredLvl = lvl.filter((node) => node._id !== nodeID);
    return filteredLvl;
  };

  validate = (_value) => {
    // const value = _value.replace(/\s\s+/g, ' ').trim(); // fix multiple spaces
    const value = _value.trim();
    const nodeID = this.props.node._id;
    let nodes = [];
    if (this.state.isRenaming) {
      nodes = this.currentLevel || this.getCurrentLevel(nodeID);
    }
    if (this.state.isAdding) {
      nodes = this.props.node.nodes || [];
    }
    let isValid = true;

    if (
      value === ''
      || value.startsWith('.') // check if the first symbol is .(dot)
      || nodes.some((item) => utils.decodeSlash(item.name) === utils.decodeSlash(value))
    ) {
      isValid = false;
    }

    this.setState({ isValid, textareaValue: value });
  };

  cancelRenaming = (event) => {
    this.btnCLicked = true;
    this.setState({ isValid: true, isRenaming: false });
    if (this.isMobile) {
      event.stopPropagation();
    }
  };

  cancelAdd = () => {
    Logger.log('User', 'CollectionsPanelAddCollectionCancel');
    this.btnCLicked = true;
    this.setState({ isValid: true, isAdding: false });
  };

  isDenyDND = () => {
    const { path, permissions } = this.props.node;
    if (!permissions) return true;

    return (
      !picsioConfig.isMainApp()
      || ['favorites', 'websites', 'root'].includes(path)
      || !permissions.editAssetCollections
    );
  };

  onDrop = (event) => {
    if (this.isDenyDND()) return;
    event.currentTarget.classList.remove('onDragenterHighlight');
    if (event.dataTransfer.getData('text/plain') !== picsioConfig.DRAG_ASSETS_EVENT_CONTENT) {
      return showDropAssetsOnlyDialog();
    }

    const { inboxId } = this.props.searchQuery;
    const rootCollectionId = this.props.rootCollectionId || null;
    const isMoveOrCopyPopupDisabledByUser = utils.getCookie('picsio.moveOrCopyDialogVisible');

    if (inboxId) {
      /** always MOVE from inbox into collection */
      this.props.handlers.drop(this.props.node, true);
      return;
    }

    /* Show "move or copy" dialog only for LIGHTBOARDS and NOT ROOT collection
    we can't attach asset to the ROOT collection) */
    if (this.props.node._id !== rootCollectionId) {
      if (!isMoveOrCopyPopupDisabledByUser) {
        new DialogRadios({
          title: localization.DIALOGS.MOVE_ASSETS_DIALOG.TITLE,
          items: [
            {
              label: localization.DIALOGS.MOVE_ASSETS_DIALOG.COPY_RADIO.LABEL.COLLECTION,
              value: 'COPY',
              checked: !event.altKey,
              description: localization.DIALOGS.MOVE_ASSETS_DIALOG.COPY_RADIO.DESCRIPTION,
            },
            {
              label: localization.DIALOGS.MOVE_ASSETS_DIALOG.MOVE_RADIO.LABEL.COLLECTION,
              value: 'MOVE',
              checked: event.altKey,
              description: localization.DIALOGS.MOVE_ASSETS_DIALOG.MOVE_RADIO.DESCRIPTION(),
            },
          ],
          checkbox: {
            value: false,
            label: localization.DIALOGS.MOVE_ASSETS_DIALOG.CHECKBOX_LABEL,
            onChange: () => {},
          },
          cancelName: localization.DIALOGS.MOVE_ASSETS_DIALOG.CANCEL_TEXT,
          okName: localization.DIALOGS.MOVE_ASSETS_DIALOG.OK_TEXT,
          onOk: (value, checkboxValue) => {
            utils.setCookie('picsio.moveOrCopyDialogVisible', checkboxValue);
            if (value === 'MOVE') {
              this.props.handlers.drop(this.props.node, true);
            } else {
              this.props.handlers.drop(this.props.node);
            }
          },
        });
      } else if (event.altKey) {
        this.props.handlers.drop(this.props.node, true); // move
      } else {
        this.props.handlers.drop(this.props.node); // copy
      }
    }
  };

  onDragOver = (event) => {
    if (this.isDenyDND()) return;
    event.persist();
    this.props.handlers.dragover(event);

    if (timeoutId) return; /** if timeout already running -> skip */
    /** set timeout to open collection if has children and collapsed */
    if (!this.state.isOpen && this.props.node.hasChild) {
      timeoutId = setTimeout(() => {
        this.onClickArrow(event);
        timeoutId = null;
      }, 1000);
    }
  };

  onDragLeave = (event) => {
    if (this.isDenyDND()) return;
    this.props.handlers.dragleave(event);

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  onMouseOver = () => {
    this.$item?.current?.classList.add('hover');
  };

  onMouseLeave = () => {
    this.$item?.current?.classList.remove('hover');
  };

  onTouchStart = (event) => {
    const { clientX, clientY } = event.touches[0];
    this.setState({ clickPosition: [clientX, clientY] });
    event.persist();
    if (picsioConfig.isMainApp()) {
      this.buttonPressTimer = setTimeout(() => {
        this.handleTargetClick(event);
      }, holdTime);
    }
  };

  onPointerMove = (event) => {
    // cancel hold operation if moved too much
    if (this.isMobile && this.buttonPressTimer) {
      const { clientX, clientY } = event;
      const { clickPosition } = this.state;
      const d = (clientX - clickPosition[0]) ** 2 + (clientY - clickPosition[1]) ** 2;
      if (d > holdDistance) {
        window.clearTimeout(this.buttonPressTimer);
      }
    }
  };

  onTouchEnd = () => {
    if (picsioConfig.isMainApp()) {
      clearTimeout(this.buttonPressTimer);
    }
  };

  onClickItem = (event) => {
    if (this.props.node.deletedByTeammate) return;
    if (['favorites', 'websites'].includes(this.props.node.path)) {
      return this.onClickArrow(event);
    }
    this.props.handlers.item(this.props.node._id, this.props.node.hasChild);
    if (
      (!this.state.isOpen && this.props.node.hasChild)
      || (this.props.activeCollectionID === this.props.node._id && this.props.node.hasChild)
    ) {
      this.onClickArrow(event);
    }
  };

  /**
   * Handle click on button upload
   * @param {MouseEvent|TouchEvent} event
   */
  handleClickUpload = (event) => {
    event.stopPropagation();
    this.setState({ isNotUploading: false }, () => {
      this.props.handlers.uploadClick(this.props.node._id);
    });
  };

  render() {
    const { props, state } = this;
    const {
      node, handlers, subscriptionFeatures, rolePermissions,
    } = props;
    const {
      isMenuOpen, isNotUploading, isValid, isRenaming, newName,
    } = state;
    const { title, buttons } = this.memoizedGenerateTitleAndBtns(
      node,
      handlers,
      subscriptionFeatures,
      getPopperWrapper(),
      isMenuOpen,
      isNotUploading,
      isValid,
      isRenaming,
      newName,
    );
    const itemClassName = cn('nameFolder', 'rightShadow', {
      openFolderList: state.isOpen,
      act: props.activeCollectionID === props.node._id,
      menuActive: state.isMenuOpen,
      editModeFolder: state.isRenaming,
      renaming: props.node.isRenaming || props.node.isBusy,
      disabled: props.node.isFetching,
    });
    const arrowClassName = cn('arrowFolder', {
      hide: (!props.node.nodes || !props.node.nodes.length) && !props.node.hasChild,
    });

    let { lvl } = props;
    lvl && lvl--;
    return (
      <li
        className={cn({
          addedByTeammate: picsioConfig.isMainApp() && props.node.addedByTeammate,
          deletedByTeammate: picsioConfig.isMainApp() && props.node.deletedByTeammate,
          highlightBlinkColor:
            (picsioConfig.isMainApp() && props.node.websiteChangedByTeammate)
            || (picsioConfig.isMainApp() && props.node.highlight),
        })}
        role="treeitem"
        aria-expanded={state.isOpen}
        id={lvl === 0 ? props.id : null}
        tabIndex={lvl === 0 ? 0 : -1}
      >
        <Tooltip
          content={
            props.node.deletedByTeammate
              ? 'This collection has just been deleted by your teammate'
              : null
          }
          placement="top"
        >
          <span
            className={itemClassName}
            onClick={this.onClickItem}
            onDrop={this.onDrop}
            onDragOver={this.onDragOver}
            onDragLeave={this.onDragLeave}
            onDoubleClick={this.onDoubleClickName}
            onMouseOver={this.onMouseOver}
            onMouseLeave={this.onMouseLeave}
            onTouchStart={this.onTouchStart}
            onTouchEnd={this.onTouchEnd}
            onPointerMove={this.onPointerMove}
            style={{ paddingLeft: 36 + lvl * 15 }}
            ref={this.$item}
          >
            <StyledIconHolder className="iconHolder" color={props.node.color}>
              {(() => {
                if (picsioConfig.isMainApp()) {
                  // if (!props.node.favorites && !props.node.website && !props.node.websiteId) { return <Icon name="folder" />; }
                  // if (props.node.favorites && !props.node.website && !props.node.websiteId) { return <Icon name="favorite" />; }
                  // if (props.node.website || props.node.websiteId) { return <Icon name="folderPublic" />; }
                  if (!props.node.favorites && !props.node.website && !props.node.websiteId) { return <UiIcon size="lg" color="inherit"><Folder /></UiIcon>; }
                  if (props.node.favorites && !props.node.website && !props.node.websiteId) { return <UiIcon size="lg" color="inherit"><StarBorder /></UiIcon>; }
                  if (props.node.website || props.node.websiteId) { return <UiIcon size="lg" color="inherit"><Web /></UiIcon>; }
                }
              })()}
            </StyledIconHolder>
            <span
              className={arrowClassName}
              onClick={this.onClickArrow}
              style={{ left: 22 + lvl * 15 }}
            />
            {buttons}
            {title}
            {picsioConfig.isMainApp() && props.node.path === 'root' ? (
              <span className="itemCount leftShadow">
                {utils.formatNumberWithSpaces(props.node.count)}
              </span>
            ) : null}
          </span>
        </Tooltip>
        {/* temp name */}
        {state.newName !== null && (
          <ul>
            <li>
              <span
                className={`${itemClassName} renaming`}
                style={{ paddingLeft: 36 + (lvl + 1) * 15 }}
              >
                <span className="collectionTextValue">{state.newName}</span>
              </span>
            </li>
          </ul>
        )}
        {/* add child */}
        {state.isAdding && !props.node.isFetching && (
          <ul style={props.node.isFetching ? { position: 'absolute', top: -9999 } : {}}>
            <li>
              <span
                className={
                  `${itemClassName.replace('Public', '').replace('Favorite', '')} editModeFolder`
                }
                style={{ paddingLeft: 36 + (lvl + 1) * 15 }}
              >
                <div className="btnsEditCollection leftShadow">
                  <TreeButton
                    key="ok"
                    icon="ok"
                    additionalClassName={cn('btnCollection btnOkFolder', {
                      disabled: !this.state.isValid,
                    })}
                    tooltip={localization.INBOXESTREE.textSave}
                    onClick={this.doAdd}
                  />
                  <TreeButton
                    key="cancel"
                    icon="close"
                    additionalClassName="btnCancelFolder"
                    tooltip={localization.INBOXESTREE.textCancel}
                    onClick={this.cancelAdd}
                  />
                </div>
                <Textarea
                  isDefault
                  className={cn('collectionTextValue', { error: !this.state.isValid })}
                  defaultValue={this.makeNewCollectionName()}
                  onClick={this.stopPropagation}
                  onKeyDown={this.onKeyDownTextarea}
                  onBlur={this.onBlurAdd}
                  onChange={this.onChangeTextarea}
                  customRef={this.refTextareaAdd}
                />
              </span>
            </li>
          </ul>
        )}
        {/* fetching children */}
        {props.node.isFetching && state.isOpen && (
          <WithSkeletonTheme>
            <ul>
              <SkeletonItem
                itemClassName={itemClassName}
                lvl={lvl}
                node={props.node}
                picsioConfig={picsioConfig}
              />
            </ul>
          </WithSkeletonTheme>
        )}
        {/* Children */}
        {state.isOpen && props.node.nodes && props.node.nodes.length > 0 && (
          <ul role="group">
            {props.node.nodes.map((node) => (
              <Item
                key={node._id}
                node={node}
                activeCollectionID={props.activeCollectionID}
                handlers={props.handlers}
                lvl={props.lvl + 1}
                openedCollections={props.openedCollections}
                toggle={props.toggle}
                rootCollectionId={props.rootCollectionId}
                team={props.team}
                subscriptionFeatures={props.subscriptionFeatures}
                rolePermissions={rolePermissions}
                searchQuery={props.searchQuery}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }
}

Item.propTypes = {
  handlers: objectOf(func).isRequired,
  node: object.isRequired,
  activeCollectionID: string,
  lvl: number.isRequired,
  openedCollections: array,
  toggle: func,
  rootCollectionId: string,
};

const StyledIconHolder = styled.span`
  color: ${(props) => {
    if (props.color === '#8f8f8f') {
      return null;
    }
    return props.color;
  }} !important;
`;
