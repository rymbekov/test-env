import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Logger from '../../services/Logger';
import Avatar from '../Avatar';
import * as UtilsCollections from '../../store/utils/collections';
import Tooltip from '../Tooltip';
import AvatarGroup from '../AvatarGroup';
import { setSearchRoute } from '../../helpers/history';

const Assignees = (props) => {
  const { assignees, max } = props;

  const handleClickItem = (user) => {
    Logger.log('User', 'ThumbnailAssigneeClick');
    const { email } = user;
    setSearchRoute({ tagId: UtilsCollections.getRootId(), text: `assignees.email:${email}` });
  };

  return (
    <div className="catalogItem__assignees">
      <AvatarGroup max={max}>
        {assignees.map((user) => (
          <Tooltip key={user._id} content={user.displayName} placement="top">
            <div onClick={() => handleClickItem(user)} className="avatarWrapper">
              <Avatar src={user.avatar} userName={user.displayName} size={40} />
            </div>
          </Tooltip>
        ))}
      </AvatarGroup>
    </div>
  );
};

Assignees.propTypes = {
  assignees: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      avatar: PropTypes.string,
      displayName: PropTypes.string,
    })
  ).isRequired,
  max: PropTypes.number.isRequired,
};

export default memo(Assignees);
