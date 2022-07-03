import React from 'react';
import ErrorBoundary from '../ErrorBoundary';
import * as utils from '../../shared/utils';
import store from '../../store';
import Tag from '../Tag';
import './styles.scss';

export default function () {
  const usersWithRoleManageTeam = utils.getTeamManagers(
    store.getState().user,
    store.getState().teammates.items,
    store.getState().roles.items,
  );

  return (
    <ErrorBoundary className="errorBoundaryPage">
      <div className="catalogViewPlaceholderText">
        <div className="catalogViewPlaceholderTextInner">
          <h2>No permissions</h2>
          You do not have permissions to access any collection. Please contact your team
          {Boolean(usersWithRoleManageTeam.length) && (
            <>
              {' '}
              manager{usersWithRoleManageTeam.length > 1 && 's'}{' '}
              {usersWithRoleManageTeam.slice(0, 5).map((user) => (
                <Tag type="user" avatar={user.avatar} key={user._id} text={user.email} />
              ))}
            </>
          )}
          to get access.
          <br />
          <br />
          When access granted please reload this page.
        </div>
      </div>
    </ErrorBoundary>
  );
}
