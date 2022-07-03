import React, { Fragment, useRef } from 'react';
import useHover from '@react-hook/hover';
import cn from 'classnames';
import Skeleton from 'react-loading-skeleton';
import { Hidden } from '@picsio/ui';
import Avatar from '../../Avatar';
import Icon from '../../Icon';
import WithSkeletonTheme from '../../WithSkeletonTheme';
import TeamUserDetails from './TeamUserDetails';

/**
 * TeamUser
 * @param {Object} props
 * @param {Object} props.user
 * @param {Array} props.roles
 * @param {boolean} props.isActive
 * @param {boolean} props.isSelected
 * @param {boolean} props.isCheckboxVisible
 * @param {Function} props.toggleUser
 * @param {Function} props.setActiveUser
 * @param {Function} props.changeTeammatePassword
 * @param {Function} props.removeTeammate
 * @param {Function} props.assignRoleToTeammate
 * @returns {JSX}
 */
export default function TeamUser({
  user,
  isCurrentUser,
  roles,
  isActive,
  isSelected,
  isCheckboxVisible,
  toggleUser,
  selectOneUser,
  setActiveUser,
  changeTeammatePassword,
  roleChangingIds,
  processingIds,
  removeTeammate,
  sendInviteToTeammate,
  assignRoleToTeammate,
  updateUser,
  updateTeammateByField,
  isAllowManageTeam,
  isShowTeammateAnalytics,
}) {
  const target = useRef(null);
  const isHovering = useHover(target, { enterDelay: 0, leaveDelay: 0 });
  const { status, isRoleError } = user;

  const handleUserCLick = (event, userId) => {
    if (event.metaKey) {
      if (user.isOwner) return;
      return toggleUser(event, userId);
    }
    if (event.altKey) {
      if (user.isOwner) return;
      return selectOneUser(userId);
    }
    setActiveUser(userId);
  };

  if (processingIds.includes(user._id)) {
    return (
      <WithSkeletonTheme>
        <div className="myTeamUser">
          <div className="myTeamUserAvatar">
            <Skeleton circle height={50} width={50} />
          </div>
          <div className="myTeamUserText" style={{ flex: 1 }}>
            <div className="myTeamUserName">
              <Skeleton height={25} width={70} />
            </div>
            <div className="myTeamUserRole mobileHidden">
              <Skeleton height={12} width={100} />
            </div>
          </div>
        </div>
      </WithSkeletonTheme>
    );
  }

  return (
    <div
      ref={target}
      className={cn('myTeamUser', {
        isActive: isSelected || isActive,
        isSelected: isCheckboxVisible,
      })}
      onClick={(event) => handleUserCLick(event, user._id)}
    >
      {!user.isOwner && (
        <>
          <div
            className={cn('userInviteStatus', {
              userInviteStatusWaiting: status === 'Invited',
              userInviteStatusRejected: status === 'Rejected',
              userInviteStatusAccepted: status === 'Accepted',
              userInviteStatusReinvited: status === 'Reinvited',
            })}
          >
            {(status === 'Invited' || status === 'Rejected') && (
              <Icon name={cn({ hourglass: status === 'Invited', close: status === 'Rejected' })} />
            )}
          </div>
          <If condition={isCheckboxVisible || isHovering}>
            <div
              className={cn('checkbox', { isActive: isSelected })}
              onClick={(event) => toggleUser(event, user._id)}
            >
              <span />
            </div>
          </If>
        </>
      )}

      <div className="myTeamUserAvatar">
        <Avatar
          src={user.avatar}
          username={user.displayName}
          size={50}
          className={cn({
            isActive: isSelected || isActive,
            isHover: isHovering,
          })}
        />
      </div>
      <div className="myTeamUserText">
        <div className="myTeamUserName">{user.displayName}</div>
        <div className={cn('myTeamUserRole mobileHidden', { isError: isRoleError })}>
          {user.isOwner && <Icon name="crown" />}

          {roleChangingIds.includes(user._id) ? (
            <WithSkeletonTheme>
              <Skeleton height={12} width={60} />
            </WithSkeletonTheme>
          ) : (
            <>{user.roleName}</>
          )}
        </div>
        <div className="myTeamUserEmail mobileVisible">{user.email}</div>
      </div>
      {isActive && (
        <Hidden implementation="js" desktopUp>
          <div className="myTeamUserMobileDetails">
            <TeamUserDetails
              user={user}
              roles={roles}
              changeTeammatePassword={changeTeammatePassword}
              sendInviteToTeammate={sendInviteToTeammate}
              assignRoleToTeammate={assignRoleToTeammate}
              updateUser={updateUser}
              updateTeammateByField={updateTeammateByField}
              removeTeammate={removeTeammate}
              isCurrentUser={isCurrentUser}
              isAllowManageTeam={isAllowManageTeam}
              isShowTeammateAnalytics={isShowTeammateAnalytics}
            />
          </div>
        </Hidden>
      )}
    </div>
  );
}
