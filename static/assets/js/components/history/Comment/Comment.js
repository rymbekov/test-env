import React from 'react';
import ReactDOMServer from 'react-dom/server';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import cn from 'classnames';
import { EmojiPickerToggler, Emoji, IconButton } from '@picsio/ui';
import {
  ReplyIcon,
  Delete,
  Link as LinkIcon,
  EyeOpen,
  EyeClosed,
} from '@picsio/ui/dist/icons';

import { Author } from '../../UserComponent';

import * as utils from '../../../shared/utils';
import localization from '../../../shared/strings';
import picsioConfig from '../../../../../../config';
import Logger from '../../../services/Logger';
import Toast from '../../Toast';
import Tooltip from '../../Tooltip';

import CommentContent from './CommentContent';
import CommentOriginal from './CommentOriginal';
import CommentReaction from './CommentReaction';
import copyTextToClipboard from '../../../helpers/copyTextToClipboard';

// updated to React.Component from React.PureComponent by Alexey
// this.props.data.text could changed when teammate delete a comment
class Comment extends React.Component {
  copyToClipboard = () => {
    const { data } = this.props;

    const { origin, pathname } = window.location;
    /** Copy to clipboard */
    const commentUrl = `${origin + pathname}#${data._id}`;
    const toastText = localization.HISTORY.textCopiedLink;
    copyTextToClipboard(commentUrl, toastText);
  };

  handleRemove = () => {
    const { data, onRemove } = this.props;

    onRemove(data._id);
  };

  handleClickText = (e) => {
    const { onEyeClick, index } = this.props;
    const { time } = e.target.dataset;

    if (time) {
      onEyeClick(index);
    }
  };

  getContent = (comment, isVideo = false) => {
    if (comment) {
      const {
        text, mentions, videoCurrentTime, videoCurrentTimeEnd,
      } = comment;
      let html = text
        .replace(utils.mentionPattern, (mentionString) => {
          const mentionID = mentionString.substring(1);
          const mention = mentions ? mentions.find((m) => m._id === mentionID) : null;

          if (mention) {
            return `<span class="itemHistoryList__main__text__mentionedUser">@${mention.displayName}</span>`;
          }
          return mentionString;
        })
        .replace(/(:[\w\d\s/(/)+-]*:)/g, (matched) => {
          try {
            const emojiName = matched.replace(/:/g, '');
            const reactString = ReactDOMServer.renderToString(<Emoji name={emojiName} />);

            if (!reactString) {
              return matched;
            }
            return reactString;
          } catch (e) {
            return matched;
          }
        });

      if (isVideo) {
        if (videoCurrentTime !== undefined) {
          if (videoCurrentTimeEnd !== undefined) {
            let minutesStart = Math.floor(videoCurrentTime / 60);
            let secondsStart = Math.floor(videoCurrentTime % 60);
            if (minutesStart < 10) minutesStart = `0${minutesStart}`;
            if (secondsStart < 10) secondsStart = `0${secondsStart}`;

            let minutesEnd = Math.floor(videoCurrentTimeEnd / 60);
            let secondsEnd = Math.floor(videoCurrentTimeEnd % 60);
            if (minutesEnd < 10) minutesEnd = `0${minutesEnd}`;
            if (secondsEnd < 10) secondsEnd = `0${secondsEnd}`;
            html = `<span class="itemHistoryList__main__text__time" data-time="${videoCurrentTime}">${minutesStart}:${secondsStart}</span> - <span class="itemHistoryList__main__text__time" data-time="${videoCurrentTimeEnd}">${minutesEnd}:${secondsEnd}</span> ${html}`;
          } else {
            let minutes = Math.floor(videoCurrentTime / 60);
            let seconds = Math.floor(videoCurrentTime % 60);
            if (minutes < 10) minutes = `0${minutes}`;
            if (seconds < 10) seconds = `0${seconds}`;
            html = `<span class="itemHistoryList__main__text__time" data-time="${videoCurrentTime}">${minutes}:${seconds}</span> ${html}`;
          }
        }
      }

      return utils.sanitizeXSS(html, {});
    }
    return null;
  };

  handleClickOrigin = (commentId) => {
    const { listNode } = this.props;

    if (listNode) {
      const node = listNode.querySelector(`[id="${commentId}"]`);

      if (node) {
        node.classList.remove('highlight');
        const listRect = listNode.getBoundingClientRect();
        const nodeRect = node.getBoundingClientRect();
        const topDiff = nodeRect.top - listRect.top;
        const scrollTop = listNode.scrollTop + topDiff;

        listNode.scrollTop = scrollTop;
        node.classList.add('highlight');
      }
    }
  };

  onReply = () => {
    const { data, addReply } = this.props;
    const { _id, userDisplayName } = data;
    const content = this.getContent(data, this.props.isVideo);

    addReply({ _id, userDisplayName, content });
  };

  onSelectReaction = (emojiName) => {
    const { data, addReaction } = this.props;
    const { _id: commenId } = data;

    addReaction(commenId, emojiName);
  };

  getReactions = () => {
    const {
      data: { reactions },
    } = this.props;

    if (reactions && reactions.length) {
      const reactionsByEmoji = reactions.reduce((acc, { userId, displayName, value }) => {
        const user = { id: userId, name: displayName };

        if (acc[value]) {
          const { count, users } = acc[value];

          acc[value] = {
            count: count + 1,
            users: [...users, user],
          };
        } else {
          acc[value] = {
            users: [user],
            count: 1,
          };
        }
        return acc;
      }, {});
      return reactionsByEmoji;
    }
    return {};
  };

