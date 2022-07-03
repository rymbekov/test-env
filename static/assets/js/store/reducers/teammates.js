import { createSlice } from '@reduxjs/toolkit';
import * as Api from '../../api/team';
import * as teamHelpers from '../helpers/teammates';
import store from '../index';
import Logger from '../../services/Logger';
import localization from '../../shared/strings';
import * as utils from '../../shared/utils';
import * as userActions from '../actions/user';
import { showDialog, showErrorDialog } from '../../components/dialog';

const CANCELLED = 'cancelled';
const getState = () => store.getState().teammates;

const teamSlice = createSlice({
  name: 'teammates',
  initialState: {
    loading: false,
    processingIds: [],
    roleChangingIds: [],
    error: null,
    items: [],
  },
  reducers: {
    getTeamStart(state) {
      state.loading = true;
      state.error = null;
    },
    getTeamSuccess(state, action) {
      const { items } = action.payload;
      state.items = items;
      state.loading = false;
      state.error = null;
    },
    getTeamFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Add teammate
    addTeammatesStart(state) {
      state.loading = true;
      state.error = null;
    },
    addTeammatesSuccess(state, action) {
      const { items } = action.payload;
      state.items = items;
      state.loading = false;
      state.error = null;
    },
    addTeammatesFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Remove teammate
    removeTeammateStart(state, action) {
      const { ids } = action.payload;
      state.loading = true;
      state.processingIds = [...state.processingIds, ...ids];
      state.error = null;
    },
    removeTeammateSuccess(state, action) {
      const { items, ids } = action.payload;
      state.loading = false;
      state.processingIds = state.processingIds.filter((id) => !ids.includes(id));
      state.items = items;
      state.error = null;
    },
    removeTeammateFailure(state, action) {
      const { ids } = action.payload;
      state.loading = false;
      state.processingIds = state.processingIds.filter((id) => !ids.includes(id));
      state.error = action.payload;
    },

    // Assign role
    assignRoleStart(state, action) {
      const { ids } = action.payload;
      state.loading = true;
      state.roleChangingIds = [...state.roleChangingIds, ...ids];
      state.error = null;
    },
    assignRoleSuccess(state, action) {
      const { items, ids } = action.payload;
      state.items = items;
      state.loading = false;
      state.roleChangingIds = state.roleChangingIds.filter((id) => !ids.includes(id));
      state.error = null;
    },
    assignRoleFailure(state, action) {
      const { ids, err } = action.payload;
      state.loading = false;
      state.roleChangingIds = state.roleChangingIds.filter((id) => !ids.includes(id));
      state.error = err;
    },

    // Confirm teammate
    confirmTeammateStart(state) {
      state.loading = true;
      state.error = null;
    },
    confirmTeammateSuccess(state, action) {
      const { items } = action.payload;
      state.items = items;
      state.loading = false;
      state.error = null;
    },
    confirmTeammateFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Reject teammate
    rejectTeammateStart(state) {
      state.loading = true;
      state.error = null;
    },
    rejectTeammateSuccess(state, action) {
      const { items } = action.payload;
      state.items = items;
      state.loading = false;
      state.error = null;
    },
    rejectTeammateFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Resend invite to teammate
    resendInviteTeammateStart(state) {
      state.loading = true;
      state.error = null;
    },
    resendInviteTeammateSuccess(state, action) {
      const { items } = action.payload;
      state.items = items;
      state.loading = false;
      state.error = null;
    },
    resendInviteTeammateFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Update teammate
    updateTeammateOptimistic: teamHelpers.updateTeammate,
    updateTeammateFailure: teamHelpers.updateTeammate,
  },
});

