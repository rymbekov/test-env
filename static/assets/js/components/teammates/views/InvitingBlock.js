import React, { useState, useEffect } from 'react';
import cn from 'classnames';
import { ReactSelect } from '../../../UIComponents';
import localization from '../../../shared/strings';
import Icon from '../../Icon';
import TagList from './TagList';
import { navigate } from '../../../helpers/history';

/**
 * InvitingBlock
 * @param {Object} props
 * @param {array} roleOptions
 * @param {array} invitedEmails
 * @param {array} invitedUsers
 * @param {function} updateInvitedEmails
 * @param {function} setUserName
 * @param {function} selectTeammateRole
 * @param {function} applyMultipleInvite
 * @param {function} applyInviteFromGSuite
 * @param {bool} isTeammatesLimitExceeded
 * @returns {JSX}
 */
export default function InvitingBlock({
  roleOptions,
  invitingRole,
  invitedEmails,
  invitedUsers,
  updateInvitedEmails,
  setUserName,
  selectTeammateRole,
  applyMultipleInvite,
  applyInviteFromGSuite,
  isTeammatesLimitExceeded,
}) {
  const [userName, setName] = useState('');

  useEffect(() => {
    if (invitedEmails.length > 1) {
      setName('');
    }
  }, [invitedEmails]);

  const iviteFromGSuiteDescription = localization.TEAMMATES.isPicsioTrusted();

  const handleSubmit = (emails, submitFormImmediately) => {
    updateInvitedEmails(emails);

    if (submitFormImmediately) {
      applyMultipleInvite();
    }
  };

  return (
    <div className="pageTeam__user__invite">
      <div className="pageTeam__user__invite__block">
        <div className="pageItemTitle">{localization.TEAMMATES.textNewTeammate}</div>
        <div className="UIInput__label">{localization.TEAMMATES.labelSelectEmail}</div>
        <TagList
          items={invitedEmails}
          placeholder={localization.ACCOUNT.placeholderEnterEmail}
          onSubmit={handleSubmit}
          disabled={isTeammatesLimitExceeded}
          users={invitedUsers}
        />

        {isTeammatesLimitExceeded && (
          <div className="warning">
            <div className="warningIcon">
              <Icon name="warning" />
            </div>
            <div className="warningText">
              {localization.TEAMMATES.availableUsersExceeded}
              <br />
              <span className="picsioLink" onClick={() => navigate('/billing?tab=overview')}>
                {localization.TEAMMATES.updatePlan}
              </span>
              .
            </div>
          </div>
        )}

        <div className="inviteFromGSuite">
          <span className="picsioLink" onClick={applyInviteFromGSuite}>
            {localization.TEAMMATES.addUsersFromGSuite}
          </span>
          <p>{iviteFromGSuiteDescription}</p>
        </div>

        {/* <div className="inviteUsersSetName">
					<Input
						label="Name"
						disabled={!invitedEmails.length || invitedEmails.length > 1}
						value={userName}
						onChange={e => setName(e.currentTarget.value)}
						onBlur={() => setUserName(userName)}
					/>
				</div> */}

        <ReactSelect
          label={localization.TEAMMATES.labelSelectRole}
          options={roleOptions}
          value={invitingRole}
          onChange={(value) => {
            selectTeammateRole(value);
          }}
        />
        <div className="inviteUsersButton">
          <div
            className={cn('picsioDefBtn btnCallToAction', {
              disable: !invitedEmails.length || isTeammatesLimitExceeded,
            })}
            onClick={() => applyMultipleInvite()}
          >
            {localization.TEAMMATES.textInvite}
          </div>
        </div>
      </div>
    </div>
  );
}
