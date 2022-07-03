import { createSlice } from '@reduxjs/toolkit';
import * as Api from '../../api/team';
import * as roleHelpers from '../helpers/roles';
import * as userActions from '../actions/user';
import * as utils from '../../shared/utils';
import store from '../index';
import Logger from '../../services/Logger';
import localization from '../../shared/strings';
import { showDialog } from '../../components/dialog';

const getState = () => store.getState().roles;
const getStoreUser = () => store.getState().user;
const getStoreTeammates = () => store.getState().teammates.items;

const rolesSlice = createSlice({
  name: 'roles',
  initialState: {
    loading: false,
    error: null,
    items: [],
  },
  reducers: {
    getRolesStart(state) {
      state.loading = true;
      state.error = null;
    },
    getRolesSuccess(state, action) {
      const { items } = action.payload;
      state.items = items;
      state.loading = false;
      state.error = null;
    },
    getRolesFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    addRoleStart(state) {
      state.loading = true;
      state.error = null;
    },
    addRoleSuccess(state, action) {
      const { result } = action.payload;
      state.items = [...state.items, result[0]];
      state.loading = false;
      state.error = null;
    },
    addRoleFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    removeRoleStart(state) {
      state.loading = true;
      state.error = null;
    },
    removeRoleSuccess(state, action) {
      const { result, roleId } = action.payload;
      state.items = state.items.filter((role) => role._id !== roleId);
      state.loading = false;
      state.error = null;
    },
    removeRoleFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    updateRoleStart(state, action) {
      const { updating } = action.payload;
      state.loading = updating;
      state.error = null;
    },
    updateRoleSuccess(state, action) {
      const { result } = action.payload;
      state.items = state.items.map((role) => {
        if (role._id !== result._id) {
          return { ...role };
        }
        return { ...result };
      });
      state.loading = false;
      state.error = null;
    },
    updateRoleFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  getRolesStart,
  getRolesSuccess,
  getRolesFailure,
  addRoleStart,
  addRoleSuccess,
  addRoleFailure,
  removeRoleStart,
  removeRoleSuccess,
  removeRoleFailure,
  updateRoleStart,
  updateRoleSuccess,
  updateRoleFailure,
} = rolesSlice.actions;

export default rolesSlice.reducer;

export const getRoles = () => async (dispatch) => {
  try {
    dispatch(getRolesStart());
    let items = await Api.fetchRoles();
    items = roleHelpers.normalizeRoles(items);
    dispatch(getRolesSuccess({ items }));
  } catch (err) {
    dispatch(getRolesFailure(err));
  }
};

export const addRole = (data) => async (dispatch) => {
  Logger.log('User', 'SettingsMyTeamRolesCreate');
  try {
    dispatch(addRoleStart());
    const result = await Api.addRole(data);
    result[0].allowedCollections = [...data.allowedCollections];
    dispatch(addRoleSuccess({ result }));
  } catch (err) {
    dispatch(addRoleFailure(err));
  }
};

export const removeRole = (roleId) => async (dispatch) => {
  Logger.log('User', 'SettingsMyTeamRolesRemove');
  try {
    dispatch(removeRoleStart());
    const teammates = getStoreTeammates();
    const users = roleHelpers.getTeammatesWithRole(roleId, teammates);
    const doDelete = async () => {
      const result = await Api.removeRole(roleId);
      dispatch(removeRoleSuccess({ result, roleId }));
    };

    if (!users.length) {
      Logger.log('UI', 'ConfirmRemoveEmptyRoleDialog');
      showDialog({
        title: localization.TEAMMATES.titleDeleteRole,
        text: localization.TEAMMATES.textDeleteRole,
        textBtnOk: localization.TEAMMATES.btnOkDeleteRole,
        textBtnCancel: localization.DIALOGS.btnCancel,
        onOk() {
          doDelete();
        },
        onCancel() {},
      });
    } else {
      await doDelete();
    }
  } catch (err) {
    dispatch(removeRoleFailure(err));
    const errorMessage = utils.getDataFromResponceError(err, 'msg');
    const errorSubcode = utils.getDataFromResponceError(err, 'subcode');

    if (errorSubcode === 'RoleInUseApiError') {
      showDialog({
        title: localization.TEAMMATES.titleCantRemoveRole,
        text: localization.TEAMMATES.textCantRemoveRole,
        textBtnOk: localization.DIALOGS.btnOk,
        textBtnCancel: null,
      });
    } else {
      showDialog({
        title: localization.TEAMMATES.titleCantRemoveRole,
        text: errorMessage,
        textBtnOk: localization.DIALOGS.btnOk,
        textBtnCancel: null,
        onOk() {},
        onCancel() {},
      });
    }

    Logger.error(
      new Error('Error remove role'),
      { Amplitude: 'CantRemoveRoleDialog', error: err },
      ['CantRemoveRoleDialog', (err && err.message) || 'NoMessage'],
    );
  }
};

export const updateRole = (data, setImmediately = true) => async (dispatch) => {
  const CANCELLED = 'cancelled';
  const setData = () => {
    dispatch(updateRoleSuccess({ result: data }));
    const user = getStoreUser();
    if (data._id === user.role._id) {
      dispatch(userActions.updateUser({ role: data }));
    }
  };

  if (!setImmediately) {
    dispatch(updateRoleStart({ updating: true }));
  } else {
    setData();
  }
  try {
    const response = await Api.updateRole(data);
    if (response.affectedAssetsCount) {
      if (!setImmediately) dispatch(updateRoleStart({ updating: false }));
      return await new Promise((resolve, reject) => {
        const {
          TITLE, TEXT, OK_TEXT, CANCEL_TEXT,
        } = localization.DIALOGS.DISALLOW_COLLECTION;
        showDialog({
          title: TITLE,
          text: TEXT,
          textBtnOk: OK_TEXT,
          onOk: async () => {
            try {
              if (!setImmediately) dispatch(updateRoleStart({ updating: true }));
              const res = await Api.updateRole({ ...data, force: true });
              setData();
              if (!setImmediately) dispatch(updateRoleStart({ updating: false }));
              resolve(res);
            } catch (err) {
              reject(err);
            }
          },
          textBtnCancel: CANCEL_TEXT,
          onCancel: () => {
            reject(CANCELLED);
          },
        });
      });
    }

    if (!setImmediately) {
      dispatch(updateRoleStart({ updating: false }));
      setData();
    }
    return response;
  } catch (err) {
    if (err === CANCELLED) {
      Logger.info('Update role cancelled by initiator');
    } else {
      Logger.error(new Error('Can not update role'), { error: err, data }, [
        'UpdateRoleFailed',
        (err && err.message) || 'NoMessage',
      ]);
    }
    if (!setImmediately) dispatch(updateRoleStart({ updating: false }));
  }
};

export const getRoleById = (id) => getState().items.find((role) => role._id === id);