export const {
  getTeamStart,
  getTeamSuccess,
  getTeamFailure,
  addTeammatesStart,
  addTeammatesSuccess,
  addTeammatesFailure,
  removeTeammateStart,
  removeTeammateSuccess,
  removeTeammateFailure,
  assignRoleStart,
  assignRoleSuccess,
  assignRoleFailure,
  confirmTeammateStart,
  confirmTeammateSuccess,
  confirmTeammateFailure,
  rejectTeammateStart,
  rejectTeammateSuccess,
  rejectTeammateFailure,
  resendInviteTeammateStart,
  resendInviteTeammateSuccess,
  resendInviteTeammateFailure,
  updateTeammateOptimistic,
  updateTeammateFailure,
} = teamSlice.actions;

export default teamSlice.reducer;

export const getTeam = () => async (dispatch) => {
  try {
    dispatch(getTeamStart());
    const items = await Api.fetchTeam();
    const normalizedTeammates = teamHelpers.normalizeUsers(items);
    dispatch(getTeamSuccess({ items: normalizedTeammates }));
  } catch (err) {
    dispatch(getTeamFailure(err));
  }
};

export const addTeammates = (data) => async (dispatch) => {
  try {
    dispatch(addTeammatesStart());
    const invitedTeammates = await Api.addTeammates(data);
    const result = {
      addedTeammates: [],
      notAddedTeammates: [],
      invitedTeammates,
    };
    if (!invitedTeammates) {
      showErrorDialog(localization.COLLECTIONS.errorTeammateWasntAdded);
      return;
    }
    if (invitedTeammates.length > 1) {
      invitedTeammates.forEach((teammate) => {
        if (teammate.success === false) {
          result.notAddedTeammates.push(teammate);
        } else {
          result.addedTeammates.push(teammate);
        }
      });
    } else if (invitedTeammates.length === 1 && invitedTeammates[0].success === false) {
      result.notAddedTeammates.push(invitedTeammates[0]);
    } else {
      const teammate = invitedTeammates[0];
      teammate.act = true;
      result.addedTeammates.push(teammate);
    }

    const currentTeammates = getState().items;
    const { subscriptionFeatures } = store.getState().user;
    const items = [...currentTeammates, ...teamHelpers.normalizeUsers(result.addedTeammates)];
    dispatch(addTeammatesSuccess({ items }));
    result.invitedTeammates = teamHelpers.normalizeUsers(result.invitedTeammates);
    dispatch(userActions.updateUser({
      subscriptionFeatures: {
        ...subscriptionFeatures,
        teammatesCountIncludingPending: items.length - 1,
      },
    }));

    return result;
  } catch (err) {
    dispatch(addTeammatesFailure(err));
    Logger.error(new Error('Error apply invite'), { error: err }, [
      'ApplyInviteFailed',
      (err && err.message) || 'NoMessage',
    ]);
  }
};

export const removeTeammate = (id) => async (dispatch) => {
  const currentTeammates = getState().items;
  const teammateToRemove = currentTeammates.find((teammate) => teammate._id === id);
  Logger.log('Ui', 'RemoveTeammateDialogShow', { id, email: teammateToRemove.email });
  showDialog({
    title: localization.TEAMMATES.textTitleRemoveTeammate,
    text: localization.TEAMMATES.textTeammateWillRemoved,
    textBtnOk: localization.DIALOGS.btnYes,
    textBtnCancel: localization.DIALOGS.btnNo,
    onCancel: () => {
      Logger.log('User', 'RemoveTeammateDialogNo');
    },
    onOk: async () => {
      Logger.log('User', 'RemoveTeammateDialogYes', teammateToRemove.email);
      try {
        dispatch(removeTeammateStart({ ids: [id] }));
        const result = await Api.removeTeammate(teammateToRemove.email);
        if (result.success) {
          dispatch(
            removeTeammateSuccess({ ids: [id], items: currentTeammates.filter((teammate) => teammate._id !== id) }),
          );
          const { subscriptionFeatures } = store.getState().user;
          const updatedSubscriptionFeatures = {
            ...subscriptionFeatures,
            teammatesCountIncludingPending: subscriptionFeatures.teammatesCountIncludingPending - 1,
          };
          if (teammateToRemove.status === 'Accepted') {
            updatedSubscriptionFeatures.teammatesCount = subscriptionFeatures.teammatesCount - 1;
          }
          dispatch(userActions.updateUser({
            subscriptionFeatures: updatedSubscriptionFeatures,
          }));
        } else {
          dispatch(removeTeammateFailure({ ids: [id] }));
        }
      } catch (err) {
        showErrorDialog(localization.TEAMMATES.textCantRemoveTeammate);
        dispatch(removeTeammateFailure({ ids: [id], err }));
      }
    },
  });
};

