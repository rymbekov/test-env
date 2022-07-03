import React from 'react';
import cn from 'classnames';
import { ReactSelect } from '../../../UIComponents';
import localization from '../../../shared/strings';
import UsersList from './UsersList';

/**
 * SelectedUsers
 * @param {Object} props
 * @param {Array} props.users
 * @param {Array} props.selectedUsersIds
 * @param {Array} props.roles
 * @param {Object} props.invitingRole
 * @param {Object} props.assignRoleToTeammates
 * @param {Function} props.deselectUser
 * @param {Function} props.clearSelectedUsers
 * @returns {JSX}
 */
export default function SelectedUsers({
  isLoading,
  users,
  selectedUsersIds,
  invitingRole,
  assignRoleToTeammates,
  deselectUser,
  clearSelectedUsers,
  roleOptions,
}) {
  const selectedUsers = [];
  selectedUsersIds.forEach((id) => {
    const findedUser = users.find((user) => user._id === id);
    if (findedUser) {
      selectedUsers.push(findedUser);
    }
  });

  const selectedUsersRoles = selectedUsers.map((user) => ({
    roleId: user.roleId,
    roleName: user.roleName,
  }));
  if (!selectedUsersRoles.every((role, i, arr) => role.roleId === arr[0].roleId)) {
    invitingRole = false;
  } else {
    invitingRole = { value: selectedUsersRoles[0].roleId, label: selectedUsersRoles[0].roleName };
  }

  const selectedUsersTitle = `${selectedUsers.length} users`;

  return (
    <div className={cn('myTeamSelectedUsers')}>
      <div className="myTeamSelectedUsersTitle">
        {selectedUsersTitle}{' '}
        <span className="picsioLink" onClick={clearSelectedUsers}>
          {localization.TEAMMATES.reset}
        </span>
      </div>
      <UsersList
        users={selectedUsers}
        remove={deselectUser}
        isOpenClose
        className="usersListOpenClose"
      />
      <div className="myTeamSelectedUsersParams">
        <div className="myTeamSelectedUsersSelectRole">
          <ReactSelect
            label={localization.TEAMMATES.labelSelectRole}
            options={roleOptions}
            value={invitingRole}
            onChange={({ value }) => {
              assignRoleToTeammates(value, selectedUsersIds);
            }}
            placeholder={!invitingRole ? 'Several different roles' : null}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
