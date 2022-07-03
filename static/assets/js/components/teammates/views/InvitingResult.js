import React, { Fragment } from 'react';
import sortBy from 'lodash.sortby';
import Logger from '../../../services/Logger';
import localization from '../../../shared/strings';
import Tag from '../../Tag';

/**
 * InvitingResult
 * @param {Object} props
 * @param {Object} props.result
 * @returns {JSX}
 */
export default function InvitingResult({ result }) {
  const addedTeammates = sortBy(result.addedTeammates, ['email']);
  const notAddedTeammates = sortBy(result.notAddedTeammates, ['success', 'subCode', 'email']);

  const invitingResult = {
    addedTeammates: addedTeammates.length,
    notAddedTeammates: notAddedTeammates.length,
  };
  Logger.log('UI', 'SettingsMyTeamInvitingResultShow', invitingResult);

  return (
    <div className="invitingResult">
      {Boolean(addedTeammates.length) && (
        <>
          <div className="invitingResultTitle">{localization.TEAMMATES.succesfulyInvited}</div>
          <div className="invitingResultList">
            {addedTeammates.map((teammate) => (
              <Tag key={teammate.email} type="user" avatar={teammate.avatar} text={teammate.email} />
            ))}
          </div>
        </>
      )}
      {Boolean(notAddedTeammates.length) && (
        <>
          <div className="invitingResultTitle">{localization.TEAMMATES.notInvited}</div>
          <div className="invitingResultList">
            {notAddedTeammates.map((teammate) => (
              <div key={teammate.email} className="invitingResultListItem">
                <Tag type="user" avatar={teammate.avatar} text={teammate.email} /> -{' '}
                {teammate.message.replace(teammate.email, '')}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
