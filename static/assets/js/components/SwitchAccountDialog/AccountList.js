import React from 'react';
import UiBlocker from '../../services/UiBlocker';
import Logger from '../../services/Logger';
import sdk from '../../sdk';
import { UserComponent } from '../UserComponent';

/**
 * @param {Object} props
 * @param {Object[]} accounts
 * @param {Funciton} select
 * @param {String} selectedId
 * @param {Function} setAuthorizedUsers
 * @returns {JSX}
 */
export default function AccountList({
  accounts, select, selectedId, setAuthorizedUsers,
}) {
  const handleSelect = (id) => {
    Logger.log('User', 'SwitchAccountDialogSelectUser');
    select(id);
  };

  const signoutSession = async (id) => {
    UiBlocker.block('Signout session...');
    Logger.log('User', 'SwitchAccountDialogSignoutUser');
    try {
      const { data: res } = await sdk.users.signoutSession(id);
      if (res.authenticatedUsers) {
        const {
          _id, email, avatar, displayName, role, parent, team,
        } = res.user;
        const currentUser = {
          _id,
          email,
          displayName,
          avatar,
          roleName: !parent ? 'Team owner' : role.name,
          current: true,
        };
        if (team) {
          currentUser.teamName = (team.policies && team.policies.teamName) || team.displayName;
          currentUser.teamLogo = team.logoUrl;
        }

        select(null);
        setAuthorizedUsers([{ ...currentUser }, ...res.authenticatedUsers]);
      }
    } catch (err) {
      Logger.error(new Error('Can not signout session'), { error: err, id, showDialog: true }, [
        'SignOutSessionFailed',
        id,
      ]);
    }
    UiBlocker.unblock();
  };

  return (
    <ul className="accountList">
      {accounts.map((account) => (
        <li key={account._id}>
          <UserComponent
            isActive={selectedId === account._id}
            user={account}
            onRemove={signoutSession}
            onClick={() => handleSelect(account._id)}
          />
        </li>
      ))}
    </ul>
  );
}
