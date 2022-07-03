import React from 'react';
import localization from '../../../shared/strings';

/**
 * TeammateStatus
 * @param {Object} props
 * @param {Object} props.user
 * @param {Function} props.sendInviteToTeammate
 * @returns {JSX}
 */
export default function TeammateStatus({ user, sendInviteToTeammate }) {
  const { status } = user;
  const showBtnResendInvite =		user.parent.confirmed !== true && user.parent.reinvited !== true && user.parent.confirmedByTeam !== false;

  return (
    <div className="pageTeam__user__addInfo">
      <div>
        {user.name} {localization.TEAMMATES.textStatus}
        <span className={`pageTeam__user__status pageTeam__user__status--${status.toLowerCase()}`}>{status}</span>
      </div>
      {showBtnResendInvite && (
        <span
          className="picsioLink"
          onClick={() => {
            sendInviteToTeammate(user._id);
          }}
        >
          {localization.TEAMMATES.textClickToReinvite}
        </span>
      )}
    </div>
  );
}