export const assignRole = (roleId, teammatesIds) => async (dispatch) => {
  try {
    dispatch(assignRoleStart({ ids: teammatesIds }));
    const roles = store.getState().roles.items;
    const newRole = roles.find((role) => role._id === roleId);
    const teammates = [];
    const currentTeammates = getState().items;
    currentTeammates.forEach((teammate) => {
      if (teammatesIds.includes(teammate._id)) {
        const oldRole = roles.find((role) => role._id === teammate.parent.teammateRoleId);
        teammates.push({
          _id: teammate._id,
          displayName: teammate.displayName,
          oldRole: {
            _id: oldRole._id,
            name: oldRole.name,
          },
        });
      }
    });

    const data = {
      teammates,
      newRole: {
        _id: roleId,
        name: newRole.name,
      },
    };

    try {
      const result = await Api.assignRoleMultiple(data);

      if (result.affectedAssetsCount) {
        await new Promise((resolve, reject) => {
          const {
            TITLE, TEXT_MULTIPLE, OK_TEXT, CANCEL_TEXT,
          } = localization.DIALOGS.ASSIGN_ROLE_WARNING;
          showDialog({
            title: TITLE,
            text: TEXT_MULTIPLE,
            onOk: async () => {
              await Api.assignRoleMultiple({ ...data, force: true });
              resolve();
            },
            textBtnOk: OK_TEXT,
            onCancel: () => {
              reject(CANCELLED);
            },
            textBtnCancel: CANCEL_TEXT,
          });
        });
      }
      const teammatesWithNewRole = currentTeammates.map((teammate) => {
        if (teammatesIds.includes(teammate._id)) {
          const teammateForUpdate = { ...teammate };
          teammateForUpdate.parent = { ...teammateForUpdate.parent };
          teammateForUpdate.parent.teammateRoleId = roleId;
          teammateForUpdate.roleId = roleId;
          teammateForUpdate.roleName = newRole.name;
          return teammateForUpdate;
        }
        return teammate;
      });
      dispatch(assignRoleSuccess({ items: teammatesWithNewRole, ids: teammatesIds }));
    } catch (err) {
      if (err === CANCELLED) {
        Logger.info('Change role for items cancelled by initiator');
      } else {
        Logger.error(new Error('Can not assign role to multiple items'), { error: err, showDialog: true }, [
          'AssignRoleMultipleFailed',
        ]);
      }
      return;
    }
  } catch (err) {
    dispatch(assignRoleFailure({ ids: teammatesIds, err }));
  }
};

export const confirmTeammate = (id) => async (dispatch) => {
  Logger.log('User', 'SettingsMyTeamConfirmTeammate');
  try {
    dispatch(confirmTeammateStart({ id }));
    const currentTeammates = getState().items;
    const { ...teammateToConfirm } = currentTeammates.find((teammate) => teammate._id === id);
    teammateToConfirm.parent = { ...teammateToConfirm.parent };
    delete teammateToConfirm.parent.confirmedByTeam;
    teammateToConfirm.parent.confirmed = true;
    const result = await Api.confirmTeammate(id);
    if (result.success) {
      dispatch(
        confirmTeammateSuccess({
          items: insertNewItem(currentTeammates, ...teamHelpers.normalizeUsers([teammateToConfirm])),
        }),
      );
    } else {
      dispatch(confirmTeammateFailure({ id }));
    }
  } catch (err) {
    showErrorDialog(localization.TEAMMATES.textCantConfirmTeammate);
    Logger.error(new Error('Error confirm teammate'), { Amplitude: 'CantConfirmTeammate', error: err }, [
      'CantConfirmTeammate',
      (err && err.message) || 'NoMessage',
    ]);
    dispatch(confirmTeammateFailure({ id, err }));
  }
};

