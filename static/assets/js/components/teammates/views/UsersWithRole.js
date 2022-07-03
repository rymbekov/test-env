import React, { memo } from 'react';
import PropTypes from 'prop-types';
import localization from '../../../shared/strings';
import * as roleHelpers from '../../../store/helpers/roles';
import UsersList from './UsersList';

const UsersWithRole = (props) => {
  const { roles, teammates, actRoleId } = props;
  const roleName = roles.find((role) => role._id === actRoleId).name;
  const users = roleHelpers.getTeammatesWithRole(actRoleId, teammates);

  return (
    <div className="pageItem">
      <Choose>
        <When condition={users.length}>
          <>
            <div className="pageItemTitleSmall">
              {localization.TEAMMATES.usersWithRole}{' '}
              <span className="pageItemTitleColor">{roleName}</span>
            </div>
            <UsersList users={users} isOpenClose className="usersListOpenClose" />
          </>
        </When>
        <Otherwise>
          <div className="pageItemTitleSmall">
            {localization.TEAMMATES.noUsersWithRole}{' '}
            <span className="pageItemTitleColor">{roleName}</span>
          </div>
        </Otherwise>
      </Choose>
    </div>
  );
};

UsersWithRole.propTypes = {
  actRoleId: PropTypes.string.isRequired,
};

export default memo(UsersWithRole);
