import React from 'react';
import PropTypes from 'prop-types';

import Logger from '../../../services/Logger';
import ua from '../../../ua';
import * as utils from '../../../shared/utils';
import unescapeHTML from '../../../shared/unescapeHTML';

import HistoryViewBottomBar from './HistoryViewBottomBar';
import HistoryViewCommentForm from './HistoryViewCommentForm';

import { multilineNormalize, replaceMentions } from '../helper';
import parseHTMLStringWithEmoji, {
  renderEmojiToString,
} from './utils/parseHTMLStringWithEmoji';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

class HistoryViewBottom extends React.Component {
  isMobile = ua.browser.isNotDesktop();

  $textarea = React.createRef();

  range = null;

  state = {
    isSpeechActive: false,
    isDisabledAttachTime: false,
    value: '',
  };

  componentDidMount() {
    const savedTextareaMessage = utils.LocalStorage.get(
      'picsioSavedTextareaMessage',
    );
    //if there are no new comments, we put focus on editable(writable) comment area.
    //Since it is not input tag we should use this piece of code to put focus on onClick event
    const splittedHash = window.location.hash.split('?');
    const params = splittedHash.length > 1 ? splittedHash[1] : '';
    const paramsArray = params.split('&');
    if (paramsArray.find((item) => item.toLocaleLowerCase() === 'focus=true')) {
      if (this.$textarea.current) {
        const range = document.createRange();
        const sel = window.getSelection();

        range.setStart(this.$textarea.current, 0);
        range.collapse(true);

        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
    if (
      savedTextareaMessage
      && savedTextareaMessage.text
      && savedTextareaMessage.modelID === this.props.modelID
    ) {
      this.$textarea.current.innerHTML = savedTextareaMessage.text;
      this.setState({ value: savedTextareaMessage.text });
      utils.LocalStorage.set('picsioSavedTextareaMessage', {});
    }
    this.initVideo(this.props);

    const ElVideo = this.props.getElVideo();
    if (ElVideo) {
      const onCanplay = () => {
        this.setState({ isDisabledAttachTime: false });
        ElVideo.removeEventListener('canplay', onCanplay);
      };
      ElVideo.duration
        ? onCanplay()
        : ElVideo.addEventListener('canplay', onCanplay);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.initVideo(nextProps);

    if (nextProps.modelID !== this.props.modelID) {
      const savedTextareaMessage = utils.LocalStorage.get(
        'picsioSavedTextareaMessage',
      );
      this.saveTextToLocalStorage();
      if (
        savedTextareaMessage
        && savedTextareaMessage.text
        && savedTextareaMessage.modelID === nextProps.modelID
      ) {
        this.$textarea.current.innerHTML = savedTextareaMessage.text;
        this.setState({ value: savedTextareaMessage.text });
      } else {
        this.$textarea.current.innerHTML = '';
        this.setState({ value: '' });
      }
    }

    if (this.ElVideo && nextProps.modelID !== this.props.modelID) {
      const isTmpMarkersExists = !!(
        nextProps.tmpMarkers && nextProps.tmpMarkers.length
      );
      const isDisabledAttachTime = Boolean(
        isTmpMarkersExists || nextProps.markersLocked,
      );

      if (
        nextProps.tmpMarkers.length !== this.props.tmpMarkers.length
        && !this.ElVideo.paused
      ) {
        /** if set/unset marker and video is playing */
        this.ElVideo.pause();
      }
      const state = { isDisabledAttachTime };
      if (isTmpMarkersExists) {
        this.props.setAttachTime(true);
      }
      if (nextProps.markersLocked) {
        this.props.setAttachTime(false);
      }
      this.setState(state);
    }
  }

  componentDidUpdate(prevProps) {
    const { replyTo } = this.props;

    if (prevProps.replyTo !== replyTo && replyTo) {
      this.$textarea.current.focus();
    }
  }

  componentWillUnmount() {
    this.saveTextToLocalStorage();
  }

  initVideo = (props) => {
    const ElVideo = props.getElVideo();
    if (ElVideo !== this.ElVideo) this.ElVideo = ElVideo;
  };

  saveTextToLocalStorage = () => {
    const savedTextareaMessage = utils.LocalStorage.get(
      'picsioSavedTextareaMessage',
    );
    const text = this.$textarea.current.innerHTML || this.$textarea.current.value;

    if (text) {
      utils.LocalStorage.set('picsioSavedTextareaMessage', {
        text,
        modelID: this.props.modelID,
      });
    } else if (
      savedTextareaMessage
      && savedTextareaMessage.modelID === this.props.modelID
    ) {
      utils.LocalStorage.set('picsioSavedTextareaMessage', {});
    }
  };

  onSubmit = () => {
    const { guestName } = this.props;

    let text = parseHTMLStringWithEmoji(
      this.$textarea.current.innerHTML || this.$textarea.current.value,
    );
    const markers = this.props.tmpMarkers;

    if (typeof text === 'string' && text.length > 0) {
      const mentions = replaceMentions(text);
      text = mentions.text;
      text = multilineNormalize(text);
      text = unescapeHTML(text);
      text = utils.sanitizeXSS(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });

      const data = { text, markers };

      if (guestName) data.proofingGuestName = guestName;

      if (this.props.isCheckedAttachTime) {
        const [start, end] = this.props.commentTimeRange;
        if (Math.floor(start) === Math.floor(end)) {
          data.videoCurrentTimeStart = start;
        } else {
          data.videoCurrentTimeStart = start;
          data.videoCurrentTimeEnd = end;
        }
      }

      this.props.onSubmit(data, mentions.mentions);
      this.playVideo();
      this.$textarea.current.blur();
    }

    if (this.$textarea.current.innerHTML || this.$textarea.current.value) {
      this.$textarea.current.innerHTML = '';
      this.$textarea.current.value = '';
      this.setState({ value: '' });
    } else {
      this.$textarea.current.value = '';
    }
  };

  /**
   * Handle keydown on textarea
   * @param {KeyboardEvent} event
   */
  onKeyDown = (event) => {
    const KEY_ENTER = 13;
    const { keyCode, shiftKey } = event;

    if (keyCode === KEY_ENTER && !shiftKey) {
      event.preventDefault();
      this.onSubmit();
    }

    if (event.target.value !== this.state.value) {
      this.setState({ value: event.target.value });
    }
  };

  pauseVideo = () => {
    const $video = this.props.getElVideo();

    if ($video) {
      $video.pause();
    }
  };

  playVideo = () => {
    const $video = this.props.getElVideo();

    if ($video) {
      $video.play();
    }
  };

  /**
   * Click on "Add marker" button
   * @param {MouseEvent} event
   * @param {number} event.clientX
   * @param {number} event.clientY
   */
  onClickAddMarker = ({ clientX, clientY }) => {
    if (this.props.markersLocked) return;

    const { props } = this;
    const $marker = document.createElement('div');
    $marker.classList.add('historyMarker');
    $marker.style.left = `${clientX}px`;
    $marker.style.top = `${clientY}px`;
    $marker.innerText = props.nextMarkerNumber + props.tmpMarkers.length;

    document.body.appendChild($marker);

    const onMove = ({ clientX: x, clientY: y }) => {
      $marker.style.left = `${x}px`;
      $marker.style.top = `${y}px`;
    };

    const onKeyDown = (event) => {
      if (event.keyCode === 27) {
        /** Handle press Esc */
        onClick();
      }
    };

    const onClick = () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('keydown', onKeyDown);
      document.body.removeChild($marker);
    };

    document.addEventListener('click', onClick);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('keydown', onKeyDown);

    this.props.onClickAddMarker();
  };

  /**
   * On click button speech
   * @param {MouseEvent} event
   */
  onClickSpeech = (event) => {
    event.preventDefault();
    const { isSpeechActive } = this.state;

    const stopSpeech = () => {
      this.recognition.abort();
      delete this.recognition;

      this.setState({ isSpeechActive: false });
      Logger.log('User', 'CommentFormSpeechRecognitionStop');
    };

    if (!isSpeechActive) {
      Logger.log('User', 'CommentFormSpeechRecognitionStart');
      this.setState({ isSpeechActive: true });

      this.$textarea.current.focus();
      this.recognition = new SpeechRecognition();

      const { recognition } = this;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {};
      recognition.onend = () => {};
      recognition.onerror = () => {};
      recognition.onresult = (e) => {
        for (let i = e.resultIndex; i < e.results.length; i += 1) {
          const result = e.results[i];
          const isFinal = result.isFinal && result[0].confidence > 0;

          if (isFinal) {
            const { transcript } = result[0];

            if (transcript.trim() === 'stop speech') {
              stopSpeech();

              Logger.log('User', 'CommentFormSpeechRecognitionStopByPhrase');
            } else {
              this.$textarea.current.innerHTML += transcript;
            }
          }
        }
      };

      recognition.start();
    } else if (this.recognition) {
      stopSpeech();
    }
  };

  onChangeCheckboxAttachtime = () => {
    this.pauseVideo();
    this.props.setAttachTime();
    this.props.setCommentTimeRange([this.ElVideo.currentTime, this.ElVideo.currentTime]);
  };

  onBlur = (event) => {
    this.saveRange(event);
  };

  onFocus = () => {
    this.pauseVideo();
  };

  saveRange = () => {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);

    this.range = range;
  };

