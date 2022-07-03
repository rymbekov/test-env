import React from 'react';
import ErrorBoundary from '../ErrorBoundary';

import * as utils from '../../shared/utils';
import localization from '../../shared/strings';
import Logger from '../../services/Logger';
import Tag from '../Tag';
import store from '../../store';
import { isHaveTeammatePermission } from '../../store/helpers/user';
import View from './views/index';
import { navigateToRoot } from '../../helpers/history';
import { showDialog } from '../dialog';

export default function (params) {
  const { user } = store.getState();
  if (user.isTeammate && !isHaveTeammatePermission('manageTeam')) {
    Logger.log('Ui', 'MyTeamDialogShow');

    const usersWithRoleManageTeam = utils.getTeamManagers(
      user,
      store.getState().teammates.items,
      store.getState().roles.items,
    );

    const dialogHtml = (
      <div className="myTeamDialog">
        You do not have permissions to manage your team settings. Please contact
        your team
        {Boolean(usersWithRoleManageTeam.length) && (
          <>
            {' '}
            manager{usersWithRoleManageTeam.length > 1 && 's'}{' '}
            {usersWithRoleManageTeam.slice(0, 5).map((user) => (
              <Tag
                type="user"
                avatar={user.avatar}
                key={user._id}
                text={user.email}
              />
            ))}
          </>
        )}
        if you need to add or delete teammates.
      </div>
    );

    showDialog({
      title: localization.TEAMMATES_DIALOG.title,
      children: dialogHtml,
      textBtnOk: null,
      textBtnCancel: localization.TEAMMATES_DIALOG.btnOk,
      onCancel: () => {
        Logger.log('User', 'MyTeamDialogCancel');
        navigateToRoot();
      },
    });

    return null;
  }

  Logger.log('User', 'SettingsMyTeamShow');

  return (
    <div className="pageWrapper wrapperPageTeam">
      <ErrorBoundary className="errorBoundaryPage">
        <View params={params} />
      </ErrorBoundary>
    </div>
  );
}
