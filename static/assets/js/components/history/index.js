import React from 'react';
import {
  array, string, func, object, bool,
} from 'prop-types';

import { Provider, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as utils from '../../shared/utils';
import picsioConfig from '../../../../../config';
import localization from '../../shared/strings';
import Logger from '../../services/Logger';

import Icon from '../Icon';
import store from '../../store';
import { resizePanel } from '../../store/actions/main';
import { revertRevision, attachCommentToAsset } from '../../store/actions/assets';
// import { notificationsMarkAsRead } from '../../store/actions/notifications';
import * as notificationsActions from '../../store/actions/notifications';
import { checkUserAccess } from '../../store/helpers/user';
import ConnectSlack from './ConnectSlack';

import SkeletonItem from './SkeletonItem';
import Comment from './Comment';
import Revision from './Revision';
import HistoryViewBottom from './HistoryViewBottom';

class History extends React.Component {
  User = this.props.user || {};

  isMainApp = picsioConfig.isMainApp();

  componentDidMount() {
    this.props.notificationsActions.notificationsMarkAsRead(this.props.model._id);
  }

  componentDidUpdate() {
    const ElVideo = this.props.getElVideo();

    if (ElVideo && ElVideo !== this.ElVideo) {
      this.ElVideo = ElVideo;
      this.ElVideo.addEventListener('markSelected', (e) => {
        const index = this.props.historyItems.findIndex((item) => item._id === e.detail._id);
        this.props.historyActions.toggleActiveComment(index, { isVideo: true });
      });
    }
  }

  changeGuestName = (event) => {
    event.preventDefault();
    const { target } = event;
    const { value } = target;
    const guestName = value || utils.getGuestName();
    target.value = guestName;

    utils.setGuestName(guestName);
  };

  checkMarkerDisplay = (revisionId) => picsioConfig.isMainApp() || picsioConfig.access.revisionsShow || this.props.historyActions.getActiveRevisionID() === revisionId;

  onClickAddMarker = () => {
    const { nextMarkerNumber, historyActions } = this.props;
    const { getActiveRevisionID } = historyActions;

    const activeRevisionID = getActiveRevisionID();

    const { onClickAddMarker } = this.props;

    Logger.log('User', 'ActivityPanelMarkerAdd', { assetId: this.props.model._id, activeRevisionID });
    onClickAddMarker(nextMarkerNumber);
  };

  /**
   * Download revision by index in state.historyItems
   * @param {number} index
   */
    downloadRevision = (index) => {
      const { historyItems } = this.props;
      const { id, originalFilename } = historyItems[index];

      /* Find next technical revision id */
      /* Allow to download technical revisions [2020.08.20] // hotfix
     for (let i = index + 1; i < historyItems.length; i++) {
       if (historyItems[i].id !== undefined) {
         // if revision
         if (historyItems[i].technical) {
           // if technical - set id
           id = historyItems[i].id;
         } else {
           // if not technical - break
           break;
         }
       }
     }
     */

      Logger.log('User', 'ActivityPanelRevisionDownload', { revisionId: id });
      this.props.downloadRevision(id, originalFilename);
    };

    getPanelWidth = () => {
      const panelWidth = utils.LocalStorage.get('picsio.panelsWidth');
      if (panelWidth) {
        return `${panelWidth.previewView.right}px`;
      }
      return '300px';
    }

    render() {
      const { props } = this;
      const {
        lastRevisionNumber,
        isLastRevisionTechnical,
        historyActions,
        isLoaded,
        historyItems,
        nextMarkerNumber,
        revisionsWithMarkers,
        isSupportedForDiff,
        approvals,
        isApproveDisabled,
        commentsCount,
        isVideo,
        replyTo,
        lastRevisionID,
        user: { _id: userId },
        markers,
      } = props;
      const {
        getActiveRevisionID,
        activateRevision,
        toggleRevisionComments,
        revertRevision,
        activateDiff,
        handleEyeClick,
        onCommentRemove,
        addReply,
        addReaction,
        changeApprove,
        addComment,
        cancelReply,
      } = historyActions;

      const activeRevisionID = getActiveRevisionID();
      const isRestricted = utils.isAssetRestricted(props.model.restrictSettings);
      const rolePermissions = (this.isMainApp && props.user.role.permissions) || {};
      const isAllowedApproving = this.isMainApp
      && props.model.permissions.approveAssets
      && (!isRestricted || (isRestricted && rolePermissions.restrictedApprove));
      const isDownloadArchiveAllowed = checkUserAccess('subscriptions', 'archive') && checkUserAccess('permissions', 'downloadArchive');

      const isCommentsShow = this.isMainApp || picsioConfig.access.commentShow;
      const isCommentsNotAllowed = Boolean((this.isMainApp && !props.subscriptionFeatures.comments)
    || (!this.isMainApp && !picsioConfig.access.comment));
      return (
        <div className="historyView" style={{ width: this.getPanelWidth() }}>
          <div className="resizer" onMouseDown={(event) => props.mainActions.resizePanel(event, 'previewView.right')} />
          <div className="historyView__list" ref={(node) => (this.$list = node)}>
            <div className="innerHistoryList">
              <Choose>
                <When condition={!isLoaded}>
                  <>
                    <SkeletonItem />
                    <SkeletonItem />
                    <SkeletonItem />
                  </>
                </When>
                <Otherwise>
                  <>
                    <If condition={this.isMainApp}>
                      <ConnectSlack />
                    </If>
                    {historyItems.map((item, index) => {
                      if (item.revisionNumber !== undefined) {
                        if (this.isMainApp || picsioConfig.access.revisionsShow) {
                          return (
                            <Revision
                              data={item}
                              index={index}
                              key={item.id}
                              isActive={item.id === activeRevisionID}
                              isActiveDiff={item.id === props.diffID}
                              isSupportedForDiff={isSupportedForDiff}
                              isDownloadable={
                                props.isDownloadable
                              && (!isRestricted || (isRestricted && rolePermissions.restrictedDownload))
                              && (props.model.archived ? isDownloadArchiveAllowed : true)
                              }
                              lastRevisionNumber={lastRevisionNumber}
                              setActive={activateRevision}
                              commentsWithMarkersCount={revisionsWithMarkers[item.id] || 0}
                              activeMarkersCount={props.markers.length}
                              toggleRevisionComments={toggleRevisionComments}
                              revertRevision={revertRevision}
                              download={this.downloadRevision}
                              setActiveDiff={() => activateDiff(
                                item.id,
                                item.revisionNumber,
                                historyItems.find((item) => item.id === activeRevisionID).revisionNumber,
                              )}
                              showMarkerIcon={isCommentsShow}
                              isApproved={approvals.includes(item.id)}
                              isVideo={this.props.isVideo}
                              addtionalClassName={item.addtionalClassName}
                              isAllowedImageUpload={this.isMainApp && props.model.permissions.upload && !props.model.archived}
                              isDiffAllowed={this.isMainApp ? props.subscriptionFeatures.diffTool : true}
                              isLastRevisionTechnical={isLastRevisionTechnical}
                            />
                          );
                        }
                        return null;
                      }
                      if (isCommentsShow) {
                        const { _id: commentId, revisionID, replyTo } = item;
                        const originalComment = replyTo ? historyItems.find((i) => i._id === replyTo) : null;
                        const isActive = markers.some((marker) => marker.id === commentId);
                        const showMarkerIcon = this.checkMarkerDisplay(revisionID);

                        return (
                          <Comment
                            key={commentId}
                            isVideo={isVideo}
                            index={index}
                            listNode={this.$list}
                            currentUserId={userId}
                            data={item}
                            originalComment={originalComment}
                            isActive={isActive}
                            showMarkerIcon={showMarkerIcon}
                            onEyeClick={handleEyeClick}
                            onRemove={onCommentRemove}
                            addReply={addReply}
                            addReaction={addReaction}
                            setVideoCurrentTime={this.props.setVideoCurrentTime}
                            isCommentsNotAllowed={isCommentsNotAllowed}
                          />
                        );
                      }
                      return null;
                    })}
                  </>
                </Otherwise>
              </Choose>
              <If condition={!this.isMainApp
              && picsioConfig.access.commentShow
              && !picsioConfig.access.revisionsShow
              && commentsCount === 0}
              >
                <div className="placeholder">
                  <Icon name="cloudChat" />
                  <div className="txt">{localization.HISTORY.proofingCommentsPlaceholder}</div>
                </div>
              </If>
            </div>
          </div>

          <If condition={isCommentsShow}>
            <HistoryViewBottom
              getElVideo={props.getElVideo}
              modelID={this.props.model._id}
              tmpMarkers={props.tmpMarkers}
              nextMarkerNumber={nextMarkerNumber}
              markersDisabled={props.markersDisabled}
              markersLocked={getActiveRevisionID() !== lastRevisionID}
              onClickAddMarker={this.onClickAddMarker}
              isApproved={approvals.includes(activeRevisionID)}
              isApproveDisabled={isApproveDisabled}
              onChangeApprove={changeApprove}
              onSubmit={addComment}
              isVideo={props.isVideo}
              isAllowedApproving={isAllowedApproving}
              replyTo={replyTo}
              cancelReply={cancelReply}
              guestName={utils.getGuestName()}
              changeGuestName={this.changeGuestName}
              isCommentsNotAllowed={isCommentsNotAllowed}
              commentTimeRange={props.commentTimeRange}
              isCheckedAttachTime={props.isCheckedAttachTime}
              setAttachTime={props.setAttachTime}
              setCommentTimeRange={props.setCommentTimeRange}
            />
          </If>
        </div>
      );
    }
}

History.propTypes = {
  model: object,
  activeID: string,
  diffID: string,
  setActiveDiff: func,
  toggleMarkers: func,
  markers: array,
  tmpMarkers: array,
  isDownloadable: bool,
  onClickAddMarker: func,
  clearTmpMarkers: func,
  downloadRevision: func,
  markersDisabled: bool,
  updateModelApprove: func,
};

const mapStateToProps = (state) => ({
  user: state.user,
  subscriptionFeatures: state.user.subscriptionFeatures || {},
});
const mapDispatchToProps = (dispatch) => ({
  mainActions: bindActionCreators({ resizePanel }, dispatch),
  assetsActions: bindActionCreators({ revertRevision, attachCommentToAsset }, dispatch),
  notificationsActions: bindActionCreators(notificationsActions, dispatch),
});
const ConnectedHistory = connect(mapStateToProps, mapDispatchToProps)(History);

export default (props) => (
  <Provider store={store}>
    <ConnectedHistory {...props} />
  </Provider>
);
