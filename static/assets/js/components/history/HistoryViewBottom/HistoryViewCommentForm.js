import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { Hidden } from '@picsio/ui';

import Icon from '../../Icon';
import { Input } from '../../../UIComponents';

import picsioConfig from '../../../../../../config';
import localization from '../../../shared/strings';
import UpgradePlan from '../../UpgradePlan';

import HistoryViewCommentFormReply from './HistoryViewCommentFormReply';
import Textarea from './Textarea';

const isSpeechRecognition = picsioConfig.isSpeechRecognition();

const HistoryViewCommentForm = forwardRef((props, ref) => {
  const {
    replyTo,
    cancelReply,
    guestName,
    changeGuestName,
    isSpeechActive,
    onClickSpeech,
    onSubmit,
    onKeyDown,
    onBlur,
    onFocus,
    isCommentsNotAllowed,
  } = props;

  return (
    <div
      className={cn('historyView__commentForm', {
        'historyView__commentForm--withReply': replyTo,
      })}
    >
      <If condition={picsioConfig.isMainApp() && isCommentsNotAllowed}>
        <UpgradePlan withWrapper tooltip={localization.UPGRADE_PLAN.tooltipPlanLimitations} />
      </If>
      {/* website user name */}
      <Hidden forApp="main">
        <div className={cn('historyView__commentForm__guestName', { isNotAllowed: isCommentsNotAllowed })}>
          <Input
            className="inputGuestName"
            type="text"
            defaultValue={guestName}
            onBlur={changeGuestName}
            placeholder={localization.HISTORY.textPlaceholderGuest}
            isDefault
          />
        </div>
      </Hidden>
      <div className={cn('historyView__commentForm__textareaWrapper', { isNotAllowed: isCommentsNotAllowed })}>
        <div className="historyView__commentForm__buttons">
          <If condition={isSpeechRecognition}>
            <button type="button" className={cn('btnRunSpeech', { act: isSpeechActive })} onClick={onClickSpeech}>
              <Icon name="microphone" />
            </button>
          </If>
          <button type="button" className="btnAddComment" onClick={onSubmit}>
            <Icon name="enter" />
          </button>
        </div>
        <If condition={replyTo}>
          <HistoryViewCommentFormReply {...replyTo} onCancel={cancelReply} />
        </If>
        <Textarea ref={ref} onFocus={onFocus} onKeyDown={onKeyDown} onBlur={onBlur} />
      </div>
    </div>
  );
});

HistoryViewCommentForm.defaultProps = {
  replyTo: {},
  guestName: '',
};
HistoryViewCommentForm.propTypes = {
  replyTo: PropTypes.shape({
    content: PropTypes.string,
    userDisplayName: PropTypes.string,
    _id: PropTypes.string,
  }),
  cancelReply: PropTypes.func.isRequired,
  guestName: PropTypes.string,
  changeGuestName: PropTypes.func.isRequired,
  isSpeechActive: PropTypes.bool.isRequired,
  onClickSpeech: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
  isCommentsNotAllowed: PropTypes.bool.isRequired,
};

export default HistoryViewCommentForm;
