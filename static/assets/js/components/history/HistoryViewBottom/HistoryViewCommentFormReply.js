import React from 'react';
import PropTypes from 'prop-types';

const HistoryViewCommentFormReply = (props) => {
  const { userDisplayName, content, onCancel } = props;

  return (
    <div className="historyView__commentForm__reply">
      <div className="left">
        <button onClick={onCancel}>
          <span />
          <span />
        </button>
      </div>
      <div className="right">
        <div className="historyView__commentForm__replyInfo">
          <div className="displayName">{userDisplayName}</div>
          <div className="text" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    </div>
  );
};

HistoryViewCommentFormReply.propTypes = {
  userDisplayName: PropTypes.string.isRequired,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default HistoryViewCommentFormReply;
