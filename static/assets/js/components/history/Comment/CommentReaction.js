import React from 'react';
import PropTypes from 'prop-types';
import { Emoji } from '@picsio/ui';
import Tooltip from '../../Tooltip';

const CommentReaction = (props) => {
  const {
    currentUserId,
    emojiName,
    count,
    users,
    onClick,
  } = props;
  const usersList = users.map(({ id, name }) => {
    if (id === currentUserId) {
      return `You${users.length === 1 ? ' (click to remove)' : ''}`;
    }
    return name;
  });
  const name = emojiName.replace(/:/gi, '');
  const tooltip = `${usersList.join(', ')} reacted with :${name}:`;

  return (
    <Tooltip className="commentReactionTooltip" content={tooltip} placement="top">
      <button
        className="commentReaction"
        onClick={() => onClick(emojiName)}
        type="button"
      >
        <Emoji name={name} size="sm" iconSize={16} />
        <span className="count">{count}</span>
      </button>
    </Tooltip>
  );
};

CommentReaction.defaultProps = {
  currentUserId: null,
};
CommentReaction.propTypes = {
  currentUserId: PropTypes.string,
  emojiName: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
    }),
  ).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default CommentReaction;
