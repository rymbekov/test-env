import React from 'react';
import { connect } from 'react-redux';
import cn from 'classnames';
import { bindActionCreators } from 'redux';
import store from '../../../store';
import * as collectionsApi from '../../../api/collections';
import * as rolesActions from '../../../store/reducers/roles';
import * as teamActions from '../../../store/reducers/teammates';
import { checkUserAccess } from '../../../store/helpers/user';
import picsioConfig from '../../../../../../config';

import localization from '../../../shared/strings';
import Logger from '../../../services/Logger';

import Icon from '../../Icon';
import Dialogs from '../../../ui/dialogs';
import ErrorBoundary from '../../ErrorBoundary';

import * as UtilsCollections from '../../../store/utils/collections';
import * as roleHelpers from '../../../store/helpers/roles';
import { navigate } from '../../../helpers/history';
import COLLECTION_PERMISSIONS from '../configs/collectionPermissions';
import ROLE_PERMISSIONS from '../configs/rolePermissions';
import configAddRole from '../dialogs/addRole';
import RoleShort from './RoleShort';
import RoleDetailed from '../../RoleDetailed';
import UpgradePlan from '../../UpgradePlan';
import { showDialog, showErrorDialog } from '../../dialog';

const getDefaultMainPermissions = () => ROLE_PERMISSIONS.reduce((acc, permission) => {
  if (!permission.children?.length) {
    acc[permission.name] = false;
  }
  return acc;
}, {});

const getDefaultRootPermissions = () => COLLECTION_PERMISSIONS.reduce((acc, permission) => {
  if (!permission.children?.length) {
    acc[permission.name] = false;
  }
  return acc;
}, {});

const updateRolePermission = (data, value, permission, configPermissions) => {
  if (permission.children?.length) {
    const newPermissions = {};
    const setPermisionValue = (item, indx, array, force) => {
      if (item.children?.length) {
        if (item.name === permission.name || force) {
          // set value to all children
          item.children.forEach((child, index, arr) => setPermisionValue(child, index, arr, true));
        } else {
          // set value old from data
          item.children.forEach(setPermisionValue);
        }
      }
      newPermissions[item.name] = force ? value : data.permissions[item.name];
    };
    configPermissions.forEach(
      (item, idx, array) => setPermisionValue(item, idx, array, item.name === permission.name)
    );
    data.permissions = newPermissions;
  } else {
    data.permissions[permission.name] = value;
  }
  // turnoff autogenerate is edit keywords is disallowed
  if (permission.name === 'editAssetKeywords' && !value) {
    data.permissions.autogenerateKeywords = false;
  }
};

class Roles extends React.Component {
  rootId = UtilsCollections.getRootId();

  state = {
    dropdownCollections: [],
    actRoleId: null,
    prevActRoleId: null,
    actCollectionId: null,
    actCollectionIds: [],
    isLoaded: false,
    isFetching: false,
  };

  async componentDidMount() {
    this.setState({ isLoaded: false });
    await this.getRootTag();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.actRoleId === null) {
      return {
        actRoleId: nextProps.roles.items[0]._id,
      };
    }

    const actRole = nextProps.roles.items.find((role) => role._id === prevState.actRoleId);
    if (!actRole) return null;

    const isChangedActRole = prevState.prevActRoleId !== actRole._id;
    const isDeletedActCollection = !actRole.allowedCollections.find(
      (n) => n._id === prevState.actCollectionId,
    );
    if (isChangedActRole || isDeletedActCollection) {
      const newAct = actRole.allowedCollections[0];
      return {
        prevActRoleId: actRole._id,
        actCollectionId: newAct ? newAct._id : null,
        actCollectionIds: newAct ? [newAct._id] : null,
      };
    }