  // set new cursor position after last selected emoji
  setCursorPosition = (target, node) => {
    const selection = window.getSelection();
    const range = this.range || new Range();

    range.selectNodeContents(target);
    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    target.focus();
  };

  selectEmoji = (emojiName) => {
    const textarea = this.$textarea.current;
    const htmlEmoji = renderEmojiToString(emojiName);
    const emojiElement = utils.html.htmlToElement(htmlEmoji);

    // if range is exist - put emoji to the last cursor position
    if (this.range) {
      // if range is not empty - delete selected range content
      if (this.range.startOffset < this.range.endOffset) {
        this.range.deleteContents();
      }
      this.range.insertNode(emojiElement);
    } else {
      // if range isn't exist - put emoji to the start
      textarea.appendChild(emojiElement);
    }

    this.setCursorPosition(textarea, emojiElement);
  };

  render() {
    const {
      isDisabledAttachTime,
      isSpeechActive,
    } = this.state;
    const {
      replyTo,
      cancelReply,
      tmpMarkers,
      markersDisabled,
      markersLocked,
      getElVideo,
      isAllowedApproving,
      isApproveDisabled,
      isApproved,
      onChangeApprove,
      guestName,
      changeGuestName,
      isCheckedAttachTime,
      isCommentsNotAllowed,
    } = this.props;
    return (
      <div className="historyView__bottom">
        <HistoryViewBottomBar
          videoElement={getElVideo}
          tmpMarkers={tmpMarkers}
          markersDisabled={markersDisabled}
          markersLocked={markersLocked}
          onClickAddMarker={this.onClickAddMarker}
          isDisabledAttachTime={isDisabledAttachTime}
          isCheckedAttachTime={isCheckedAttachTime}
          onChangeCheckboxAttachtime={this.onChangeCheckboxAttachtime}
          isAllowedApproving={isAllowedApproving}
          isApproveDisabled={isApproveDisabled}
          isApproved={isApproved}
          onChangeApprove={onChangeApprove}
          showVideoToddler={this.props.showVideoToddler}
          selectEmoji={this.selectEmoji}
          isCommentsNotAllowed={isCommentsNotAllowed}
          commentTimeRange={this.props.commentTimeRange}
        />
        <HistoryViewCommentForm
          ref={this.$textarea}
          replyTo={replyTo}
          cancelReply={cancelReply}
          guestName={guestName}
          changeGuestName={changeGuestName}
          isSpeechActive={isSpeechActive}
          onClickSpeech={this.onClickSpeech}
          onSubmit={this.onSubmit}
          onKeyDown={this.onKeyDown}
          onBlur={this.onBlur}
          onFocus={this.onFocus}
          isCommentsNotAllowed={isCommentsNotAllowed}
        />
      </div>
    );
  }
}

HistoryViewBottom.defaultProps = {
  guestName: '',
  nextMarkerNumber: null,
  tmpMarkers: [],
  replyTo: null,
  markersDisabled: false,
};
HistoryViewBottom.propTypes = {
  modelID: PropTypes.string.isRequired,
  guestName: PropTypes.string,
  tmpMarkers: PropTypes.arrayOf(
    PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
      number: PropTypes.number,
      createdAt: PropTypes.number,
    }).isRequired,
  ),
  nextMarkerNumber: PropTypes.number,
  replyTo: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    userDisplayName: PropTypes.string.isRequired,
  }),
  isAllowedApproving: PropTypes.bool.isRequired,
  isApproveDisabled: PropTypes.bool.isRequired,
  isApproved: PropTypes.bool.isRequired,
  markersDisabled: PropTypes.bool,
  markersLocked: PropTypes.bool.isRequired,
  getElVideo: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClickAddMarker: PropTypes.func.isRequired,
  onChangeApprove: PropTypes.func.isRequired,
  changeGuestName: PropTypes.func.isRequired,
  cancelReply: PropTypes.func.isRequired,
  isCommentsNotAllowed: PropTypes.bool.isRequired,
};

export default HistoryViewBottom;
