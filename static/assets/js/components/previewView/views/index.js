import React from 'react';
import cn from 'classnames';
import {
  string, object, number, oneOfType, bool,
} from 'prop-types';
import debounce from 'lodash.debounce';

import { Provider, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import remove from 'lodash.remove';
import dayjs from 'dayjs';
import picsioConfig from '../../../../../../config';

import Logger from '../../../services/Logger';
import * as utils from '../../../shared/utils';
import localization from '../../../shared/strings';
import ToolbarPreviewTop from '../../toolbars/ToolbarPreviewTop';
import History from '../../history';
import ErrorBoundary from '../../ErrorBoundary';
import ua from '../../../ua';
import * as assetsApi from '../../../api/assets';
import PubSubService from '../../../services/PubSubService';
import { showFileDeletedDialog } from '../../../helpers/errorHandler';
import { checkUserAccess } from '../../../store/helpers/user';

import {
  showDownloadDialog,
  downloadAsset,
  downloadFile,
  downloadAssetWithWatermark,
} from '../../../helpers/fileDownloader';

import { normalizeUserAvatarSrc } from '../../../store/helpers/teammates';

import {
  fetchData,
  getRevisions,
  normalizeRevisions,
  sortData,
  addComment,
  removeComment,
  setMarkersNumber,
  setRevisionIdToComment,
  addInitialRevision,
  makeTechComment,
  addReactionToComment,
} from '../../history/helper';

import { getSavedCurrentTime } from './Video/helpers';

import getDownloadUrl from '../../../helpers/getDownloadUrl';
import checkForThumbnailing from '../../../helpers/checkForThumbnailing';
import revisionUploader from '../../../helpers/revisionUploader';
import { preloadImage, pollImage } from '../../../helpers/images';
import { sendDownloadedNotification } from '../../../api/downloadList';

import Details from '../../details/view/index';
import Spinner from './Spinner'; // eslint-disable-line
import Placeholder from './Placeholder'; // eslint-disable-line
import Image from './Image'; // eslint-disable-line
import Video from './Video/index'; // eslint-disable-line
import Audio from './Audio'; // eslint-disable-line
import Pdf from './Pdf/index'; // eslint-disable-line
import Icon from '../../Icon';

// store
import store from '../../../store';
import * as actions from '../../../store/actions/assets';
import * as mainActions from '../../../store/actions/main';
import * as userActions from '../../../store/actions/user';
import { fetchJobsStatus } from '../../../store/actions/notifications';
import { AssetAnalyticsScreen } from '../../Analytics';
import { checkDownloadConsent } from '../../../store/helpers/assets';
import { showDialog, showErrorDialog } from '../../dialog';
import Obj from './Obj/index';
import Multipage from './Multipage/index';
import Swipeable from '../../Swipeable';
import { back, navigate } from '../../../helpers/history';
import sendEventToIntercom from '../../../services/IntercomEventService';

function isHistoryPanelEnabled() {
  if (!picsioConfig.isMainApp()) {
    return picsioConfig.access.commentShow || picsioConfig.access.revisionsShow;
  }
  return true;
}

function isActivityPanelEnabled() {
  if (!picsioConfig.isMainApp()) {
    return (
      picsioConfig.access.titleShow
      || picsioConfig.access.descriptionShow
      || picsioConfig.access.flagShow
      || picsioConfig.access.ratingShow
      || picsioConfig.access.colorShow
      || picsioConfig.access.customFieldsShow
    );
  }
  return true;
}

function shouldRenderDetails() {
  return isActivityPanelEnabled() && utils.LocalStorage.get('picsio.infopanelOpened');
}

function shouldRenderHistory() {
  const historyPanelOpened = utils.LocalStorage.get('picsio.historypanelOpened');
  return isHistoryPanelEnabled() && (historyPanelOpened === null ? true : historyPanelOpened);
}

const shouldRenderRevisionsDropdown = () => {
  if (!picsioConfig.isMainApp()) {
    return picsioConfig.access.revisionsShow;
  }
  return true;
};

class PreviewView extends React.Component {
  isLastRevisionTechnical = false;

  constructor(props) {
    super(props);

    /** if hash in uri - show history panel */
    if (window.location.hash) {
      utils.LocalStorage.set('picsio.infopanelOpened', false);
      utils.LocalStorage.set('picsio.historypanelOpened', true);
    }

    this.videoPlayer = React.createRef();

    this.state = {
      currentAssetId: props.id,
      isLoaded: !!props.asset,
      spinnerText: '',
      isThumbnailing:
        props.asset
        && (props.asset.thumbnailing === 'waiting' || props.asset.thumbnailing === 'running'),
      showDropArea: false,
      idDiffState: null,
      idActiveState: null,
      headRevisionId: null,
      activeRevisionNumber: null,
      diffRevisionNumber: null,
      tmpMarkers: [],
      markers: [],
      showHistory: shouldRenderHistory(),
      showDetails: shouldRenderDetails(),
      listenToAddMarker: false,
      nextMarkerNumber: 0,
      analyticsIsOpened: false,
      dataIsRecieved: false,
      isLoadedHistoryItemsLoaded: false,
      historyItems: [],
      revisionsNumbers: {},
      approvals: [],
      isApproveDisabled: false,
      commentsCount: 0,
      replyTo: null,
      revisionIsUploading: false,
      historyActions: {
        getActiveRevisionID: this.getActiveRevisionID,
        activateRevision: this.activateRevision,
        toggleRevisionComments: this.toggleRevisionComments,
        revertRevision: this.revertRevision,
        activateDiff: this.activateDiff,
        handleEyeClick: this.handleEyeClick,
        onCommentRemove: this.onCommentRemove,
        addReply: this.addReply,
        addReaction: this.addReaction,
        changeApprove: this.changeApprove,
        addComment: this.addComment,
        cancelReply: this.cancelReply,
      },
      commentTimeRange: [getSavedCurrentTime(props.id) || 0, getSavedCurrentTime(props.id) || 0],
      isCheckedAttachTime: true,
    };

    this.preloadNeighbors = debounce(this.preloadNeighbors, 300);
  }

  static getDerivedStateFromProps(props, prevState) {
    const { asset, id } = props;
    let state = {
      currentAssetId: id,
      isThumbnailing: checkForThumbnailing(asset),
    };

    if (prevState.currentAssetId !== props.id) {
      /** asset changed */
      state = {
        ...state,
        spinnerText: '',
        showDropArea: false,
        idDiffState: null,
        idActiveState: null,
        activeRevisionNumber: null,
        diffRevisionNumber: null,
        tmpMarkers: [],
        markers: [],
        isCheckedAttachTime: true,
        showHistory: shouldRenderHistory(),
        listenToAddMarker: false,
        nextMarkerNumber: 0,
        commentTimeRange: [getSavedCurrentTime(props.id) || 0, getSavedCurrentTime(props.id) || 0],
      };
    }
    if (asset !== null) {
      const isAllowedDownloading = !asset.trashed
        && asset.isSupportedForDownload
        && (picsioConfig.isMainApp() ? asset.permissions.downloadFiles : picsioConfig.access.download);
      const isAllowedDeleting = !asset.trashed && picsioConfig.isMainApp() && asset.permissions.deleteAssets;
      const isAllowedUploadingRevision = !asset.trashed
        && asset.canUploadRevisions
        && picsioConfig.isMainApp()
        && asset.permissions.upload;

      state = {
        ...state,
        spinnerText:
          asset.uploadRevisionProgress !== null
            ? `Uploading revision ${asset.uploadRevisionProgress}%...`
            : prevState.spinnerText,
        isLoaded: true,
        isAllowedDownloading,
        isAllowedDeleting,
        isAllowedUploadingRevision,
      };
    }
    return state;
  }

  componentDidMount() {
    this.subscribe();
    window.addEventListener('revision:added', this.fetchData.bind(this, null), false);
    // hideImport and undelegate all events. @TODO: do we need it now?
    if (picsioConfig.isMainApp() && this.props.importOpened) {
      this.props.mainActions.closeImport();
    }

    window.dispatchEvent(new Event('preview:opened'));

    if (!this.props.asset) {
      this.props.actions.getTmpAssets([this.props.id]);
    } else if (this.props.asset.archived) {
      Logger.log('User', 'ArchivedAssetOpened', { assetId: this.props.id });
    }

    this.runHotkeyListeners();
    if (this.props.asset) this.fetchData(this.props.asset);
    this.checkThumbnailing();
    if (this.props.catalogViewMode === 'geo') this.preloadNeighbors();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.asset !== null && this.props.asset === null) {
      /** if asset trashed -> it removed from store */
      if (prevProps.id === this.props.id) {
        this.props.actions.removeTmpItems();
        back(null, 'previewView');
      } else {
        /** if navigate to asset not from catalog (linkedAssets in Preview) */
        this.props.actions.getTmpAssets([this.props.id]);
      }
    }

    if (this.props.asset && !this.state.dataIsRecieved) {
      this.fetchData(this.props.asset);
    }

    if (prevProps.id !== this.props.id) {
      this.fetchData(this.props.asset);
      this.preloadNeighbors();
      if (!picsioConfig.isSingleApp()) {
        Logger.log('User', 'PreviewShow', { assetId: this.props.id });
      }
    }
    this.checkThumbnailing();
  }

  componentWillUnmount() {
    window.dispatchEvent(new Event('preview:closed'));
    this.unsubscribe();
    window.removeEventListener('revision:added', this.fetchData, false);
    this.stopHotkeyListeners();
    if (this.poller) this.poller.stop();
  }

  checkThumbnailing = () => {
    if (this.state.isThumbnailing) {
      if (this.poller) this.poller.stop();
      if (this.props.asset.thumbnail) {
        this.poller = pollImage(this.props.asset.thumbnail.big);
      }
    } else if (this.poller) {
      this.poller.stop();
    }
  };

  runHotkeyListeners = () => {
    window.addEventListener('hotkeys:preview:left', this.prev, false);
    window.addEventListener('hotkeys:preview:right', this.next, false);
    window.addEventListener('hotkeys:preview:esc', this.handleDestroy, false);
    window.addEventListener('hotkeys:preview:commandI', () => this.handlePanels('details'), false);
    window.addEventListener('hotkeys:preview:commandH', () => this.handlePanels('history'), false);
  };

  stopHotkeyListeners = () => {
    window.removeEventListener('hotkeys:preview:left', this.prev, false);
    window.removeEventListener('hotkeys:preview:right', this.next, false);
    window.removeEventListener('hotkeys:preview:esc', this.handleDestroy, false);
    window.removeEventListener(
      'hotkeys:preview:commandI',
      () => this.handlePanels('details'),
      false,
    );
    window.removeEventListener(
      'hotkeys:preview:commandH',
      () => this.handlePanels('history'),
      false,
    );
  };

  fillRevisionNumberMap = (revisions) => {
    const { revisionsNumbers } = this.state;

    revisions.forEach((item) => {
      if ('id' in item) {
        revisionsNumbers[item.id] = item.revisionNumber;
      }
    });
  };

  isSupportedForDiff = () => {
    const { SUPPORTED_DIFF_FORMATS } = picsioConfig.formats;
    const {
      mimeType, customThumbnail, thumbnailing, isPdf, customVideo,
    } = this.props.asset;
    const { useGdPdfViewer } = picsioConfig.isMainApp() ? this.props.user.settings || {} : window.websiteConfig;

    if (isPdf && !useGdPdfViewer) return true;

    const isSupportedImage = SUPPORTED_DIFF_FORMATS.includes(mimeType)
      || (!!customThumbnail && thumbnailing !== 'waiting' && thumbnailing !== 'running');
    if (isSupportedImage) return true;

    const isSupportedVideo = !!customVideo || (mimeType && mimeType === 'video/mp4');
    if (isSupportedVideo) return true;

    return false;
  };

  fetchData = async (_model) => {
    const model = _model || this.props.asset;

    this.setState({ isLoadedHistoryItemsLoaded: false, dataIsRecieved: true });

    try {
      const [revisions, comments] = await fetchData(model._id, !model.canHaveRevisions);
      const nextMarkerNumber = setMarkersNumber(comments);

      const approvalsIds = [];
      let techComments = [];
      const { revisionsNumbers } = this.state;

      if (revisions.length > 0) {
        normalizeRevisions(revisions);

        this.isLastRevisionTechnical = Boolean(revisions[revisions.length - 1].technical);
        const lastRevision = this.isLastRevisionTechnical && revisions.length > 1 ? revisions[revisions.length - 2] : revisions[revisions.length - 1];
        this.lastRevisionID = lastRevision.id;
        this.lastRevisionNumber = lastRevision.revisionNumber;
        revisions.forEach((item) => {
          item.theSameAs = revisions
            .filter((rev) => rev.md5Checksum === item.md5Checksum)
            .map((rev) => rev.revisionNumber)
            .filter((number) => number !== item.revisionNumber);
        });
      }
      if (!model.canHaveRevisions) {
        this.lastRevisionID = '0';
        this.lastRevisionNumber = 1;
      }

      // generate approvals revisions and comments
      if (model.approvals) {
        this.fillRevisionNumberMap(revisions);
        const modelApprovals = model.approvals.sort((date1, date2) => {
          if (date1.timestamp > date2.timestamp) { return -1; }
          if (date1.timestamp < date2.timestamp) { return 1; }
          return 0;
        });

        if (revisions.length > 0) {
          revisions.forEach((item) => {
            const approvedRevision = modelApprovals.find((approve) => approve.id === item.id);
            if (approvedRevision && approvedRevision.approved) { approvalsIds.push(approvedRevision.id); }
          });
        }

        techComments = model.approvals.map((approve) => makeTechComment(
          approve.approved,
          approve.id,
          approve.initiator,
          approve.timestamp,
          revisionsNumbers[approve.id],
          approve.userAvatar,
          approve.userDisplayName,
        ));
      }

      let historyItems = sortData(revisions.concat(comments).concat(techComments));
      historyItems = historyItems.map((item) => {
        const { userAvatar, uploader } = item;
        if (uploader && uploader.avatar) {
          return { ...item, uploader: { ...uploader, avatar: normalizeUserAvatarSrc(uploader.avatar) } };
        }
        if (userAvatar) {
          return { ...item, userAvatar: normalizeUserAvatarSrc(userAvatar) };
        }
        return item;
      });

      // if first element is not revision
      if (revisions.length === 0) {
        addInitialRevision(historyItems, model.canHaveRevisions);
      } else if (historyItems[0].revisionNumber && historyItems[0].revisionNumber === undefined) {
        addInitialRevision(historyItems);
      }
      const revisionsWithMarkers = setRevisionIdToComment(historyItems);

      const commentsFromHistoryItems = historyItems.filter((i) => !!i.revisionID);
      this.setCommentsWithMarkers(commentsFromHistoryItems, this.lastRevisionID || null);

      this.setState({
        isLoadedHistoryItemsLoaded: true,
        nextMarkerNumber,
        revisionsWithMarkers,
        historyItems,
        isSupportedForDiff: this.isSupportedForDiff(),
        revisionsNumbers,
        approvals: approvalsIds,
        commentsCount: comments.length,
      }, () => {
        if (window.location.hash) {
          this.scrollToElement(window.location.hash.substring(1));
        } else {
          this.scrollToBottom();
        }
      });
    } catch (error) {
      const errorStatus = utils.getStatusFromResponceError(error);
      if (errorStatus === 404) {
        showFileDeletedDialog();
      } else {
        Logger.error(new Error('Can not load revisions or comments'), { error, showDialog: true }, [
          'showWriteToSupportDialog',
          (error && error.message) || 'NoMessage',
        ]);
      }
      this.setState({ isLoadedHistoryItemsLoaded: true });
    }
  };

  scrollToBottom = () => {
    if (this.$list) {
      this.$list.scrollTop = this.$list.scrollHeight;
    }
  };

  /**
   * Generation of Approve/disaprove comment
   * @param {bool} isApproved - approved/disapproved status
   * @param {string} initiatorID - initiator ID
   * @param {string} timestamp - approved/disapproved date
   * @param {bool} isApproveDisabled - block approve when in progress
   * @param {string} revisionID - revision ID
   * @param {bool} highlightNotification - optional add css class for highlight element
   */
   generateApproveComment = (
     isApproved,
     initiatorID,
     timestamp,
     isApproveDisabled,
     revisionID,
     highlightNotification,
   ) => {
     const activeRevisionID = revisionID || this.getActiveRevisionID();
     const { approvals, historyItems, revisionsNumbers } = this.state;

     if (isApproved) {
       if (!approvals.includes(activeRevisionID)) {
         approvals.push(activeRevisionID);
       }
     } else {
       const index = approvals.indexOf(activeRevisionID);
       if (index >= 0) {
         approvals.splice(index, 1);
       }
     }

     this.fillRevisionNumberMap(historyItems);
     historyItems.push(
       makeTechComment(
         isApproved,
         activeRevisionID,
         initiatorID,
         timestamp,
         revisionsNumbers[activeRevisionID],
         false,
         false,
         highlightNotification,
       ),
     );

     const modelApprove = {
       approved: isApproved,
       id: activeRevisionID,
       initiator: initiatorID,
       timestamp,
     };

     this.props.actions.updateApprove(this.props.asset._id, modelApprove);
     this.setState({
       approvals, historyItems, revisionsNumbers, isApproveDisabled,
     }, this.scrollToBottom);
   };

   /**
 * Get id of active revision
 * @returns {string} revision id
 */
  getActiveRevisionID = () => this.state.idActiveState || this.lastRevisionID;

  receiveComment = (notification) => {
    const modelID = this.props.asset._id;
    const { data, initiator } = notification;
    const currentUserID = this.props.user._id;
    // if current user is an initiator
    if (initiator && initiator._id === currentUserID) return;

    // if the comment is for another image
    if (data.asset._id !== modelID) return;

    // if comment already added
    if (this.state.historyItems.some((item) => item._id === data.comment._id)) return;

    const commentToAttach = {
      ...data.comment,
      userDisplayName: data.initiatorName,
      userAvatar: initiator && initiator.avatar && normalizeUserAvatarSrc(initiator.avatar),
      highlightNotification: true,
    };

    commentToAttach.revisionID = this.lastRevisionID;
    const {
      revisionsWithMarkers, historyItems, commentsCount,
    } = this.state;
    let {
      nextMarkerNumber,
    } = this.state;
    const newData = [...historyItems, ...[commentToAttach]];
    if (commentToAttach.markers.length > 0) {
      if (revisionsWithMarkers[this.lastRevisionID] === undefined) revisionsWithMarkers[this.lastRevisionID] = 1;
      else revisionsWithMarkers[this.lastRevisionID] += 1;

      nextMarkerNumber += commentToAttach.markers.length;
    }

    this.addCommentsWithMarkers([commentToAttach]);

    this.setState({
      historyItems: newData, revisionsWithMarkers, nextMarkerNumber, commentsCount: commentsCount + 1,
    },
    this.scrollToBottom);
  };

 // Receive approve/disapprove notifications
 toggleApprove = (notification) => {
   if (this.isDifferentAsset(notification)) return;
   const currentUserID = this.props.user._id;
   const { type, initiator } = notification;

   if (currentUserID !== initiator._id) {
     const isApproved = type === 'asset.revision.approved';
     this.generateApproveComment(
       isApproved,
       initiator._id,
       notification.timestamp,
       false,
       notification.data.revisionId,
       true,
     );
   }
 };

 /**
 * Scroll list to block with id
 * @param {string} id
 */
 scrollToElement = (id) => {
   const $element = document.getElementById(id);
   if (this.$list && $element) {
     /** padding-top of .previewInfobox */
     const panelPaddingTop = 15;
     this.$list.scrollTop = $element.offsetTop - panelPaddingTop;
   } else {
     this.scrollToBottom();
   }
 };

 /**
 * Set active revision
 * @param {string} id - revision id
 * @returns {boolean} success or not
 */
  activateRevision = (id) => {
    this.setActiveRevision(id);
    return true;
  };

isDifferentAsset = (notification) => {
  const url = window.location.pathname;
  const assetId = url.substring(url.lastIndexOf('/') + 1);
  return notification.data.asset._id !== assetId;
};

/**
   * Activate diff
   * @param {string} revisionID
   * @param {number} activeRevisionNumber
   * @param {number} diffRevisionNumber
   */
 activateDiff = (revisionID, activeRevisionNumber, diffRevisionNumber) => {
   Logger.log('User', 'ActivityPanelShowDifference', { revisionID });

   this.setActiveDiff(revisionID, diffRevisionNumber, activeRevisionNumber);
 };

 /**
   * On click on "eye" on comment view
   * @param {number} index - index of comment in historyItems array
   * @param {object} params - params
   */
  toggleActiveComment = (index, params = {}) => {
    const { historyItems } = this.state;

    // if is not comment
    if (historyItems[index]._id === undefined) return;

    // if marker from inactive revision
    if (historyItems[index].revisionID !== this.getActiveRevisionID()) {
      return showDialog({
        title: localization.HISTORY.switchDialogTitle,
        text: localization.HISTORY.switchDialogText,
        textBtnCancel: localization.HISTORY.switchDialogCancel,
        textBtnOk: localization.HISTORY.switchDialogOk,
        onOk: () => {
          const revisionActivated = this.activateRevision(historyItems[index].revisionID);
          if (!revisionActivated) return;

          const prevMarkers = [...[], ...this.props.markers];
          const markers = historyItems[index].markers.map((marker) => ({
            ...marker,
            ...{
              userName: historyItems[index].userDisplayName,
              text: historyItems[index].html || historyItems[index].text,
            },
          }));
          prevMarkers.push({
            id: historyItems[index]._id,
            markers,
          });
          this.toggleMarkers(prevMarkers);
        },
      });
    }

    const markers = historyItems[index].markers.map((marker) => ({
      ...marker,
      ...{
        userName: historyItems[index].userDisplayName,
        text: historyItems[index].html || historyItems[index].text,
        mentions: historyItems[index].mentions,
      },
    }));

    const config = {};
    if (params.isVideo) {
      config.video = {
        videoCurrentTime: historyItems[index].videoCurrentTime,
      };
    }

    this.toggleMarkers(
      [
        {
          id: historyItems[index]._id,
          markers,
        },
      ],
      config,
    );
  };

  /**
   * On click on "eye" on comment view
   * @param {number} index - index of comment in historyItems array
   * @param {object} params - params
   */
   toggleActiveComment = (index, params = {}) => {
     const { historyItems } = this.state;

     // if is not comment
     if (historyItems[index]._id === undefined) return;

     // if marker from inactive revision
     if (historyItems[index].revisionID !== this.getActiveRevisionID()) {
       return showDialog({
         title: localization.HISTORY.switchDialogTitle,
         text: localization.HISTORY.switchDialogText,
         textBtnCancel: localization.HISTORY.switchDialogCancel,
         textBtnOk: localization.HISTORY.switchDialogOk,
         onOk: () => {
           const revisionActivated = this.activateRevision(historyItems[index].revisionID);
           if (!revisionActivated) return;

           const prevMarkers = [...[], ...this.props.markers];
           const markers = historyItems[index].markers.map((marker) => ({
             ...marker,
             ...{
               userName: historyItems[index].userDisplayName,
               text: historyItems[index].html || historyItems[index].text,
             },
           }));
           prevMarkers.push({
             id: historyItems[index]._id,
             markers,
           });
           this.toggleMarkers(prevMarkers);
         },
       });
     }

     const markers = historyItems[index].markers.map((marker) => ({
       ...marker,
       ...{
         userName: historyItems[index].userDisplayName,
         text: historyItems[index].html || historyItems[index].text,
         mentions: historyItems[index].mentions,
       },
     }));

     const config = {};
     if (params.isVideo) {
       config.video = {
         videoCurrentTime: historyItems[index].videoCurrentTime,
       };
     }

     this.toggleMarkers(
       [
         {
           id: historyItems[index]._id,
           markers,
         },
       ],
       config,
     );
   };

   /** Revert revision
   * @param {string} revisionID
   */
  revertRevision = async (revisionID) => {
    const assetId = this.props.asset._id;
    this.setState({ isLoadedHistoryItemsLoaded: false });
    Logger.log('User', 'ActivityPanelRevertRevision');

    let newRevision;
    try {
      newRevision = await assetsApi.revertRevision(assetId, revisionID);
    } catch (err) {
      const _error = err instanceof Error ? err : new Error('Can not revert revision');
      Logger.error(_error, { error: err }, ['RevertRevisionFailed', (err && err.message) || 'NoMessage']);
      showErrorDialog(localization.HISTORY.textErrorRevertRevision);
    }
    if (newRevision) {
      this.props.actions.revertRevision(assetId, revisionID, newRevision.id);
      this.generateAndAddRevertRevisionItem(newRevision, true);
    }
    this.setState({ isLoadedHistoryItemsLoaded: true });
  };

  receiveCommentDeleted = (notification) => {
    if (this.isDifferentAsset(notification)) return;
    const { historyItems } = this.state;
    const deletedCommentIndex = historyItems.findIndex((item) => item._id === notification.data.comment._id);
    if (deletedCommentIndex !== -1) {
      historyItems[deletedCommentIndex].text = localization.HISTORY.textCommentDeleted;
      historyItems[deletedCommentIndex].highlightNotification = true;
      this.setState({ historyItems });
    }
  };

  receiveRevision = (notification) => {
    const modelID = this.props.asset._id;
    const currentUserID = this.props.user._id;
    const { initiator } = notification;

    // if the revision is for another image
    if (notification.data.asset._id !== modelID) return;
    // if initator the same user
    if (currentUserID === initiator._id) return;

    getRevisions(modelID).then((revisions) => {
      const newRevision = revisions[revisions.length - 1];
      newRevision.revisionNumber = this.lastRevisionNumber + 1;
      newRevision.highlightNotification = true;
      if (!this.state.idActiveState) {
        this.activateRevision(this.lastRevisionID);
      }

      this.lastRevisionID = newRevision.id;
      this.isLastRevisionTechnical = false;
      this.lastRevisionNumber = newRevision.revisionNumber;

      this.setState({ historyItems: sortData([...this.state.historyItems, ...[newRevision]]) }, this.scrollToBottom);
    });
  };

  receiveRevertedRevision = (notification) => {
    const newRevision = notification.data.revision;
    const { initiator } = notification;

    if (newRevision) {
      newRevision.uploader = {
        avatar: initiator.avatar,
        displayName: initiator.displayName,
      };

      this.generateAndAddRevertRevisionItem(newRevision, false);
    }
  };

  generateAndAddRevertRevisionItem = (newRevision, activateRevision) => {
    newRevision.revisionNumber = this.lastRevisionNumber + 1;
    newRevision.theSameAs = this.state.historyItems
      .filter((item) => item.md5Checksum === newRevision.md5Checksum)
      .map((rev) => rev.revisionNumber)
      .filter((number) => number !== newRevision.revisionNumber);

    this.lastRevisionID = newRevision.id;
    this.isLastRevisionTechnical = false;
    this.lastRevisionNumber = newRevision.revisionNumber;

    const newHistoryItems = this.state.historyItems.map((item) => {
      if (!item.theSameAs || item.md5Checksum !== newRevision.md5Checksum) return item;
      return { ...item, theSameAs: [...item.theSameAs, newRevision.revisionNumber] };
    });

    this.setState({ historyItems: sortData([...newHistoryItems, newRevision]) }, () => {
      if (activateRevision) this.activateRevision(this.lastRevisionID);
      this.scrollToBottom();
    });
  };

  /** Toggle markers for revision
   * @param {string} revisionID
   */
     toggleRevisionComments = (revisionID) => {
       const { revisionsWithMarkers } = this.state;
       const numberOfComments = revisionsWithMarkers[revisionID];
       const numberActiveComments = this.state.markers.length;

       /**
       * Set markers for revision
       * @param {boolean} removePrev - remove previous markers, for switch revision
       */
       const setMarkers = (removePrev) => {
         const markers = removePrev ? [...[], ...this.state.markers] : [];
         this.state.historyItems.forEach((item) => {
           // if comment and comment for this revision and not already open and has markers
           if (
             item._id !== undefined
            && item.revisionID === revisionID
            && !this.state.markers.some((marker) => marker.id === item._id)
            && item.markers.length > 0
           ) {
             const newMarkers = item.markers.map((marker) => ({
               ...marker,
               ...{
                 userName: item.userDisplayName,
                 text: item.html || item.text,
                 mentions: item.mentions,
               },
             }));
             markers.push({
               id: item._id,
               markers: newMarkers,
             });
           }
         });
         this.toggleMarkers(markers);
       };

       // if revision is not active
       if (revisionID !== this.getActiveRevisionID()) {
         return showDialog({
           title: localization.HISTORY.switchDialogTitle,
           text: localization.HISTORY.switchDialogText,
           textBtnCancel: localization.HISTORY.switchDialogCancel,
           textBtnOk: localization.HISTORY.switchDialogOk,
           onOk: () => {
             const revisionActivated = this.activateRevision(revisionID);
             if (!revisionActivated) return;

             setMarkers(true);
           },
         });
       }

       if (numberOfComments > numberActiveComments) setMarkers();
       else this.toggleMarkers(this.state.markers);
     };

  /**
   * @param {Object} historyItems
   * @param {string} historyItems.text
   * @param {Array} [historyItems.markers]
   * @param {string} [historyItems.proofingGuestName]
   * @param {Array} mentions
   */
  addComment = (historyItems, mentions = []) => {
    const { replyTo } = this.state;
    const { proofingGuestName } = historyItems;
    const data = replyTo ? { ...historyItems, replyTo: replyTo._id } : historyItems;

    this.cancelReply();

    addComment(this.props.asset._id, data).then((comment) => {
      if (comment) {
        Logger.log('User', 'ActivityPanelCommentAdd', { assetId: this.props.asset._id });

        // convert marker numbers from String to Number
        comment.markers.forEach((marker) => {
          marker.number = Number(marker.number);
        });
        // add userName
        comment.userDisplayName = this.props.user.displayName || proofingGuestName;
        // add avatar
        comment.userAvatar = this.props.user.avatar;
        // add user ID
        comment.userId = this.props.user._id;
        // add revision id
        comment.revisionID = this.lastRevisionID;
        comment.mentions = mentions;

        const { historyItems, commentsCount } = this.state;
        if (comment.text !== '') {
          historyItems.push(comment);
          let { nextMarkerNumber, revisionsWithMarkers } = this.state;
          if (comment.markers.length > 0) {
            if (revisionsWithMarkers[this.lastRevisionID] === undefined) revisionsWithMarkers[this.lastRevisionID] = 1;
            else revisionsWithMarkers[this.lastRevisionID] += 1;

            nextMarkerNumber += comment.markers.length;
          }

          this.addCommentsWithMarkers([comment]);

          this.setState({
            historyItems,
            nextMarkerNumber,
            revisionsWithMarkers,
            commentsCount: commentsCount + 1,
          },
          () => {
            this.clearTmpMarkers();
            if (comment.markers.length > 0) {
              this.toggleActiveComment(historyItems.length - 1);
            }
            this.scrollToBottom();
          });
          this.props.actions.attachCommentToAsset(comment, this.props.asset._id);
        }
      }
    });
  };

  onCommentRemove = async (commentId) => {
    this.setState({ isLoadedHistoryItemsLoaded: false });

    try {
      await removeComment(this.props.asset._id, commentId);

      this.removeCommentMarkers(commentId);
    } catch (err) {
      const _error = err instanceof Error ? err : new Error('Can not remove comment');
      Logger.error(_error, { error: err }, ['CommentRemoveFailed', (err && err.message) || 'NoMessage']);
      showDialog({
        title: localization.HISTORY.titleDialogError,
        text: localization.HISTORY.textErrorDeletingComment,
        textBtnCancel: null,
      });
      this.setState({ isLoadedHistoryItemsLoaded: true });
      return;
    }

    Logger.log('User', 'ActivityPanelCommentRemove');

    const { historyItems, commentsCount } = this.state;

    remove(historyItems, (item) => item._id === commentId);

    this.setState({
      historyItems,
      commentsCount: commentsCount - 1,
      isLoadedHistoryItemsLoaded: true,
    });
  };

  changeApprove = (value) => {
    const activeRevisionID = this.getActiveRevisionID();
    const url = window.location.pathname;
    const assetId = url.substring(url.lastIndexOf('/') + 1);
    Logger.log('User', 'ActivityPanelApprove', { assetId, activeRevisionID, value });

    if (value) {
      this.approve(assetId, activeRevisionID);
    } else {
      this.disapprove(assetId, activeRevisionID);
    }
  };

  approve = async (assetId, activeRevisionID) => {
    let { isApproveDisabled } = this.state;
    const timestamp = dayjs().format();

    this.setState({ isApproveDisabled: true });
    isApproveDisabled = false;

    try {
      await assetsApi.approveRevision(assetId, activeRevisionID);
      this.generateApproveComment(true, this.props.user._id, timestamp, isApproveDisabled);
    } catch (err) {
      this.setState({ isApproveDisabled });
      const errorStatus = utils.getStatusFromResponceError(err);
      Logger.error(new Error('Can not approve revision'), { error: err }, [
        'ApproveRevisionFailed',
        (err && err.message) || 'NoMessage',
      ]);
      return showDialog({
        title: localization.HISTORY.titleDialogError,
        text: errorStatus === 403 ? localization.NO_PERMISSION_TO_ACCESS : localization.ERROR_UPDATING_ASSET,
        textBtnOk: localization.DIALOGS.btnOk,
        textBtnCancel: null,
      });
    }
  };

  disapprove = async (assetId, activeRevisionID) => {
    let { isApproveDisabled } = this.state;
    const timestamp = dayjs().format();

    this.setState({ isApproveDisabled: true });
    isApproveDisabled = false;

    try {
      await assetsApi.disApproveRevision(assetId, activeRevisionID);
      this.generateApproveComment(false, this.props.user._id, timestamp, isApproveDisabled);
    } catch (err) {
      this.setState({ isApproveDisabled });
      Logger.error(new Error('Can not disapprove revision'), { error: err }, [
        'DisapproveRevisionFailed',
        (err && err.message) || 'NoMessage',
      ]);
      showDialog({
        title: localization.HISTORY.titleDialogError,
        text: localization.ERROR_UPDATING_ASSET,
        textBtnOk: localization.DIALOGS.btnOk,
        textBtnCancel: null,
      });
    }
  };

  receiveReaction = (notification) => {
    const currentGuestName = utils.getGuestName();
    const {
      user: { _id },
    } = this.props;
    const { commentId, initiatorName, reaction } = notification.data;
    const { userId, guestName } = reaction;

    if ((userId && _id !== userId) || (guestName && guestName !== currentGuestName)) {
      this.updateCommentReactions(commentId, { ...reaction, displayName: initiatorName || guestName });
    }
  };

  updateCommentReactions = (commenId, reaction) => {
    const { historyItems } = this.state;
    const { userId, value, guestName } = reaction;

    const validation = (item) => {
      if (guestName) {
        return item.value === value && item.guestName === guestName;
      }
      return item.value === value && item.userId === userId;
    };
    const updatedItems = historyItems.map((item) => {
      const { _id, reactions = [] } = item;

      if (_id === commenId) {
        const isExist = reactions.find(validation);
        const updatedReactions = isExist ? reactions.filter((i) => !validation(i)) : [...reactions, reaction];

        return {
          ...item,
          reactions: updatedReactions,
        };
      }
      return item;
    });

    this.setState({ historyItems: updatedItems });
  };

  addReaction = async (commentId, emojiName) => {
    const guestName = utils.getGuestName();
    const {
      user: { _id: userId, displayName },
      asset: { _id: assetId },
    } = this.props;

    try {
      await addReactionToComment(assetId, commentId, userId, emojiName, guestName);

      this.updateCommentReactions(commentId, {
        userId,
        displayName: displayName || guestName,
        value: emojiName,
        guestName,
      });

      Logger.log('User', 'ActivityPanelAddReaction', {
        assetId, commentId, userId, guestName,
      });
    } catch (err) {
      console.log(err);
      Logger.log('User', 'ActivityPanelAdddeactionFailed', {
        assetId, commentId, userId, guestName,
      });

      showDialog({
        title: localization.HISTORY.titleDialogError,
        text: localization.ERROR_ADD_REACTION,
        textBtnOk: localization.DIALOGS.btnOk,
        textBtnCancel: null,
      });
    }
  };

  handleEyeClick = (index) => {
    this.toggleActiveComment(index, { isVideo: !!this.getElVideo() });
  };

  cancelReply = () => {
    this.setState({ replyTo: null });
  };

  addReply = (comment) => {
    this.setState({ replyTo: comment });
  };

  subscribe = () => {
    PubSubService.subscribe('asset.comment.added', this.receiveComment);
    PubSubService.subscribe('asset.comment.deleted', this.receiveCommentDeleted);
    PubSubService.subscribe('asset.comment.reaction.changed', this.receiveReaction);
    PubSubService.subscribe('asset.revision.created', this.receiveRevision);
    PubSubService.subscribe('asset.revision.approved', this.toggleApprove);
    PubSubService.subscribe('asset.revision.disapproved', this.toggleApprove);
    PubSubService.subscribe('asset.revision.reverted', this.receiveRevertedRevision);
  };

  unsubscribe = () => {
    PubSubService.unsubscribe('asset.comment.added', this.receiveComment);
    PubSubService.unsubscribe('asset.comment.deleted', this.receiveCommentDeleted);
    PubSubService.unsubscribe('asset.comment.reaction.changed', this.receiveReaction);
    PubSubService.unsubscribe('asset.revision.created', this.receiveRevision);
    PubSubService.unsubscribe('asset.revision.approved', this.toggleApprove);
    PubSubService.unsubscribe('asset.revision.disapproved', this.toggleApprove);
    PubSubService.unsubscribe('asset.revision.reverted', this.receiveRevertedRevision);
  };

  preloadNeighbors = () => {
    const preloadRadius = 2;
    const { assetIndex } = this.props;
    let start = assetIndex - preloadRadius;
    start = start > 0 ? start : 0;
    const end = assetIndex + preloadRadius;
    const range = this.props.assetsStore.items.slice(start, end);
    range.forEach(async (asset) => {
      const size = this.props.user.previewThumbnailSize || 'default';
      if (asset.thumbnail && asset.thumbnail[size]) {
        try {
          await preloadImage(asset.thumbnail[size]);
        } catch (err) {
          Logger.info('[PREVIEW] Cannot preload neighbor');
        }
      }
    });
  };

  downloadRaw = async () => {
    try {
      if (!picsioConfig.isMainApp()) {
        await checkDownloadConsent();
      }
    } catch (err) {
      // user click Cancel on Dialog
      return;
    }

    showDownloadDialog([this.props.id]);
  };

  addRevision = async (file) => {
    this.setState({ revisionIsUploading: true });
    await revisionUploader(file, this.props.asset);
    this.stopSpinner();
    this.setState({ revisionIsUploading: false });
  };

  handlePanels(panel) {
    const { showHistory, showDetails, analyticsIsOpened } = this.state;
    const isHistoryAcivate = panel === 'history' && !showHistory;
    const isDetailsAcivate = panel === 'details' && !showDetails;
    const isAnalyticsAcivate = panel === 'analytics' && !analyticsIsOpened;

    const getStatus = (status) => (status ? 'Show' : 'Hide');

    switch (panel) {
    case 'history': {
      sendEventToIntercom('Activity panel opened');
      Logger.log('User', `ActivityPanel${getStatus(isHistoryAcivate)}`);
      break;
    }
    case 'details': {
      Logger.log('User', `InfoPanel${getStatus(isDetailsAcivate)}`);
      break;
    }
    case 'analytics': {
      sendEventToIntercom('Asset analytics opened');
      Logger.log('User', `AnalyticsPanel${getStatus(isAnalyticsAcivate)}`);
      break;
    }
    default:
      return true;
    }

    this.setState({
      showHistory: isHistoryAcivate,
      showDetails: isDetailsAcivate,
      analyticsIsOpened: isAnalyticsAcivate,
    });

    utils.LocalStorage.set('picsio.historypanelOpened', isHistoryAcivate);
    utils.LocalStorage.set('picsio.infopanelOpened', isDetailsAcivate);
    utils.LocalStorage.set('picsio.analyticsIsOpened', isAnalyticsAcivate);

    window.dispatchEvent(new Event('preview:ui:resize'));
  }

  /**
   * On show revision
   * @param {String} id
   */
  setActiveRevision = (id) => {
    this.setState({
      idActiveState: id,
      idDiffState: null,
      markers: [],
      tmpMarkers: [],
    });
  };

  /**
   * Activate/deactivate diff view
   * @param {String} id - diff id
   * @param {Number} activeRevisionNumber
   * @param {Number} diffRevisionNumber
   */
  setActiveDiff = (id, activeRevisionNumber, diffRevisionNumber) => {
    if (this.props.asset.pages) {
      this.props.actions.getPages([this.props.asset._id], id);
    }
    // hide diff
    if (this.state.idDiffState === id) {
      this.setState({
        idDiffState: null,
        activeRevisionNumber: null,
        diffRevisionNumber: null,
      });
    } else {
      // show diff
      this.setState({
        idDiffState: id,
        activeRevisionNumber,
        diffRevisionNumber,
      });
    }
  };

  /**
   * Show spinner
   * @param {String} text
   */
  runSpinner = (text) => {
    this.setState({ spinnerText: text });
  };

  /**
   * Hide spinner
   * @param {Object} newState
   */
  stopSpinner = (newState = {}) => {
    this.setState({ ...newState, spinnerText: '' });
  };

  handleDestroy = () => {
    Logger.log('User', 'PreviewHide');
    this.props.actions.removeTmpItems();
    back('/search');
  };

  moveToTrash = () => {
    if (this.props.asset.inbox) {
      this.props.actions.deleteAssets([this.props.id], true);
    } else {
      this.props.actions.trashAssets([this.props.id]);
    }
  };

  restoreFromTrash = () => {
    Logger.log('User', 'PreviewRestoreFromTrash', { assetId: this.props.id });
    this.runSpinner(localization.SPINNERS.LOADING);
    this.props.actions.restoreAssets([this.props.id]);
  };

  removeFromLightboard = () => {
    this.props.actions.removeFromLightboard(this.props.asset.lightboards[0], [
      this.props.asset._id,
    ]);
  };

  deleteNotFoundFile = () => {
    this.props.actions.removeNotFoundAssets([this.props.id]);

    if (this.props.next) return this.props.next();
    if (this.props.prev) return this.props.prev();
    return this.handleDestroy();
  };

  openEditor = () => {
    const { asset } = this.props;
    if (!asset) return;
    const extension = asset.fileExtension && asset.fileExtension.toLowerCase();
    Logger.log('User', 'PreviewEdit', extension || asset.mimeType);

    if (asset.isGoogleDriveDocument) {
      utils.openDocument(asset.storageId, asset.mimeType);
    } else if (asset.isEditableInPicsioEditor) {
      if (ua.browser.family === 'Safari') {
        Logger.log('UI', 'EditingNotSupportedInSafariDialog');
        showDialog({
          title: 'Error',
          text: localization.PREVIEW_VIEW.editingNotSupportedInSafari,
          textBtnOk: null,
          textBtnCancel: localization.DIALOGS.btnOk,
        });
      } else {
        navigate(`/develop/${this.props.id}`);
      }
    } else {
      Logger.log('UI', 'EditingNotSupportedDialog');
      showErrorDialog(localization.PREVIEW_VIEW.editingNotSupported);
    }
  };

  /**
   * Drag enter
   * @param {MouseEvent} event
   */
  onDragEnter = (event) => {
    if (!event.dataTransfer) return;

    event.preventDefault();
    event.stopPropagation();

    if (!this.props.asset.canUploadRevisions) return;
    if (picsioConfig.isMainApp() && !this.props.asset.permissions.upload) return;
    if (picsioConfig.isMainApp() && !this.props.user.subscriptionFeatures?.revisions) return;

    const fileType = event.dataTransfer.types[0];
    const isChromeDataTransferTypes = fileType === 'Files';
    const isMozDataTransferTypes = fileType === 'application/x-moz-file';
    const isSafariDataTransferTypes = fileType === 'public.file-url';

    if (isChromeDataTransferTypes || isMozDataTransferTypes || isSafariDataTransferTypes) {
      this.setState({ showDropArea: true });
    }
  };

  /**
   * Drag over
   * @param {MouseEvent} event
   */
  onDragOver(event) {
    event.preventDefault();
  }

  /**
   * Drop file
   * @param {MouseEvent} event
   */
  onDropFile = (event) => {
    event.preventDefault();
    event.stopPropagation();

    this.setState({ showDropArea: false });

    if (!this.props.asset.canUploadRevisions) return;
    if (picsioConfig.isMainApp() && !this.props.asset.permissions.upload) return;

    const { files } = event.dataTransfer;

    if (files.length > 1) {
      window.dispatchEvent(
        new CustomEvent('softError', {
          detail: {
            data: {
              message: localization.PREVIEW_VIEW.errorFilesCount,
            },
          },
        }),
      );
      return;
    }

    this.addRevision(files[0]);
  };

  /**
   * Toggle markers from history
   * @param {Array} markersToSet
   * @param {Object} params
   */
  toggleMarkers = (markersToSet, params = {}) => {
    let markers = [...this.state.markers];

    if (params.video) {
      this.videoPlayer.current.$player.current.setCurrentTime(params.video.videoCurrentTime, { pause: true });
      markers = markers.filter((marker) => {
        // remove other markers. because we cann't show few comments at the same time
        if (!markersToSet.some((item) => item.id === marker.id)) return false;
        return true;
      });
    }

    markersToSet.forEach((markersObj) => {
      const existsIndex = markers.findIndex((marker) => marker.id === markersObj.id);
      if (existsIndex > -1) {
        markers.splice(existsIndex, 1);
      } else {
        markers.push(markersObj);
      }
    });

    this.setState({ markers });
  };

  /**
   * Set to true listen to add marker
   * @param {number} nextMarkerNumber
   */
  setListenerToAddMarker = (nextMarkerNumber) => {
    this.setState({
      nextMarkerNumber,
      listenToAddMarker: true,
    });
  };

  /**
   * Add temporary marker
   * @param {Object} marker - data for marker
   */
  addTmpMarker = (marker) => {
    if (marker === null) {
      return this.setState({ listenToAddMarker: false });
    }

    const tmpMarkers = [...this.state.tmpMarkers];
    marker.number = this.state.nextMarkerNumber + tmpMarkers.length;
    tmpMarkers.push(marker);
    this.setState({ tmpMarkers, listenToAddMarker: false });
  };

  modifyTmpMarkers = (tmpMarkers) => this.setState({ tmpMarkers });

  /**
   * Remove temporary marker by index
   * @param {number} index
   */
  removeTmpMarker = (index) => {
    const tmpMarkers = [...this.state.tmpMarkers];
    if (tmpMarkers[index]) {
      tmpMarkers.splice(index, 1);

      /* normalize numbers */
      if (tmpMarkers.length - 1 >= index) {
        for (let i = index; i < tmpMarkers.length; i++) {
          tmpMarkers[i].number -= 1;
        }
      }
      this.setState({ tmpMarkers });
    }
  };

  clearTmpMarkers = () => this.setState({ tmpMarkers: [] });

  /**
   * Download revision
   * @param {string} revisionID
   * @param {string} fileName
   */
  downloadRevision = async (revisionID, fileName) => {
    const { asset } = this.props;
    if (ua.browser.isOldSafari() && !ua.browser.isNotDesktop()) {
      showDownloadDialog([asset]);
      return;
    }

    this.runSpinner('Downloading revision ...');
    if (picsioConfig.isMainApp()) {
      if (asset.watermarkId) {
        const data = {
          ids: [asset._id],
          revisionsIds: { [asset._id]: revisionID },
          isArchive: Boolean(asset.archived),
          mimeType: 'original',
          organizeByCollections: false,
          user: asset.user,
          withoutWatermark: false,
        };
        try {
          downloadAssetWithWatermark(data, asset.dataStorage, [asset], revisionID);
        } catch (err) {
          Logger.error(new Error('Error download revision with watermark', { error: err }));
        }
      } else {
        try {
          downloadAsset(asset._id, fileName, revisionID);
        } catch (err) {
          Logger.error(new Error('Error download revision', { error: err }));
        }
      }
    } else if (asset.watermarkId) {
      const data = {
        ids: [asset._id],
        revisionsIds: { [asset._id]: revisionID },
        isArchive: Boolean(asset.archived),
        mimeType: 'original',
        organizeByCollections: false,
        user: asset.user,
        withoutWatermark: false,
      };
      try {
        downloadAssetWithWatermark(data, asset.dataStorage, [asset], revisionID);
      } catch (err) {
        Logger.error(new Error('Error download revision with watermark', { error: err }));
      }
    } else {
      try {
        const url = await getDownloadUrl({
          assetId: asset._id,
          revisionId: revisionID,
          allowDownloadByGS: false,
        });
        const blob = await downloadFile(url).promise;
        utils.saveFile(blob, fileName);
      } catch (err) {
        Logger.error(new Error('Error download revision on the website', { error: err }));
      }
    }
    this.stopSpinner();

    sendDownloadedNotification([asset]);
  };

  setVideoCurrentTime = (time) => {
    this.setState({ markers: [] });
    if (
      this.videoPlayer
      && this.videoPlayer.current
      && this.videoPlayer.current.$player
      && this.videoPlayer.current.$player.current
    ) {
      this.videoPlayer.current.$player.current.setCurrentTime(time, { pause: true });
    }
  };

  getElVideo = () => this.videoPlayer.current
    && this.videoPlayer.current.$player.current
    && this.videoPlayer.current.$player.current.$video.current;

  addCommentsWithMarkers = (comments) => {
    const commentsWithMarkers = comments.filter((item) => item.videoCurrentTime !== undefined);

    this.setState({
      commentsWithMarkers: [...(this.state.commentsWithMarkers || []), ...commentsWithMarkers],
    });
  };

  setCommentsWithMarkers = (comments, headRevisionId) => {
    const commentsWithMarkers = comments.filter((item) => item.videoCurrentTime !== undefined);

    this.setState({ commentsWithMarkers, headRevisionId });
  };

  handleLoadedVideo = () => {
    const elVideo = this.getElVideo();
    if (elVideo) elVideo.addEventListener('play', () => this.setState({ markers: [] }));
  };

  prev = () => {
    Logger.log('User', 'PreviewPrev');
    const { assetsStore, assetIndex } = this.props;
    if (assetIndex < 1) return;

    const prevAssetId = assetsStore.items[assetIndex - 1]._id;
    navigate(`/preview/${prevAssetId}`);
  };

  next = () => {
    Logger.log('User', 'PreviewNext');
    const { assetsStore, assetIndex, actions } = this.props;

    /** if we on the 4th asset to the end of the loaded assets and store is not full -> load next page */
    if (assetIndex > assetsStore.items.length - 5 && !assetsStore.full && assetsStore.isLoaded) {
      actions.getAssets();
    }

    /** if we on the last asset -> do nothing */
    if (assetIndex >= assetsStore.items.length - 1) return;

    const nextAssetId = assetsStore.items[assetIndex + 1]._id;
    navigate(`/preview/${nextAssetId}`);
  };

  hideDropArea = () => this.state.showDropArea && this.setState({ showDropArea: false });

  isMarkersDisabled = () => {
    const { state, props } = this;
    const { asset } = props;
    const { useGdPdfViewer } = picsioConfig.isMainApp()
      ? this.props.user.settings || {}
      : window.websiteConfig;
    return (
      (state.isThumbnailing && !asset.isVideo)
      || asset.isAudio
      || asset.isObj
      || asset.isGoogleDriveDocument
      || (asset.isPdf && useGdPdfViewer)
    );
  };

  removeCommentMarkers = (commenId) => {
    this.setState(({ markers }) => ({
      markers: markers.filter(({ id }) => id !== commenId),
    }));
  };

  handleHistorySwipeRight = (eventData) => {
    const { absX, dir } = eventData;
    if (absX > 70 && dir === 'Right') {
      this.handlePanels('history');
    }
  };

  handleDetailsSwipeRight = (eventData) => {
    const { absX, dir } = eventData;
    if (absX > 70 && dir === 'Right') {
      this.handlePanels('details');
    }
  };

  handleAssetSwipeLeft = (eventData) => {
    const { assetScale } = this.props;
    const { absX, dir, velocity } = eventData;
    if (absX > 70 && dir === 'Left' && velocity > 0.7 && assetScale <= 1) {
      this.next();
    }
  };

  handleAssetSwipeRight = (eventData) => {
    const { assetScale } = this.props;
    const { absX, dir, velocity } = eventData;
    if (absX > 70 && dir === 'Right' && velocity > 0.7 && assetScale <= 1) {
      this.prev();
    }
  };

  setCommentTimeRange = (arg) => {
    this.setState({ commentTimeRange: arg });
  };

  setAttachTime = (arg) => {
    if (arg) {
      this.setState({ isCheckedAttachTime: arg });
    } else {
      this.setState(({ isCheckedAttachTime }) => ({
        isCheckedAttachTime: !isCheckedAttachTime,
      }));
    }
  }

  render() {
    const { props, state } = this;
    const { asset, user } = props;
    const isNotSupportedVideo = asset && asset.isVideo && !asset.isSupportedVideo;
    const showPlaceholder = asset
      && !asset.is3DModel
      && !asset.isVideo
      && !asset.isAudio
      && !asset.isPdf
      && (state.isThumbnailing
        || asset.thumbnail === null
        || (asset.thumbnail && asset.thumbnail.error));
    let isThumbnailingSkipped = false;
    if (
      showPlaceholder
      && asset.thumbnailing === 'skipped'
      && asset.thumbnailingReason
      && asset.thumbnailingReason.includes('BY_ACCOUNT_PLAN_LIMITS')
    ) {
      isThumbnailingSkipped = true;
    }
    const showPrevArrow = props.assetIndex > 0;
    const showNextArrow = props.assetIndex > -1
      && !props.assetsStore.tmpItemIDs.includes(this.props.id)
      && props.assetIndex < props.assetsStore.items.length - 1;
    if (!asset) return <Spinner title={state.spinnerText || localization.SPINNERS.LOADING} />;
    const isAssetFromInbox = Boolean(asset.inbox);
    const { analyticsIsOpened } = state;
    const isRestricted = utils.isAssetRestricted(asset.restrictSettings);
    const rolePermissions = (picsioConfig.isMainApp() && props.user.role.permissions) || {};
    const isDownloadArchiveAllowed = checkUserAccess('subscriptions', 'archive') && checkUserAccess('permissions', 'downloadArchive');
    const downloadSinglAssetShared = picsioConfig.isSingleApp() && picsioConfig.access.download;
    return (
      <div
        className="preview"
        onDragEnter={this.onDragEnter}
        onDragOver={this.onDragOver}
        onMouseLeave={this.hideDropArea}
      >
        {asset && asset.pages && !asset.isPdf && !state.isThumbnailing ? null : (
          <ToolbarPreviewTop
            setActive={this.activateRevision}
            isRevisionUploading={state.revisionIsUploading}
            isSupportedForDiff={state.isSupportedForDiff}
            activeRevisionID={this.getActiveRevisionID}
            lastRevisionNumber={this.lastRevisionNumber}
            addRevision={this.addRevision}
            isAllowedUploadingRevision={state.isAllowedUploadingRevision}
            subscriptionFeatures={user?.subscriptionFeatures}
            showRevisions={shouldRenderRevisionsDropdown()}
            isDownloadable={
              state.isAllowedDownloading
              && (!isRestricted || (isRestricted && rolePermissions.restrictedDownload))
              && (asset.archived ? isDownloadArchiveAllowed : true)
            }
            historyItems={state.historyItems}
            assetName={asset ? asset.name : localization.SPINNERS.LOADING}
            assetId={asset._id}
            onClose={picsioConfig.isSingleApp() ? null : this.handleDestroy}
            download={
              !picsioConfig.isMainApp()
              && (picsioConfig.isProofing() ? picsioConfig.access.downloadSingleFile : downloadSinglAssetShared)
              && asset.isDownloadable && {
                handler: this.downloadRaw,
              }
            }
            analytics={{
              handler: () => this.handlePanels('analytics'),
              isActive: this.state.analyticsIsOpened,
            }}
            historyPanel={
              isHistoryPanelEnabled()
              && asset.hasAccess
              && !asset.trashed && {
                handler: () => this.handlePanels('history'),
                isActive: state.showHistory,
              }
            }
            details={
              isActivityPanelEnabled()
              && asset.hasAccess
              && !asset.trashed && {
                handler: () => this.handlePanels('details'),
                isActive: state.showDetails,
              }
            }
          />
        )}

        <div
          className={cn('previewInfobox wrapperDetailsPanel', {
            openDetails: state.showHistory || state.openDetails,
          })}
        >
          {asset.hasAccess && state.showDetails && !asset.trashed && (
            <Swipeable
              className="SwipeableDetails"
              onSwipedRight={
                state.showDetails ? (event) => this.handleDetailsSwipeRight(event) : () => {}
              }
            >
              <div className="previewInfoboxDetails">
                <Details
                  assets={[asset]}
                  assetsIds={[props.id]}
                  total={1}
                  actions={props.actions}
                  mainActions={props.mainActions}
                  userActions={props.userActions}
                  inProgress={props.assetsStore.inProgress}
                  panelName="previewView.right"
                  textareaHeightNameLS="picsio.detailsDescriptionHeight"
                  panelWidth={props.panelWidth}
                  error={props.assetsStore.error}
                  user={props.user}
                  isRemoveForever={isAssetFromInbox}
                />
              </div>
            </Swipeable>
          )}
          {asset.hasAccess && state.showHistory && !asset.trashed && (
            <Swipeable
              className="SwipeableHistory"
              onSwipedRight={
                state.showHistory ? (event) => this.handleHistorySwipeRight(event) : () => {}
              }
            >
              <div className="previewInfoboxHistory">
                <History
                  lastRevisionID={this.lastRevisionID}
                  lastRevisionNumber={this.lastRevisionNumber}
                  isLastRevisionTechnical={this.isLastRevisionTechnical}
                  model={asset}
                  isLoaded={state.isLoadedHistoryItemsLoaded}
                  historyItems={state.historyItems}
                  nextMarkerNumber={state.nextMarkerNumber}
                  revisionsWithMarkers={state.revisionsWithMarkers}
                  isSupportedForDiff={state.isSupportedForDiff}
                  approvals={state.approvals}
                  isApproveDisabled={state.isApproveDisabled}
                  commentsCount={state.commentsCount}
                  replyTo={state.replyTo}
                  historyActions={state.historyActions}
                  activeID={state.idActiveState}
                  diffID={state.idDiffState}
                  markers={state.markers}
                  tmpMarkers={state.tmpMarkers}
                  setActiveDiff={this.setActiveDiff}
                  onClickAddMarker={this.setListenerToAddMarker}
                  toggleMarkers={this.toggleMarkers}
                  clearTmpMarkers={this.clearTmpMarkers}
                  downloadRevision={this.downloadRevision}
                  markersDisabled={this.isMarkersDisabled()}
                  updateModelApprove={props.actions.updateApprove}
                  addCommentsWithMarkers={this.addCommentsWithMarkers}
                  setCommentsWithMarkers={this.setCommentsWithMarkers}
                  getElVideo={this.getElVideo}
                  isVideo={asset.isVideo}
                  setVideoCurrentTime={this.setVideoCurrentTime}
                  isDownloadable={state.isAllowedDownloading}
                  user={props.user}
                  removeCommentMarkers={this.removeCommentMarkers}
                  commentTimeRange={this.state.commentTimeRange}
                  isCheckedAttachTime={this.state.isCheckedAttachTime}
                  setAttachTime={this.setAttachTime}
                  setCommentTimeRange={this.setCommentTimeRange}
                />
              </div>
            </Swipeable>
          )}
        </div>
        <div className="wrapperGallery">
          {/* Screen with analytics START */}
          {analyticsIsOpened && <AssetAnalyticsScreen asset={asset} />}
          {/* Screen with analytics END */}

          {/* Media file */}
          {asset && (
            <Swipeable
              className="SwipeableAsset"
              onSwipedLeft={showNextArrow ? (event) => this.handleAssetSwipeLeft(event) : () => {}}
              onSwipedRight={
                showPrevArrow ? (event) => this.handleAssetSwipeRight(event) : () => {}
              }
            >
              <div className="containerMediaFile">
                {/* thumbnailing */}
                {showPlaceholder || !asset.hasAccess || isNotSupportedVideo ? (
                  <ErrorBoundary className="errorBoundaryComponent">
                    <Placeholder
                      model={asset}
                      thumbnailingError={
                        (asset.isEmpty && { code: 204 })
                        || (isNotSupportedVideo && { code: 205 })
                        || (asset.thumbnail && asset.thumbnail.error)
                      }
                      isThumbnailing={state.isThumbnailing}
                      deleteNotFoundFile={this.deleteNotFoundFile}
                      removeFromLightboard={this.removeFromLightboard}
                      openEditor={this.openEditor}
                      addRevision={state.isAllowedUploadingRevision && this.addRevision}
                      handleDownload={state.isAllowedDownloading && this.downloadRaw}
                      moveToTrash={state.isAllowedDeleting && this.moveToTrash}
                      isRemoveForever={isAssetFromInbox}
                      isSkipped={isThumbnailingSkipped}
                    />
                  </ErrorBoundary>
                ) : asset.isVideo ? (
                  <ErrorBoundary className="errorBoundaryComponent">
                    <Video
                      ref={this.videoPlayer}
                      model={asset}
                      revisionID={state.idActiveState}
                      diffID={state.idDiffState}
                      activeRevisionNumber={state.activeRevisionNumber}
                      diffRevisionNumber={state.diffRevisionNumber}
                      listenToClick={state.listenToAddMarker}
                      addMarker={this.addTmpMarker}
                      markers={state.markers}
                      tmpMarkers={state.tmpMarkers}
                      removeMarker={this.removeTmpMarker}
                      modifyTmpMarkers={this.modifyTmpMarkers}
                      commentsWithMarkers={state.commentsWithMarkers}
                      toggleMarkers={this.toggleMarkers}
                      headRevisionId={state.headRevisionId}
                      handleLoadedVideo={this.handleLoadedVideo}
                      addRevision={state.isAllowedUploadingRevision && this.addRevision}
                      handleDownload={state.isAllowedDownloading && this.downloadRaw}
                      moveToTrash={state.isAllowedDeleting && this.moveToTrash}
                      setCustomThumbnail={props.actions.setCustomThumbnail}
                      subscriptionFeatures={props.user.subscriptionFeatures}
                      teamId={picsioConfig.isMainApp() ? props.user.team._id : undefined}
                      isRemoveForever={isAssetFromInbox}
                      setCommentTimeRange={this.setCommentTimeRange}
                      isCheckedAttachTime={this.state.isCheckedAttachTime}
                      commentsRange={this.state.commentTimeRange}
                    />
                  </ErrorBoundary>
                ) : asset.isPdf ? (
                  <ErrorBoundary className="errorBoundaryComponent">
                    <Pdf
                      userSettings={props.user.settings}
                      asset={asset}
                      revisionID={state.idActiveState}
                      diffID={state.idDiffState}
                      markers={state.markers}
                      tmpMarkers={state.tmpMarkers}
                      activeRevisionNumber={state.activeRevisionNumber}
                      diffRevisionNumber={state.diffRevisionNumber}
                      addMarker={this.addTmpMarker}
                      removeMarker={this.removeTmpMarker}
                      listenToClick={state.listenToAddMarker}
                      modifyTmpMarkers={this.modifyTmpMarkers}
                      addRevision={state.isAllowedUploadingRevision && this.addRevision}
                      openEditor={this.openEditor}
                      handleDownload={state.isAllowedDownloading && this.downloadRaw}
                      moveToTrash={state.isAllowedDeleting && this.moveToTrash}
                      assetName={asset ? asset.name : localization.SPINNERS.LOADING}
                      close={this.handleDestroy}
                      downloadProofing={
                        !picsioConfig.isMainApp()
                        && picsioConfig.access.download && {
                          handler: this.downloadRaw,
                        }
                      }
                      analytics={{
                        handler: () => this.handlePanels('analytics'),
                        isActive: this.state.analyticsIsOpened,
                      }}
                      history={
                        isHistoryPanelEnabled()
                        && !asset.trashed && {
                          handler: () => this.handlePanels('history'),
                          isActive: state.showHistory,
                        }
                      }
                      details={
                        isActivityPanelEnabled()
                        && !asset.trashed && {
                          handler: () => this.handlePanels('details'),
                          isActive: state.showDetails,
                        }
                      }
                      isRemoveForever={isAssetFromInbox}
                    />
                  </ErrorBoundary>
                ) : asset.isAudio ? (
                  <ErrorBoundary className="errorBoundaryComponent">
                    <Audio
                      asset={asset}
                      isMainApp={picsioConfig.isMainApp()}
                      revisionID={state.idActiveState}
                      addRevision={state.isAllowedUploadingRevision && this.addRevision}
                      handleDownload={state.isAllowedDownloading && this.downloadRaw}
                      moveToTrash={state.isAllowedDeleting && this.moveToTrash}
                      isRemoveForever={isAssetFromInbox}
                    />
                  </ErrorBoundary>
                ) : asset.is3DModel ? (
                  <ErrorBoundary className="errorBoundaryComponent">
                    <Obj
                      asset={asset}
                      isMainApp={picsioConfig.isMainApp()}
                      addRevision={state.isAllowedUploadingRevision && this.addRevision}
                      handleDownload={state.isAllowedDownloading && this.downloadRaw}
                      moveToTrash={state.isAllowedDeleting && this.moveToTrash}
                      isRemoveForever={isAssetFromInbox}
                    />
                  </ErrorBoundary>
                ) : (
                  <ErrorBoundary className="errorBoundaryComponent">
                    {asset.pages ? (
                      <Multipage
                        historyItems={state.historyItems}
                        isSupportedForDiff={state.isSupportedForDiff}
                        setActive={this.activateRevision}
                        isDownloadable={
                          state.isAllowedDownloading
                          && (!isRestricted || (isRestricted && rolePermissions.restrictedDownload))
                          && (asset.archived ? isDownloadArchiveAllowed : true)
                        }
                        showRevisions={shouldRenderRevisionsDropdown()}
                        activeRevisionID={this.getActiveRevisionID}
                        lastRevisionNumber={this.lastRevisionNumber}
                        addRevision={this.addRevision}
                        isAllowedUploadingRevision={state.isAllowedUploadingRevision}
                        subscriptionFeatures={user?.subscriptionFeatures}
                        isRevisionUploading={state.revisionIsUploading}
                        model={asset}
                        revisionID={state.idActiveState}
                        diffID={state.idDiffState}
                        markers={state.markers}
                        tmpMarkers={state.tmpMarkers}
                        activeRevisionNumber={state.activeRevisionNumber}
                        diffRevisionNumber={state.diffRevisionNumber}
                        addMarker={this.addTmpMarker}
                        removeMarker={this.removeTmpMarker}
                        listenToClick={state.listenToAddMarker}
                        modifyTmpMarkers={this.modifyTmpMarkers}
                        addRevision={state.isAllowedUploadingRevision && this.addRevision}
                        openEditor={this.openEditor}
                        handleDownload={state.isAllowedDownloading && this.downloadRaw}
                        moveToTrash={state.isAllowedDeleting && this.moveToTrash}
                        assetName={asset ? asset.name : localization.SPINNERS.LOADING}
                        close={this.handleDestroy}
                        downloadProofing={
                          !picsioConfig.isMainApp()
                          && picsioConfig.access.download && {
                            handler: this.downloadRaw,
                          }
                        }
                        analytics={{
                          handler: () => this.handlePanels('analytics'),
                          isActive: this.state.analyticsIsOpened,
                        }}
                        history={
                          isHistoryPanelEnabled()
                          && !asset.trashed && {
                            handler: () => this.handlePanels('history'),
                            isActive: state.showHistory,
                          }
                        }
                        details={
                          isActivityPanelEnabled()
                          && !asset.trashed && {
                            handler: () => this.handlePanels('details'),
                            isActive: state.showDetails,
                          }
                        }
                        isRemoveForever={isAssetFromInbox}
                        getPages={props.actions.getPages}
                      />
                    ) : (
                      <Image
                        data={asset}
                        revisionID={state.idActiveState}
                        diffID={state.idDiffState}
                        markers={state.markers}
                        tmpMarkers={state.tmpMarkers}
                        activeRevisionNumber={state.activeRevisionNumber}
                        diffRevisionNumber={state.diffRevisionNumber}
                        addMarker={this.addTmpMarker}
                        removeMarker={this.removeTmpMarker}
                        listenToClick={state.listenToAddMarker}
                        modifyTmpMarkers={this.modifyTmpMarkers}
                        addRevision={state.isAllowedUploadingRevision && this.addRevision}
                        openEditor={this.openEditor}
                        handleDownload={state.isAllowedDownloading && this.downloadRaw}
                        setUserOrientation={props.actions.setUserOrientation}
                        moveToTrash={state.isAllowedDeleting && this.moveToTrash}
                        isRemoveForever={isAssetFromInbox}
                        mainActions={props.mainActions}
                        assetActions={props.actions}
                      />
                    )}
                  </ErrorBoundary>
                )}
              </div>
            </Swipeable>
          )}

          {/* arrow prev */}
          {showPrevArrow && (
            <div className="galleryArrowPrev" onClick={this.prev}>
              <span>
                <Icon name="arrowPrevPreview" />
              </span>
            </div>
          )}
          {/* arrow next */}
          {showNextArrow && (
            <div className="galleryArrowNext" onClick={this.next}>
              <span>
                <Icon name="arrowNextPreview" />
              </span>
            </div>
          )}

          {/* Placeholder trashed */}
          {asset.trashed && (
            <div className="placeholderTrashed" style={{ display: 'block' }}>
              <div className="inner">
                <span className="text">{localization.PREVIEW_VIEW.movedToTrash}</span>
                <span
                  className="btnRestore picsioDefBtn btnCallToAction"
                  onClick={this.restoreFromTrash}
                >
                  {localization.PREVIEW_VIEW.restore}
                </span>
              </div>
            </div>
          )}

          {/* Spinner */}
          {(!state.isLoaded || state.spinnerText) && (
            <Spinner title={state.spinnerText || localization.SPINNERS.LOADING} />
          )}
          {props.inProgress && <Spinner title={localization.SPINNERS.DOWNLOADING} />}
        </div>

        {/* Drop area */}
        <div
          className={`onDragenterPopup${state.showDropArea ? ' show' : ''}`}
          onDrop={this.onDropFile}
        >
          <span className="text">{localization.PREVIEW_VIEW.textDropFile}</span>
        </div>
      </div>
    );
  }
}

