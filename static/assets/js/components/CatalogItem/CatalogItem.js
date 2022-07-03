import React, {
  memo, useMemo, useState, useEffect, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';
import PermissionsChecker from '@picsio/db/src/helpers/PermissionsChecker';
import useHover from '@react-hook/hover';
import dayjs from 'dayjs';
import {
  permissions as PERMISSIONS,
  ASYNC_JOB_STATUS_WAITING,
  ASYNC_JOB_STATUS_RUNNING,
  ASYNC_JOB_STATUS_COMPLETE,
} from '@picsio/db/src/constants';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import cn from 'classnames';
import getVideoThumbnail from '../../helpers/getVideoThumbnail';
import localization from '../../shared/strings';
import Logger from '../../services/Logger';
import picsioConfig from '../../../../../config';
import pollGDThumbnail from '../../helpers/thumbnailPoller';
import revisionUploader from '../../helpers/revisionUploader';
import checkForThumbnailing from '../../helpers/checkForThumbnailing';
import { showDownloadDialog } from '../../helpers/fileDownloader';
import { checkUserAccess } from '../../store/helpers/user';
import { checkDownloadConsent } from '../../store/helpers/assets';
import * as utils from '../../shared/utils';
import ua from '../../ua';

import { navigate } from '../../helpers/history';
import { getSavedCurrentTime } from '../previewView/views/Video/helpers';
import {
  checkIsAssetSelected,
  checkIsAssetHasNewComments,
  checkIsAssetHasNewRevisions,
} from '../../store/selectors/catalogView';
import {
  configErrors, configFormats, getConfigDefaultPlaceholder, configGApps,
} from './config';
import Archived from './Archived';
import Assignees from './Assignees';
import Collections from './Collections';
import Color from './Color';
import Comments from './Comments';
import Controls from './Controls';
import Checkbox from './Checkbox';
import Duration from './Duration';
import Flag from './Flag';
import Keywords from './Keywords';
import Lightboards from './Lightboards';
import Media from './Media';
import MediaPlaceholder from './MediaPlaceholder';
import PlaceholderAssetBusy from './PlaceholderAssetBusy';
import Restriction from './Restriction';
import Revisions from './Revisions';
import Spinner from './Spinner';
import Stars from './Stars';
import TitleDescription from './TitleDescription';
import VideoProgress from './VideoProgress';
import {
  handleContextMenu,
  handleDragEnd,
  handleDragLeave,
  handleDragOver,
  handleDragStart,
  handleDrop,
  handleMouseDown,
  handleMouseUp,
  initTouchListeners,
  makeTransformForImage,
  normalizeAsset,
  removeTouchListeners,
  showInfoPopupSelectAll,
} from './helpers';
import store from '../../store/index';

import './styles.scss';

const isMobile = ua.browser.isNotDesktop();

window.dragElement = null;
function CatalogItem(props) {
  const catalogItemRef = useRef();
  const inputFileRef = useRef(null);
  const isHovering = useHover(catalogItemRef, { enterDelay: 10, leaveDelay: 10 });

  const {
    asset,
    number,
    styles,
    isListViewMode,
    inProgress,
    assetsActions,
    isMobileView,
    isOdd,
    isLightboardsView,
  } = props;
  const normalizedAsset = useMemo(() => normalizeAsset(asset), [asset]);
  const {
    deleteAssets,
    detachKeyword,
    removeFromLightboard,
    removeHighlight,
    removeNotFoundAssets,
    reorder,
    restoreAssets,
    select,
    trashAssets,
    duplicateAsset,
  } = assetsActions;

  const showTileHint = picsioConfig.isMainApp()
    || (picsioConfig.access
      && (picsioConfig.access.flagShow
        || picsioConfig.access.ratingShow
        || picsioConfig.access.colorShow
        || picsioConfig.access.download
        || picsioConfig.access.fileNameShow));

  const {
    _id: assetId,
    allowAssetSharing,
    allowRemoveTags,
    archived,
    archivedByReason,
    assetSharing,
    assignees,
    color,
    colorChangeable,
    colorShow,
    allowDuplicateAsset,
    comments,
    customThumbnail,
    description,
    downloadFiles,
    enableEditor,
    fileExtension = '',
    fileNameShow,
    flag,
    flagChangeable,
    flagShow,
    hasAccess,
    imageMediaMetadata,
    inbox,
    is3DModel,
    isDownloadable,
    isEditableInPicsioEditor,
    isEmpty,
    isGoingToDelete,
    isGoingToMove,
    isGoingToRestore,
    isGoingToTrash,
    isGoogleDriveDocument,
    isRestricted,
    isShared,
    isSupportedVideo,
    isTrashed,
    isVideo,
    keywords = [],
    lightboards = [],
    meta = {},
    mimeType,
    name,
    paramsForHighlight,
    rating,
    ratingChangeable,
    ratingShow,
    removeFiles,
    restrictedReason,
    revisions = [],
    shortName,
    storageCreatedAt,
    storageId,
    storageType,
    tags,
    thumbnail,
    thumbnailing,
    thumbnailingReason,
    title,
    updatedAt,
    uploadFiles,
    uploadRevisionProgress,
    urlSmallThumb,
    userOrientation,
    videoPreviews,
    videoThumbnail,
    commentsEdit,
    commentsEnable,
    commentsShow,
    revisionsShow,
    watermark,
  } = normalizedAsset;

  const isSelected = useSelector(checkIsAssetSelected(assetId));
  const newComments = useSelector(checkIsAssetHasNewComments(assetId));
  const newRevisions = useSelector(checkIsAssetHasNewRevisions(assetId));
  const { trashed } = useSelector((state) => state.router.location.query);
  const { isWebpSupported } = useSelector((state) => state.main);
  const { role } = useSelector((state) => state.user);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const [thumbnailPlaceholder, setThumbnailPlaceholder] = useState(null);
  const [showSpinner, setShowSpinner] = useState(false);
  const [spinnerTitle, setSpinnerTitle] = useState(null);
  const [mouseOver, setMouseOver] = useState(false);
  const [, forceUpdate] = React.useState(0); // hook like forceUpdate
  const permissionChecker = new PermissionsChecker(role);

  const isAllowedLightboards = checkUserAccess('permissions', 'manageLightboards');

  let videoThumbFetched = null;
  const isAssetBusy = isGoingToDelete || isGoingToRestore || isGoingToTrash || isGoingToMove;
  const extension = fileExtension && fileExtension.toLowerCase();
  const isTransparentImageLoaded = thumbnailLoaded && (extension === 'png' || extension === 'svg' || extension === 'gif');
  const isAssetFromInbox = Boolean(inbox);
  const generatedDate = dayjs(storageCreatedAt).format('ll');
  const { Duration: duration } = meta;
  const videoProgress = isVideo && duration ? getSavedCurrentTime(assetId) : null;

  const url = thumbnail ? thumbnail.small : null;
  let poller = null;

  const handleDeleteForever = () => {
    Logger.log('User', 'ThubmnailDeleteAssetsFromTrashDialog');
    const deleteWithoutTrash = (isEmpty && !isTrashed) || isAssetFromInbox || false;
    deleteAssets([assetId], deleteWithoutTrash);
  };

  /**
   * Show spinner
   * @param {String} value
   */
  const runSpinner = (value) => {
    setShowSpinner(true);
    setSpinnerTitle(value || null);
  };

  const stopSpinner = () => {
    setShowSpinner(false);
    setSpinnerTitle(null);
  };

  useEffect(() => {
    if (uploadRevisionProgress === 0) {
      runSpinner('New revision is loading ');
    }

    if (uploadRevisionProgress === null) {
      stopSpinner();
    }
  }, [uploadRevisionProgress]);

  // it uses from placeholder config
  // eslint-disable-next-line no-unused-vars
  function handleRemoveNotFoundAssets() {
    removeNotFoundAssets([assetId]);
  }

  /** Remove lightboard */
  const handleRemoveLightboard = () => {
    const lightboardId = store.getState().router.location?.query?.lightboardId || lightboards[0]._id;
    const lightboard = lightboards.find((lb) => lb._id === lightboardId);
    if (lightboard) {
      Logger.log('User', 'ThumbnailRemoveLightboard');
      removeFromLightboard(lightboard, [assetId]);
    }
  };

  // needs for placeholder config
  const handlers = {
    handleDeleteForever,
    handleRemoveNotFoundAssets,
    handleRemoveLightboard,
  };

  /**
   * Set thumbnail placeholder
   * @param {Object} params
   */
  const renderPlaceholder = ({
    icon,
    iconColor,
    text,
    btn,
    onClick,
    disableDownload,
    fullWidth,
    selectable,
  }) => {
    setThumbnailPlaceholder({
      iconClass: icon,
      iconColor,
      text,
      btn,
      onClick: handlers[onClick] || null,
      fileName: name,
      disableDownload,
      fullWidth,
      selectable,
    });
    setShowSpinner(false);
    setSpinnerTitle(null);
  };

  /**
   * Init thumbnail error
   * @param {Object} params
   */
  const initError = (params) => {
    const code = params && params.code;
    const config = configErrors[code] || getConfigDefaultPlaceholder();
    /** config.text may be a function */
    if (typeof config.text === 'function') config.text = config.text();
    const formatConfig = configFormats[extension];

    if (formatConfig && code !== 'noPermissions') {
      config.icon = formatConfig.icon || config.icon;
      config.iconColor = formatConfig.iconColor || config.iconColor;
      config.text = formatConfig.text || (typeof config.text === 'function' ? config.text() : config.text);
    } else {
      config.disableDownload = !isDownloadable;
    }

    renderPlaceholder(config);
  };

  const initThumbnailing = (skipped) => {
    let config = { ...configErrors.thumbnailing };
    const formatConfig = configFormats[extension];

    if (formatConfig) {
      config.icon = formatConfig.icon || config.icon;
      config.iconColor = formatConfig.iconColor || config.iconColor;
      config.text = formatConfig.text || config.text;
    } else {
      config.disableDownload = !isDownloadable;
    }

    if (skipped) {
      config = getConfigDefaultPlaceholder();
    }

    renderPlaceholder(config);
  };

  const removePlaceholder = () => {
    setThumbnailPlaceholder(null);
    setShowSpinner(false);
    setSpinnerTitle(null);
  };

  const handleImgLoad = () => {
    /* if component mounted */
    if (catalogItemRef.current) {
      removePlaceholder();
      setThumbnailLoaded(true);
    }
  };

  const handleLoadImageError = () => {
    if ((mimeType || '').includes('google-apps')) {
      if (configGApps[mimeType]) {
        return renderPlaceholder({ ...configGApps[mimeType], iconColor: '#474747' });
      }
      initError();
    }
    return null;
  };

  useEffect(() => {
    const thumbError = thumbnail && thumbnail.error;

    if (!hasAccess) {
      return initError({ code: 'noPermissions' });
    }

    if (isVideo && !isSupportedVideo && !customThumbnail) {
      /** if is not supported video */
      initError({ code: 205 });
    } else if ([ASYNC_JOB_STATUS_WAITING, ASYNC_JOB_STATUS_RUNNING].includes(thumbnailing)) {
      initThumbnailing();
    } else if (is3DModel || thumbError) {
      initError(thumbError);
    } else if (isEmpty) {
      initError({ code: '204' });
    } else if (
      !thumbnail
      && thumbnailing === 'skipped'
      && thumbnailingReason
      && thumbnailingReason.includes('BY_ACCOUNT_PLAN_LIMITS')
    ) {
      initThumbnailing(true);
    } else if (thumbnail === null) {
      if (dayjs(updatedAt).diff(dayjs(), 'hour') === 0 && storageType === 'gd') {
        initThumbnailing();
        poller = pollGDThumbnail(assetId);
      } else {
        initError();
      }
    }
    if (ua.device.name === 'iPad') {
      initTouchListeners();
    }

    window.addEventListener('userChangeDateLocale', () => {
      forceUpdate((n) => !n);
    });
    return () => {
      if (ua.device.name === 'iPad') {
        removeTouchListeners();
      }

      if (poller) {
        poller.stop();
        poller = undefined;
      }
    };
  }, []);

  useEffect(() => {
    if (!hasAccess) return;

    const hasInProgress = [ASYNC_JOB_STATUS_WAITING, ASYNC_JOB_STATUS_RUNNING].includes(
      thumbnailing,
    );
    if (!hasInProgress && thumbnailing === ASYNC_JOB_STATUS_COMPLETE && thumbnail) {
      removePlaceholder();
      return;
    }

    if (isVideo && !isSupportedVideo && !customThumbnail) {
      /** if is not supported video */
      if (thumbnailPlaceholder) return;
      initError({ code: 205 });
      return;
    }
    if (
      checkForThumbnailing({
        storageType,
        fileExtension,
        thumbnailing,
        thumbnail,
      })
    ) {
      if (thumbnailPlaceholder) return;
      initThumbnailing();
      return;
    }

    if (thumbnail === null) {
      if (
        thumbnailing === 'skipped'
        && thumbnailingReason
        && thumbnailingReason.includes('BY_ACCOUNT_PLAN_LIMITS')
      ) {
        initThumbnailing(true);
      } else if (!isEmpty && dayjs(updatedAt).diff(dayjs(), 'hour') === 0 && storageType === 'gd') {
        initThumbnailing();
        if (!poller) poller = pollGDThumbnail(assetId);
      } else if (isEmpty) {
        initError({ code: '204' });
      } else {
        initError();
      }
    } else if (thumbnail && thumbnail.error) {
      initError(thumbnail.error);
    }
  }, [thumbnail, thumbnailing, customThumbnail]);

  const highlightAnimationReset = (type) => {
    removeHighlight([assetId], type);
  };

  const handleDownload = async () => {
    try {
      if (picsioConfig.isProofing()) {
        await checkDownloadConsent();
      }
    } catch (err) {
      // user click Cancel on Dialog
      return;
    }

    Logger.log('User', 'ThumbnailDownload');
    showDownloadDialog([assetId]);
  };

  const handleMouseOver = async () => {
    if (ua.isMobileApp()) return;
    if (!isListViewMode) setMouseOver(true);
    if (
      isVideo
      && thumbnailLoaded
      && videoPreviews
      && videoPreviews.head
      && !videoThumbnail
      && videoThumbFetched === null
    ) {
      videoThumbFetched = false;
      if (isWebpSupported) {
        await getVideoThumbnail(assetId);
        videoThumbFetched = true;
      }
    }
  };

  const handleMouseLeave = () => {
    if (!isListViewMode) setMouseOver(false);
    utils.css(document.querySelector('.cursorReorderImages'), { display: 'none' });
  };

  /**
   * Select item
   * @param {Boolean} shiftKey
   * @param {Boolean} altKey
   */
  const selectImage = (shiftKey, altKey) => {
    const selected = !isSelected;
    select(assetId, selected, shiftKey, altKey);
  };

  /**
   * Select item
   * @param {MouseEvent} event
   */
  const handleSelectItem = (event) => {
    event.stopPropagation();
    event.preventDefault();
    selectImage(event.shiftKey, event.altKey);
    if (!isMobile && picsioConfig.isMainApp()) {
      showInfoPopupSelectAll();
    }
  };

  /**
   * Click on this.el
   * @param {MouseEvent} event
   */
  const handleClick = (event) => {
    const isControls = event.target.classList.contains('catalogItem__controls');
    const isName = event.target.classList.contains('catalogItem__name');
    const isChips = event.target.classList.contains('catalogItem__chips');
    const isCollectionsWrapper = event.target.classList.contains(
      'catalogItem__collections-wrapper',
    );

    if (
      (event.target === event.currentTarget
        || isControls
        || isName
        || isChips
        || isCollectionsWrapper)
      && (picsioConfig.isMainApp() || picsioConfig.isProofing())
    ) {
      selectImage(event.shiftKey, event.altKey);
    }
  };

  const openPreview = () => {
    navigate(`/preview/${assetId}`);
  };

  /**
   * Click on media item
   * @param {MouseEvent} event
   */
  const handleClickImage = (event) => {
    event.stopPropagation();

    if (picsioConfig.isMainApp() && (event.ctrlKey || event.metaKey || event.shiftKey)) {
      selectImage(event.shiftKey);
    } else if (picsioConfig.isMainApp() && event.altKey) {
      selectImage(null, event.altKey);
    } else if (hasAccess) {
      openPreview(assetId);
    }
  };

  /**
   * Add new revision
   * @param {File} file
   */
  const addRevision = async (file) => {
    // runSpinner('New revision is loading ');
    const { items } = store.getState().assets;
    const currentAsset = items.find((item) => item._id === assetId);
    await revisionUploader(file, currentAsset);
    // stopSpinner();
  };

  const handleUploadClick = () => {
    Logger.log('User', 'ThumbnailAddRevision');
    inputFileRef.current.click();
  };

  /**
   * On change input file
   * @param {Event} event
   */
  const handleAddRevision = (event) => {
    if (event && event.target) {
      addRevision(event.target.files[0]);
      // event.target.value = '';
    }
  };

  /**
   * Check user permission to detach collection from asset
   * @param {string} path
   * @returns boolean
   */
  const checkPermissionToDetachCollection = (path) => {
    const { editAssetCollections } = PERMISSIONS;
    return permissionChecker.checkPermissionByPath(editAssetCollections, path);
  };

  const catalogItemChipsStyles = {};
  if (isListViewMode) {
    let catalogItemButtonsWidth = 40;
    if (allowAssetSharing) catalogItemButtonsWidth += 37;
    if (uploadFiles) catalogItemButtonsWidth += 37;
    if (allowDuplicateAsset) catalogItemButtonsWidth += 37;
    if (downloadFiles) catalogItemButtonsWidth += 37;
    if (enableEditor) catalogItemButtonsWidth += 37;
    if (isLightboardsView) catalogItemButtonsWidth += 37;
    if (picsioConfig.isMainApp() && isTrashed) catalogItemButtonsWidth += 74;
    if (removeFiles) catalogItemButtonsWidth += 37;
    catalogItemChipsStyles.right = catalogItemButtonsWidth;
  }

  return (
    <StyledCatalogItem
      ref={catalogItemRef}
      className={cn('catalogItem', {
        like: flag === 'flagged',
        dislike: flag === 'rejected',
        showStars: rating > 0,
        trashed: isTrashed,
        isSelected,
        isAssetBusy,
        noTitle: !title,
        withTitle: isListViewMode && title,
        isNarrow: !isListViewMode && styles.width < 166,
        isOdd: isListViewMode && isOdd,
      })}
      styles={styles}
      onClick={isAssetBusy ? null : handleClick}
      onDrop={(event) => handleDrop(event, isListViewMode, number, reorder)}
      onDragOver={(event) => handleDragOver(event, isListViewMode, styles)}
      onDragLeave={handleDragLeave}
      onMouseOver={isAssetBusy ? null : handleMouseOver}
      onMouseLeave={handleMouseLeave}
      onMouseDown={(event) => handleMouseDown(event, catalogItemRef, trashed)}
      onMouseUp={handleMouseUp}
      onDragStart={(event) => handleDragStart(event, assetId, isSelected, select, downloadFiles)}
      onDragEnd={handleDragEnd}
      onContextMenu={handleContextMenu}
      draggable={hasAccess && !isAssetBusy && !archived}
    >
      <If condition={uploadFiles}>
        <div className="catalogItem__file">
          <input type="file" ref={inputFileRef} onChange={handleAddRevision} />
        </div>
      </If>
      <If condition={flagShow && hasAccess}>
        <Flag
          assetId={assetId}
          flag={flag}
          flagChangeable={flagChangeable}
          highlight={paramsForHighlight.includes('flag')}
          highlightAnimationReset={highlightAnimationReset}
        />
      </If>
      <If
        condition={
          (picsioConfig.isMainApp() || (picsioConfig.isProofing() && downloadFiles))
          && (isMobile || mouseOver || isListViewMode || isSelected)
        }
      >
        <Checkbox hasAccess={hasAccess} onClick={handleSelectItem} isSelected={isSelected} />
      </If>
      <If condition={ratingShow && (mouseOver || rating > 0 || isListViewMode)}>
        <Stars
          assetId={assetId}
          currentValue={rating}
          ratingChangeable={ratingChangeable}
          highlight={paramsForHighlight.includes('rating')}
          highlightAnimationReset={highlightAnimationReset}
        />
      </If>
      <If condition={colorShow && color}>
        <Color
          color={color}
          highlight={paramsForHighlight.includes('color')}
          highlightAnimationReset={highlightAnimationReset}
        />
      </If>
      <If condition={picsioConfig.isMainApp() && !isListViewMode && assignees.length}>
        <Assignees assignees={assignees} max={3} />
      </If>

      <If condition={isAssetBusy}>
        <PlaceholderAssetBusy
          isGoingToTrash={isGoingToTrash}
          isGoingToDelete={isGoingToDelete}
          isGoingToRestore={isGoingToRestore}
          isGoingToMove={isGoingToMove}
          assetName={asset.name}
        />
      </If>

      <Choose>
        <When condition={isListViewMode}>
          <If condition={isRestricted}>
            <Restriction restrictedReason={restrictedReason} />
          </If>
        </When>
        <Otherwise>
          <div className="catalogItem__additional">
            <If condition={commentsShow && commentsEnable && (isHovering || newComments)}>
              <Comments
                newCommentsLength={newComments}
                assetId={assetId}
                allCommentsLength={comments.length}
                highlight={paramsForHighlight.includes('newComments')}
                highlightAnimationReset={highlightAnimationReset}
              />
            </If>
            <If condition={isRestricted}>
              <Restriction restrictedReason={restrictedReason} />
            </If>
            <If condition={archived}>
              <Archived
                archivedReason={archivedByReason || localization.DETAILS.defaultArchiveReason}
              />
            </If>
          </div>
          <If condition={revisionsShow && newRevisions}>
            <Revisions
              newRevisionsLength={newRevisions}
              assetId={assetId}
              highlight={paramsForHighlight.includes('newRevisions')}
              highlightAnimationReset={highlightAnimationReset}
            />
          </If>
        </Otherwise>
      </Choose>

      <CSSTransition
        unmountOnExit
        in={Boolean(showTileHint && hasAccess && (isHovering || isListViewMode))}
        timeout={300}
        classNames="fade"
      >
        <Controls
          allowDuplicateAsset={allowDuplicateAsset}
          assetId={assetId}
          flagShow={flagShow}
          colorShow={colorShow}
          commentsEdit={commentsEdit}
          commentsEnable={commentsEnable}
          fileNameShow={fileNameShow}
          allowAssetSharing={allowAssetSharing}
          uploadFiles={uploadFiles}
          downloadFiles={downloadFiles}
          enableEditor={enableEditor}
          removeFiles={removeFiles}
          storageType={storageType}
          isListViewMode={isListViewMode}
          storageId={storageId}
          name={name}
          shortName={shortName}
          fileExtension={fileExtension}
          title={title}
          color={color}
          colorChangeable={colorChangeable}
          trashAssets={() => trashAssets([assetId])}
          restoreAssets={() => restoreAssets([assetId])}
          handleDownload={handleDownload}
          handleUploadClick={handleUploadClick}
          handleRemoveLightboard={handleRemoveLightboard}
          isLightboardsView={isLightboardsView}
          isAssetFromInbox={isAssetFromInbox}
          isShared={isShared}
          assetSharing={assetSharing}
          isGoogleDriveDocument={isGoogleDriveDocument}
          mimeType={mimeType}
          isEditableInPicsioEditor={isEditableInPicsioEditor}
          revisionsLength={revisions.length}
          isMobileView={isMobileView}
          itemWidth={styles.width}
          isTrashed={isTrashed}
          deleteForever={handleDeleteForever}
          duplicateAsset={duplicateAsset}
        />
      </CSSTransition>

      {/* creation date */}
      <If condition={isListViewMode && generatedDate}>
        <div className="catalogItem__date">{generatedDate}</div>
      </If>

      <If condition={isListViewMode && (title || description)}>
        <TitleDescription title={title} description={description} isMobileView />
      </If>

      <If condition={!isListViewMode && duration && isVideo}>
        <Duration duration={duration} />
      </If>

      <If condition={videoProgress}>
        <VideoProgress progress={videoProgress} duration={duration} />
      </If>

      <CSSTransition
        unmountOnExit
        in={Boolean(
          picsioConfig.isMainApp()
            && (tags.length || lightboards.length || keywords.length)
            && (isHovering || isListViewMode),
        )}
        timeout={300}
        classNames="fade"
      >
        <div className="catalogItem__chips" style={catalogItemChipsStyles}>
          <If condition={!isListViewMode && lightboards.length && isAllowedLightboards}>
            <div className="catalogItem__chips-chip">
              <Lightboards assetId={assetId} items={lightboards} onRemove={removeFromLightboard} />
            </div>
          </If>
          <If condition={!isListViewMode && keywords.length}>
            <div className="catalogItem__chips-chip">
              <Keywords
                assetId={assetId}
                items={keywords}
                keywordsEditable={false}
                onRemove={detachKeyword}
              />
            </div>
          </If>
          <If condition={tags.length}>
            <div className="catalogItem__chips-chip">
              <Collections
                assetId={assetId}
                archived={archived}
                items={tags}
                allowRemoveTags={allowRemoveTags}
                checkPermissionToDetachCollection={checkPermissionToDetachCollection}
              />
            </div>
          </If>
        </div>
      </CSSTransition>

      {/* thumbnail */}
      <Choose>
        <When condition={thumbnailPlaceholder !== null}>
          <MediaPlaceholder
            thumbnailPlaceholder={thumbnailPlaceholder}
            onClickImage={handleClickImage}
          />
        </When>
        <Otherwise>
          <Media
            watermark={watermark}
            number={number}
            width={styles.width}
            name={name}
            fileExtension={fileExtension}
            thumbnailLoaded={thumbnailLoaded}
            isListViewMode={isListViewMode}
            isSelected={isSelected}
            isTransparentImageLoaded={isTransparentImageLoaded}
            videoThumbnail={videoThumbnail}
            mouseOver={mouseOver}
            url={url}
            urlSmallThumb={urlSmallThumb}
            description={description}
            userOrientation={userOrientation}
            imageMediaMetadata={imageMediaMetadata}
            handleImgLoad={handleImgLoad}
            handleLoadImageError={handleLoadImageError}
            handleClickImage={handleClickImage}
            makeTransformForImage={makeTransformForImage}
          />
        </Otherwise>
      </Choose>

      {/* spinner */}
      <If condition={showSpinner || inProgress}>
        <Spinner spinnerTitle={spinnerTitle} uploadRevisionProgress={uploadRevisionProgress} />
      </If>
    </StyledCatalogItem>
  );
}

CatalogItem.defaultProps = {
  inProgress: false,
  isOdd: false,
  isLightboardsView: false,
};

CatalogItem.propTypes = {
  asset: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    allowAssetSharing: PropTypes.bool,
    archived: PropTypes.bool,
    archivedByReason: PropTypes.string,
    color: PropTypes.string.isRequired,
    colorChangeable: PropTypes.bool,
    colorShow: PropTypes.bool,
    downloadFiles: PropTypes.bool,
    enableEditor: PropTypes.bool,
    fileExtension: PropTypes.string,
    fileNameShow: PropTypes.bool,
    flag: PropTypes.string.isRequired,
    flagChangeable: PropTypes.bool,
    flagShow: PropTypes.bool,
    hasAccess: PropTypes.bool.isRequired,
    isGoingToDelete: PropTypes.bool,
    isGoingToMove: PropTypes.bool,
    isGoingToRestore: PropTypes.bool,
    isGoingToTrash: PropTypes.bool,
    isShared: PropTypes.bool,
    isTrashed: PropTypes.bool,
    name: PropTypes.string.isRequired,
    paramsForHighlight: PropTypes.arrayOf(PropTypes.string),
    rating: PropTypes.number.isRequired,
    ratingChangeable: PropTypes.bool,
    ratingShow: PropTypes.bool,
    removeFiles: PropTypes.bool,
    shortName: PropTypes.string,
    storageId: PropTypes.string.isRequired,
    storageType: PropTypes.string.isRequired,
    title: PropTypes.string,
    uploadFiles: PropTypes.bool,
    commentsShow: PropTypes.bool,
    commentsEnable: PropTypes.bool,
    // commentsEdit: PropTypes.bool,
    // revisionsShow: PropTypes.bool,
  }).isRequired,
  assetsActions: PropTypes.shape({
    deleteAssets: PropTypes.func.isRequired,
    detachKeyword: PropTypes.func.isRequired,
    removeFromLightboard: PropTypes.func.isRequired,
    removeHighlight: PropTypes.func.isRequired,
    removeNotFoundAssets: PropTypes.func.isRequired,
    reorder: PropTypes.func.isRequired,
    restoreAssets: PropTypes.func.isRequired,
    select: PropTypes.func.isRequired,
    trashAssets: PropTypes.func.isRequired,
  }).isRequired,
  inProgress: PropTypes.bool,
  isListViewMode: PropTypes.bool.isRequired,
  isMobileView: PropTypes.bool.isRequired,
  isOdd: PropTypes.bool,
  number: PropTypes.number.isRequired,
  styles: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    translateX: PropTypes.number.isRequired,
    translateY: PropTypes.number.isRequired,
  }).isRequired,
  isLightboardsView: PropTypes.bool,
};

const StyledCatalogItem = styled.div.attrs((props) => ({
  style: {
    transform: `translate3d(${props.styles.translateX}px, ${props.styles.translateY}px, 0)`,
    width: props.styles.width,
    height: props.styles.height,
  },
}))``;

export default memo(CatalogItem);
