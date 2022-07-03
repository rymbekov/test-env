import React, { useRef } from 'react';
import useHover from '@react-hook/hover';
import cn from 'classnames';
import Avatar from '../Avatar';
import Icon from '../Icon';

/**
 * UserComponent
 * @param {Object} props
 * @param {Object} props.user
 * @param {boolean} props.isActive
 * @param {Function} props.onClick
 * @param {Function} props.onRemove
 * @returns {JSX}
 */
export function UserComponent({
  user, isActive, onClick, onRemove,
}) {
  const target = useRef(null);
  const isHovering = useHover(target, { enterDelay: 0, leaveDelay: 0 });

  return (
    <div ref={target} className={cn('myTeamUser', { isActive })} onClick={() => onClick(user._id)}>
      <div className="myTeamUserAvatar">
        <Avatar
          src={user.teamLogo}
          username={user.displayName}
          size={50}
          className={cn({
            isActive,
            isHover: isHovering,
          })}
        />
      </div>

      <div className="myTeamUserText">
        <div className="myTeamUserName">{user.teamName}</div>
        <div className="myTeamUserRole">
          <>
            {user.avatar && (
              <>
                <img className="myTeamLogo" src={user.avatar} />
              </>
            )}
            {user.displayName && (
              <>
                <div className="myTeam">{user.displayName}</div>
                <div className="separator"> / </div>
              </>
            )}
          </>

          <div className="myRole">{user.roleName} </div>
        </div>
      </div>

      {!user.current && isHovering && (
        <button className="buttonSmall" onClick={() => onRemove(user._id)}>
          <Icon name="close" />
        </button>
      )}
    </div>
  );
}

/**
 * Author
 * @param {Object} props
 * @param {Object} props.user
 * @returns {JSX}
 */
export function Author({
  avatar, name, additional, size = 35, avatarPicsio, className, classNameAdditional, authorNameClassname, authorAdditionalClassname,
}) {
  return (
    <div className={cn('author', { [className]: className })}>
      <div className="authorAvatar" style={{ minWidth: size }}>
        <Avatar src={avatar} username={name} size={size} avatarPicsio={avatarPicsio} />
      </div>
      <div className={cn('authorText', { [classNameAdditional]: classNameAdditional })}>
        <div className={cn('authorName', { [authorNameClassname]: authorNameClassname })}>{name}</div>
        <div className={cn('authorAdditional', { [authorAdditionalClassname]: authorAdditionalClassname })}>{additional}</div>
      </div>
    </div>
  );
}