PreviewView.propTypes = {
  id: string.isRequired,
  assetsStore: object,
  assetIndex: number,
  asset: oneOfType([object, () => null]),
  inProgress: bool,
  panelWidth: number,
  user: object,
};

const ConnectedPreview = connect(
  (state, props) => {
    const assetIndex = state.assets.items
      ? state.assets.items.findIndex((asset) => asset._id === props.id)
      : -1;
    return {
      assetsStore: state.assets,
      assetIndex,
      asset: assetIndex > -1 ? state.assets.items[assetIndex] : null,
      inProgress:
        !picsioConfig.isMainApp() && !!state.downloadList.items.find((n) => n._id === props.id),
      panelWidth: state.main.panelsWidth.previewView.right,
      catalogViewMode: state.main.catalogViewMode,
      catalogViewItemSize: state.main.catalogViewItemSize,
      importOpened: state.main.importOpened,
      user: state.user,
      assetScale: state.main.assetScale,
    };
  },
  (dispatch) => ({
    actions: bindActionCreators(actions, dispatch),
    mainActions: bindActionCreators(mainActions, dispatch),
    userActions: bindActionCreators(userActions, dispatch),
    notificationsActions: bindActionCreators({ fetchJobsStatus }, dispatch),
  }),
)(PreviewView);

export default (props) => (
  <Provider store={store}>
    <ConnectedPreview {...props} />
  </Provider>
);