    return null;
  }

  isAllowedRootCollections = () => {
    const rootCollectionId = this.rootId;
    const actRole = this.props.roles.items.find((n) => n._id === this.state.actRoleId);
    return actRole.allowedCollections.some((n) => n._id === rootCollectionId);
  };

  async getRootTag() {
    const rootCollection = await collectionsApi.getRoot();
    rootCollection.nodes = await this.fetchChildren(rootCollection._id);
    rootCollection.act = true;
    rootCollection.name = store.getState().collections.collections.my.name;
    this.setState({
      dropdownCollections: [rootCollection],
      isLoaded: true,
    });
  }

  async fetchChildren(id) {
    try {
      return await collectionsApi.getChildren(id, { forceAll: true });
    } catch (error) {
      showErrorDialog(localization.TAGSTREE.errorSomethingWrong, {
        keepOnScreen: true,
      });
      Logger.error(new Error('Roles: can not fetch collection children', { error }));
      return [];
    }
  }

  handleLoadChildren = async (item) => {
    this.setState({ isFetching: true, fetchingId: item._id });
    const children = await this.fetchChildren(item._id);
    item.nodes = children;
    this.setState({
      dropdownCollections: this.state.dropdownCollections,
      isFetching: false,
      fetchingId: null,
    });
  };

  // getPermissionValue = (currentPermission, currentListPermissions, { isCollectionPermission }) => {
  //   if (currentPermission.groupName) {
  //     const configPermissions = isCollectionPermission ? COLLECTION_PERMISSIONS : ROLE_PERMISSIONS;
  //     const values = configPermissions.reduce((acc, item) => {
  //       if (currentPermission.groupName === item.groupName) {
  //         item.children.map((child) => {
  //           acc.push(currentListPermissions[child.name]);
  //         });
  //       }
  //       return acc;
  //     }, []);
  //     if (values.every(Boolean)) return true;
  //     if (values.some(Boolean)) return 'indeterminate';
  //     return false;
  //   }
  //   return currentListPermissions[currentPermission.name];
  // };

  isAllowPermission = (permission) => {
    const isArchiveAllowed = checkUserAccess('subscriptions', 'archive');

    if (permission.group === 'archive' || permission.groupName === 'archive') {
      return isArchiveAllowed;
    }
    return true;
  };

  onClickCollection = (collection, event) => {
    const { metaKey, ctrlKey } = event;
    if (metaKey || ctrlKey) {
      Logger.log('User', 'SettingsMyTeamRoleCollectionSelectWith');
      if (this.state.actCollectionIds.includes(collection._id)) {
        const newActCollectionIds = this.state.actCollectionIds.filter((id) => id !== collection._id);
        if (!newActCollectionIds.length) {
          newActCollectionIds.push(collection._id);
        }
        this.setState({
          actCollectionId: collection._id,
          actCollectionIds: [...newActCollectionIds],
        });
      } else {
        this.setState((state) => ({
          actCollectionId: collection._id,
          actCollectionIds: [...state.actCollectionIds, collection._id],
        }));
      }
    } else {
      Logger.log('User', 'SettingsMyTeamRoleCollectionSelect');
      this.setState({ actCollectionId: collection._id, actCollectionIds: [collection._id] });
    }
  };

  selectedAllCollection = (collections) => {
    const allCollection = [];
    collections.map((collection) => {
      allCollection.push(collection._id);
    });
    Logger.log('User', 'SettingsMyTeamRoleAllCollectionSelect');
    this.setState({ actCollectionIds: [...allCollection] });
  }

  handleAttachCollection = async (collection) => {
    const actRole = this.props.roles.items.find((role) => role._id === this.state.actRoleId);

    const isDetach = false;

    collection = {
      _id: collection._id,
      path: collection.path === 'root' ? '/root' : collection.path + collection.name,
    };

    this.changeRoleCollections(collection, isDetach, actRole);
  };

  detachCollection = async (collection) => {
    const actRole = this.props.roles.items.find((role) => role._id === this.state.actRoleId);
    const isDetach = true;

    const rootCollectionId = this.state.dropdownCollections[0]._id;
    if (rootCollectionId === collection._id) {
      // if root isn't allowed, turn off sync
      const permissionSync = ROLE_PERMISSIONS.find((n) => n.name === 'sync');
      await this.changeRolePermission(permissionSync, false, actRole);
    }

    collection = {
      _id: collection._id,
      path: collection.path + collection.name,
    };

    this.changeRoleCollections(collection, isDetach, actRole);
  };

  handleDetachCollection = async (collection) => {
    const actRole = this.props.roles.items.find((role) => role._id === this.state.actRoleId);

    Logger.log('UI', 'DetachRoleCollectionDialog');
    if (actRole.allowedCollections.length === 1) {
      new Dialogs.Text({
        title: localization.DIALOGS.WARNING_ALLOWED_COLLECTION.TITLE,
        html: localization.DIALOGS.WARNING_ALLOWED_COLLECTION.TEXT,
        dialogConfig: {
          textBtnCancel: 'Cancel',
          onOk: () => {
            Logger.log('User', 'DetachRoleCollectionDialogOk');
            this.detachCollection(collection);
          },
          onCancel: () => Logger.log('User', 'DetachRoleCollectionDialogCancel'),
        },
      });
    } else {
      this.detachCollection(collection);
    }
  };

  handleToggleCollection = (collection) => {
    const actRole = this.props.roles.items.find((role) => role._id === this.state.actRoleId);

    const isDetach = !!actRole.allowedCollections.find((item) => item._id === collection._id);

    isDetach ? this.handleDetachCollection(collection) : this.handleAttachCollection(collection);
  };

  filterAllowedCollections = (e) => {
    const val = e.currentTarget.value.toLowerCase();
    this.state.dropdownCollections.forEach((tag) => {
      tag.hidden = !tag.name.toLowerCase().includes(val);
    });
    this.setState({
      dropdownCollections: this.state.dropdownCollections,
    });
  };

  changeRolePermission = (permission, value, actRole, { actCollectionIds } = {}) => {
    const isCollections = actCollectionIds?.length;
    const data = {
      _id: actRole._id,
      name: actRole.name,
      permissions: { ...actRole.permissions },
      allowedCollections: actRole.allowedCollections.map((item) => ({
        _id: item._id,
        path: item.path,
        permissions: { ...item.permissions },
      })),
    };

    const configPermissions = isCollections ? COLLECTION_PERMISSIONS : ROLE_PERMISSIONS;
    const dataWrapper = !isCollections
      ? data
      : data.allowedCollections.filter((n) => actCollectionIds.includes(n._id));
    if (Array.isArray(dataWrapper)) {
      dataWrapper.forEach((item) => updateRolePermission(item, value, permission, configPermissions));
    } else {
      updateRolePermission(dataWrapper, value, permission, configPermissions);
    }

    const eventName = isCollections
      ? 'SettingsMyTeamChangeCollectionPermission'
      : 'SettingsMyTeamChangeTeamPermission';
    Logger.log('User', eventName, permission.name || permission.groupName);
    return this.props.rolesActions.updateRole(data);
  };

  changeRoleCollections = async (collection, detach, actModel) => {
    let allowedCollections = actModel.allowedCollections ? [...actModel.allowedCollections] : [];
    if (detach) {
      Logger.log('User', 'SettingsMyTeamRoleCollectionDetach');
      allowedCollections = allowedCollections.filter((n) => n._id !== collection._id);
    } else {
      Logger.log('User', 'SettingsMyTeamRoleCollectionAttach');
      allowedCollections.push({
        _id: collection._id,
        path: collection.path,
        permissions: getDefaultRootPermissions(),
      });
    }

    this.props.rolesActions.updateRole(
      {
        _id: actModel._id,
        name: actModel.name,
        permissions: actModel.permissions,
        allowedCollections,
      },
      !detach,
    );
  };

  addRole = async () => {
    Logger.log('User', 'SettingsMyTeamAddRole');
    const config = configAddRole;

    const {
      roles, rolesLimit, planName, team,
    } = this.props;
    if (roles.items.length >= rolesLimit) {
      const { trialEnds } = team;
      const isTrialUser = picsioConfig.isMainApp()
        && !(new Date() > new Date(trialEnds)) && !planName;
      const { TITLE, TEXT, TEXT_OK } = localization.DIALOGS.ROLES_LIMIT_APP;

      Logger.log('UI', 'RolesLimitDialog', { rolesLimit, rolesLength: roles.items.length });
      return showDialog({
        title: TITLE,
        text: TEXT(rolesLimit, isTrialUser),
        textBtnOk: TEXT_OK,
        onOk: () => navigate('/billing?tab=overview'),
      });
    }

    config.onOk = async ({ input }) => {
      Logger.log('User', 'SettingsMyTeamAddRoleDialogOk');
      const value = input && input.trim();

      if (!value) {
        const errorMessageForUser = localization.TEAMMATES.errorNameEmpty;
        Logger.log('UI', 'CantAddRoleDialog', { errorMessageForUser });
        showErrorDialog(errorMessageForUser);
        this.destroySpinner();
        return;
      }

      const isRoleExists = this.props.roles.items.find(
        (n) => n.name.toLowerCase() === value.toLowerCase(),
      );
      if (isRoleExists) {
        const errorMessageForUser = localization.TEAMMATES.dialogTextRoleHaveAlready;
        Logger.log('UI', 'CantAddRoleDialog', { errorMessageForUser });
        return showErrorDialog(errorMessageForUser);
      }

      const { _id } = await UtilsCollections.forceFindRootTag();

      await this.props.rolesActions.addRole({
        name: value,
        permissions: getDefaultMainPermissions(),
        allowedCollections: [{ _id, permissions: getDefaultRootPermissions() }],
      });

      this.selectRole(this.props.roles.items[this.props.roles.items.length - 1]._id);
    };

    config.onCancel = () => Logger.log('User', 'SettingsMyTeamAddRoleDialogCancel');

    Logger.log('UI', 'SettingsMyTeamAddRoleDialog');
    showDialog({ ...config, title: localization.TEAMMATES.titleNewRole });
  };

  removeRole = (role) => {
    // this.initSpinner();
    Logger.log('User', 'SettingsMyTeamRemoveRole');
    const policies = this.props.team.policies || {};
    const { autoInviteRoleId } = policies;

    // can't remove role, because it selected as autoInviteRole
    if (role._id === autoInviteRoleId) {
      roleHelpers.dialogRoleForAutoUnvite();
      // this.destroySpinner();
      return;
    }

    // can't remove role, user have only one role
    if (role._id === this.state.actRoleId) {
      const firstNotActiveRole = this.props.roles.items.find((n) => n._id !== this.state.actRoleId);
      if (firstNotActiveRole) {
        this.selectRole(firstNotActiveRole._id);
      } else {
        roleHelpers.dialogRoleIsOnlyOne();
        // this.destroySpinner();
        return;
      }
    }

    this.props.rolesActions.removeRole(role._id);
  };

  renameRole = (role) => {
    Logger.log('User', 'SettingsMyTeamRenameRole');
    const config = configAddRole;

    config.onOk = ({ input }) => {
      const value = input && input.trim();

      if (!value) {
        showErrorDialog(localization.TEAMMATES.errorNameEmpty);
        return;
      }

      const isRoleExists = this.props.roles.items.find(
        (n) => n.name.toLowerCase() === value.toLowerCase(),
      );
      if (isRoleExists) {
        return showErrorDialog(localization.TEAMMATES.dialogTextRoleHaveAlready);
      }

      this.props.rolesActions.updateRole({
        _id: role._id,
        name: value,
        permissions: role.permissions,
        allowedCollections: role.allowedCollections,
        error: false,
      });
    };

    showDialog({
      ...config,
      title: localization.TEAMMATES.titleEditName(role.name),
      input: {
        value: role.name,
      },
    });
  };

  duplicateRole = async (role) => {
    // this.initSpinner();
    Logger.log('User', 'SettingsMyTeamDuplicateRole');

    const getDuplicatedName = (name) => {
      const proposedName = `Copy of ${name}`;
      const isProposedExist = this.props.roles.items.find((role) => role.name === proposedName);
      if (isProposedExist) {
        return getDuplicatedName(proposedName);
      }
      return proposedName;
    };

    const name = getDuplicatedName(role.name);

    await this.props.rolesActions.addRole({
      name,
      permissions: { ...role.permissions },
      allowedCollections: (role.allowedCollections || []).map((item) => ({
        _id: item._id,
        permissions: { ...item.permissions },
        path: item.path,
      })),
    });

    this.selectRole(this.props.roles.items[this.props.roles.items.length - 1]._id);
  };

  selectRole = (id) => {
    Logger.log('User', 'SettingsMyTeamSelectRole');
    this.setState({ actRoleId: id });
  };

  render() {
    const { props, state } = this;
    const {
      roles, rolesLimit = 1, teammates, storageType,
    } = props;
    const actRole = roles.items.find((role) => role._id === state.actRoleId);
    const isAllowedRootCollection = this.isAllowedRootCollections();
    const isNotAllowed = rolesLimit <= roles.items.length;
    return (
      <div className="pageTabsContentRoles">
        <div className="pageTeam__leftSidebar">
          <div className="pageTeam__leftSidebar__createLink">
            <div className={cn('pageTeam__leftSidebar__createRole', { isNotAllowed })} onClick={this.addRole}>
              <Icon name="roundPlus" />
              {localization.TEAMMATES.textCreateNew}
            </div>
            <If condition={isNotAllowed}>
              <UpgradePlan tooltip={localization.UPGRADE_PLAN.tooltipPlanLimitations} />
            </If>
          </div>
          <div className="pageTeam__leftSidebar__listRoles">
            {roles.items.map((role) => (
              <ErrorBoundary key={role.name}>
                <RoleShort
                  key={role.name}
                  role={role}
                  actRoleId={state.actRoleId}
                  selectRole={this.selectRole}
                  removeRole={this.removeRole}
                  renameRole={this.renameRole}
                  duplicateRole={this.duplicateRole}
                  dropdownCollections={state.dropdownCollections}
                  actCollectionId={state.actCollectionId}
                  isLoading={!state.isLoaded || roles.loading}
                  roles={roles.items}
                  teammates={teammates.items}
                  changeRolePermission={this.changeRolePermission}
                  isAllowPermission={this.isAllowPermission}
                  isAllowedRootCollection={isAllowedRootCollection}
                  handleToggleCollection={this.handleToggleCollection}
                  handleDetachCollection={this.handleDetachCollection}
                  onClickCollection={this.onClickCollection}
                  handleLoadChildren={this.handleLoadChildren}
                  isFetching={state.isFetching}
                  fetchingId={state.fetchingId}
                  rolesLimit={rolesLimit}
                  storageType={storageType}
                />
              </ErrorBoundary>
            ))}
          </div>
        </div>
        <div className="pageTeam__role">
          <If condition={actRole}>
            <ErrorBoundary>
              <RoleDetailed
                dropdownCollections={state.dropdownCollections}
                actRole={actRole}
                actCollectionId={state.actCollectionId}
                actCollectionIds={state.actCollectionIds}
                isLoading={!state.isLoaded || roles.loading}
                roles={roles.items}
                teammates={teammates.items}
                changeRolePermission={this.changeRolePermission}
                isAllowPermission={this.isAllowPermission}
                isAllowedRootCollection={isAllowedRootCollection}
                handleToggleCollection={this.handleToggleCollection}
                handleDetachCollection={this.handleDetachCollection}
                onClickCollection={this.onClickCollection}
                onClickSelectedAllCollection={this.selectedAllCollection}
                handleLoadChildren={this.handleLoadChildren}
                isFetching={state.isFetching}
                fetchingId={state.fetchingId}
                storageType={storageType}
              />
            </ErrorBoundary>
          </If>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  team: state.user.team,
  roles: state.roles,
  teammates: state.teammates,
  planName: state.user.subscriptionFeatures.planName,
  rolesLimit: state.user.subscriptionFeatures.rolesLimit,
  storageType: state.user.storageType,
});
const mapDispatchToProps = (dispatch) => ({
  rolesActions: bindActionCreators(rolesActions, dispatch),
  teamActions: bindActionCreators(teamActions, dispatch),
});
const ConnectedRoles = connect(mapStateToProps, mapDispatchToProps)(Roles);

export default ConnectedRoles;
