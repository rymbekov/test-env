import React from 'react'; // eslint-disable-line
import cn from 'classnames';
import Avatar from '../../../Avatar';

/**
 * User
 * @param {Object} props
 * @param {Object} props.user
 * @param {number} props.index
 * @param {number} props.activeIndex
 * @param {Function} props.submit
 */
const Item = ({
  user, index, activeIndex, submit,
}) => (
  <div className={cn('mentionTeamMember__item', { act: activeIndex === index })} onClick={() => submit(index)}>
    <Avatar src={user.avatar} size={30} />
    <div className="mentionTeamMember__item__text">
      <span className="mentionTeamMember__item__text__name">{user.displayName}</span>
      <span className="mentionTeamMember__item__text__email">{user.email}</span>
    </div>
  </div>
);

export default Item;