export const rejectTeammate = (id) => async (dispatch) => {
  Logger.log('User', 'SettingsMyTeamRejectTeammate');
  const currentTeammates = getState().items;

  try {
    dispatch(rejectTeammateStart({ id }));
    const result = await Api.rejectTeammate(id);
    if (result.success) {
      dispatch(rejectTeammateSuccess({ items: currentTeammates.filter((teammate) => teammate._id !== id) }));
    } else {
      dispatch(rejectTeammateFailure({ id }));
    }
  } catch (err) {
    showErrorDialog(localization.TEAMMATES.textCantRejectTeammate);
    Logger.error(new Error('Error reject teammate'), { Amplitude: 'CantRejectTeammate', error: err }, [
      'CantRejectTeammate',
      (err && err.message) || 'NoMessage',
    ]);
    dispatch(rejectTeammateFailure({ id, err }));
  }
};

export const resendInviteTeammate = (id) => async (dispatch) => {
  Logger.log('User', 'SettingsMyTeamReinviteTeammate');
  const currentTeammates = getState().items;
  const { ...teammateToModify } = currentTeammates.find((teammate) => teammate._id === id);
  teammateToModify.parent = { ...teammateToModify.parent };
  teammateToModify.parent.reinvited = true;

  try {
    dispatch(rejectTeammateStart({ id }));
    const result = await Api.resendInviteToTeammate(teammateToModify.email);
    if (result.success) {
      dispatch(
        rejectTeammateSuccess({
          items: insertNewItem(currentTeammates, ...teamHelpers.normalizeUsers([teammateToModify])),
        }),
      );
    } else {
      dispatch(rejectTeammateFailure({ id }));
    }
  } catch (err) {
    showErrorDialog("Can't reinvite teammate");
    Logger.error(new Error('Error reject teammate'), { Amplitude: 'CantReinviteTeammate', error: err }, [
      'CantReinviteTeammate',
      (err && err.message) || 'NoMessage',
    ]);
    dispatch(rejectTeammateFailure({ id, err }));
  }
};

function insertNewItem(array, newItem) {
  return array.map((item) => {
    if (item._id !== newItem._id) {
      // This isn't the item we care about - keep it as-is
      return item;
    }
    // Otherwise, this is the one we want - return an updated value
    return {
      ...newItem,
    };
  });
}

export const updateTeammateByField = (payload) => async (dispatch) => {
  Logger.log('User', 'UpdateTeammate', payload);

  const { teammateId, field, value } = payload;
  const teammates = getState().items;
  const index = teammates.findIndex(({ _id }) => _id === teammateId);
  const prevValue = teammates[index][field];
  const apiSchema = {
    displayName: 'updateName',
    phone: 'updatePhone',
    position: 'updatePosition',
    slackUserId: 'updateSlackUserId',
    twoFactorConfigured: 'resetTwoFactor',
  };
  const requestName = apiSchema[field];

  try {
    dispatch(updateTeammateOptimistic({ index, field, value }));

    const result = await Api[requestName](teammateId, value);
    return result;
  } catch (e) {
    dispatch(updateTeammateFailure({ index, field, value: prevValue }));

		showErrorDialog(localization.TEAMMATES.textCantUpdateTeammate); // eslint-disable-line
    Logger.error(new Error('Error reject update teammate'), { Amplitude: 'CantUpdateTeammate', error: e }, [
      'CantUpdateTeammate',
      (e && e.message) || 'NoMessage',
    ]);
  }
};