  render() {
    const {
      index,
      currentUserId,
      data,
      originalComment,
      onEyeClick,
      isActive,
      showMarkerIcon,
      isCommentsNotAllowed,
      isVideo,
    } = this.props;
    const {
      _id,
      userAvatar,
      userDisplayName,
      userId,
      markers,
      text,
      revNumber,
      approved,
      createdAt,
      isRemovable,
      highlightNotification,
      revisionID,
    } = data;

    const date = dayjs(createdAt).format('lll');
    const isRenderBtnDelete = picsioConfig.isMainApp() && isRemovable === undefined && currentUserId === userId;
    const isCommentEnabled = picsioConfig.access ? picsioConfig.access.comment : true;
    const isReplyEnabled = !revNumber && isCommentEnabled;
    const content = this.getContent(data, isVideo);
    const originalContent = this.getContent(originalComment, isVideo);
    const reactions = this.getReactions();
    const reactionEmojis = Object.keys(reactions);

    return (
      <div
        id={_id}
        className={cn('itemHistoryList', {
          act: isActive,
          highlight: _id === window.location.hash.substring(1),
          highlightFadeUp: highlightNotification,
        })}
      >
        <div className="itemHistoryList__root" />
        <div className="itemHistoryList__main">
          <Author avatar={userAvatar} name={userDisplayName} additional={date} />
        </div>
        <If condition={originalComment}>
          <CommentOriginal
            {...originalComment}
            content={originalContent}
            onClick={this.handleClickOrigin}
          />
        </If>
        <CommentContent
          text={text}
          markers={markers}
          approved={approved}
          revNumber={revNumber}
          content={content}
          onClickText={this.handleClickText}
        />
        <If condition={!isCommentsNotAllowed}>
          <div className="itemHistoryList__footer">
            <If condition={reactionEmojis.length && !revNumber}>
              <div className="itemHistoryList__footer__reactions">
                {Object.keys(reactions).map((emojiName) => {
                  const reaction = reactions[emojiName];

                  return (
                    <CommentReaction
                      key={emojiName}
                      currentUserId={currentUserId}
                      emojiName={emojiName}
                      onClick={this.onSelectReaction}
                      {...reaction}
                    />
                  );
                })}
              </div>
            </If>
            <div className="itemHistoryList__footer__buttons">
              <If condition={isReplyEnabled}>
                <Tooltip content="Add reaction" placement="top">
                  <span>
                    <EmojiPickerToggler
                      onSelect={this.onSelectReaction}
                      iconSize="md"
                      popperProps={{ persist: false, hide: true }}
                    />
                  </span>
                </Tooltip>
                <Tooltip content="Reply" placement="top">
                  <IconButton onClick={this.onReply}>
                    <ReplyIcon />
                  </IconButton>
                </Tooltip>
              </If>
              <If condition={showMarkerIcon && markers.length > 0 && revisionID !== null}>
                <Tooltip
                  content={
                    isActive
                      ? localization.HISTORY.textHideMarkers
                      : localization.HISTORY.textShowMarkers
                  }
                  placement="top"
                >
                  <IconButton className="btnToggleMarkers" onClick={() => onEyeClick(index)}>
                    <Choose>
                      <When condition={isActive}>
                        <EyeOpen />
                      </When>
                      <Otherwise>
                        <EyeClosed />
                      </Otherwise>
                    </Choose>
                  </IconButton>
                </Tooltip>
              </If>
              <Tooltip content={localization.HISTORY.textCopyLink} placement="top">
                <IconButton onClick={this.copyToClipboard} size="lg">
                  <LinkIcon />
                </IconButton>
              </Tooltip>
              <If condition={isRenderBtnDelete}>
                <Tooltip content={localization.HISTORY.textDeleteComment} placement="top">
                  <IconButton onClick={this.handleRemove} size="lg">
                    <Delete />
                  </IconButton>
                </Tooltip>
              </If>
            </div>
          </div>
        </If>
      </div>
    );
  }
}

const commentProps = {
  createdAt: PropTypes.stringi,
  markers: PropTypes.arrayOf(PropTypes.object),
  reactions: PropTypes.arrayOf(PropTypes.object),
  revisionID: PropTypes.string,
  text: PropTypes.string,
  updatedAt: PropTypes.string,
  userAvatar: PropTypes.string,
  userDisplayName: PropTypes.string,
  userEmail: PropTypes.string,
  userId: PropTypes.string,
  _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Comment.defaultProps = {
  currentUserId: null,
  listNode: null,
  data: {},
  originalComment: null,
};
Comment.propTypes = {
  listNode: PropTypes.objectOf(PropTypes.any),
  index: PropTypes.number.isRequired,
  currentUserId: PropTypes.string,
  data: PropTypes.shape(commentProps),
  originalComment: PropTypes.shape(commentProps),
  onEyeClick: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  addReply: PropTypes.func.isRequired,
  addReaction: PropTypes.func.isRequired,
  setVideoCurrentTime: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired,
  showMarkerIcon: PropTypes.bool.isRequired,
  isCommentsNotAllowed: PropTypes.bool.isRequired,
};

export default Comment;
