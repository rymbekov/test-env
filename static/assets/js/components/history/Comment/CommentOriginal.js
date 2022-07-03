import React from 'react';
import PropTypes from 'prop-types';

import CommentContent from './CommentContent';

const CommentOriginal = (props) => {
  const {
    _id, userDisplayName, onClick, ...rest
  } = props;

  return (
    <div
      data-id={_id}
      className="itemHistoryList itemHistoryList--original"
      onClick={() => onClick(_id)}
      role="presentation"
    >
      <div className="itemHistoryList__displayName">{userDisplayName}</div>
      <CommentContent _id={_id} {...rest} />
    </div>
  );
};

CommentOriginal.propTypes = {
  _id: PropTypes.string.isRequired,
  userDisplayName: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

export default CommentOriginal;
