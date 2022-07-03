import React from 'react';
import ReactDOM from 'react-dom';
import Logger from '../../services/Logger';
import localization from '../../shared/strings';
import { showDialog } from '../../components/dialog';
import { navigate } from '../../helpers/history';

/**
 * Show Can't remove role dialog. Role used by AutoInvite.
 * @param {Object},
 */
export function dialogRoleForAutoUnvite() {
  Logger.log('UI', 'CantRemoveRoleDialog');
  showDialog({
    title: localization.TEAMMATES.titleWarning,
    children: localization.TEAMMATES.textRemoveAutoinviteRole(() => {
      navigate('/teammates?tab=settings');
      ReactDOM.unmountComponentAtNode(document.querySelector('.wrapperDialog'));
    }),
    textBtnOk: localization.DIALOGS.btnOk,
    textBtnCancel: null,
    onOk() {},
    onCancel() {},
  });
}

/**
 * Show Can't remove role dialog. User have only one role
 * @param {Object},
 */
export function dialogRoleIsOnlyOne() {
  Logger.log('UI', 'CantRemoveRoleDialog');
  showDialog({
    title: localization.TEAMMATES.titleCantRemoveRole,
    text: localization.TEAMMATES.textRemoveOnlyOneRole,
    textBtnOk: localization.DIALOGS.btnOk,
    textBtnCancel: null,
    onOk() {},
    onCancel() {},
  });
}

/**
 * This helper allow us to get all teammates with some roleId
 * @param {Object},
 */
export function getTeammatesWithRole(roleId, teammates) {
  return teammates.reduce((acc, teammate) => {
    const { parent } = teammate;
    const teammateRoleId = parent && parent.teammateRoleId;

    if (teammateRoleId === roleId) {
      acc.push({
        _id: teammate._id,
        displayName: teammate.displayName,
        email: teammate.email.toLowerCase(),
        avatar: teammate.avatar,
      });
    }
    return acc;
  }, []);
}

export function normalizeRoles(roles) {
  return roles.map((item) => {
    const role = { ...item };
    // In some cases we can lost role.name.
    // So it is a visual helper for team-managers. They can rename this role.
    if (!role.name) {
      role.name = 'Role name is undefined';
      role.error = 'nameError';
    }

    return role;
  });
}
