import React from 'react';
import { Hidden } from '@picsio/ui';

import { Provider, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import debounce from 'lodash.debounce';
import cn from 'classnames';
import { loadAuth2 } from 'gapi-script';
import picsioConfig from '../../../../../../config';
import * as utils from '../../../shared/utils';
import localization from '../../../shared/strings';
import Logger from '../../../services/Logger';
import * as Api from '../../../api/team';
import Creator from '../../Creator';

/** Store */
import store from '../../../store';
import * as userActions from '../../../store/actions/user';
import * as rolesActions from '../../../store/reducers/roles';
import * as teamActions from '../../../store/reducers/teammates';
import { prepareUsersGroups } from '../helpers/teammates';
import InvitingResult from './InvitingResult';
import InvitingBlock from './InvitingBlock';
import SelectedUsers from './SelectedUsers';
import TeamUserDetails from './TeamUserDetails';
import TeamUser from './TeamUser';
import SearchBar from '../../SearchBar';
import * as api from '../../../api/index';
import Toast from '../../Toast';
import Tooltip from '../../Tooltip';
import { teammatesSelector } from '../../../store/selectors/teammates';
import { showDialog, showErrorDialog } from '../../dialog';

class Teammates extends React.Component {
  oldValue = null;

  constructor(props) {
    super(props);

    this.state = {
      teammates: {},
      invitedEmails: [],
      invitedUsers: [],
      filteredUsers: null,
      selectedUsersIds: [],
      invitingRole: {
        value: this.props.roles[0]._id || null,
        label: this.props.roles[0].name || null,
      },
      invitingTeammate: true,
      showInvitingResult: false,
      invitingResult: [],
      collapsedUserGroups: [],
      selectedUserId: '',
      removingTeammateId: null,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.teammates !== state.teammates) {
      const roleOptions = props.roles.map((role) => ({
        value: role._id,
        label: role.name,
      }));

      let filteredUsers = state.filteredUsers || null;
      if (filteredUsers && filteredUsers.length) {
        filteredUsers = filteredUsers
          .map((filteredUser) => {
            const user = props.teammatesList.find((user) => user._id === filteredUser._id);
            if (user) {
              return user;
            }
            return false;
          })
          .filter(Boolean);
      }

      const usersToShow =
        filteredUsers && filteredUsers.length ? filteredUsers : props.teammatesList;
      const usersGroups = prepareUsersGroups(usersToShow);

      // show invitation form after deleting teammate
      let { invitingTeammate, removingTeammateId } = state;
      if (removingTeammateId && !props.teammates.processingIds.includes(removingTeammateId)) {
        if (!invitingTeammate && removingTeammateId) {
          invitingTeammate = true;
          removingTeammateId = null;
        }
      }

      return {
        teammates: props.teammates,
        usersGroups,
        roleOptions,
        filteredUsers,
        invitingTeammate,
        removingTeammateId,
      };
    }
    return null;
  }

  searchTeammates = (value) => {
    value = value.toLowerCase();
    const users = [...this.props.teammatesList];
    let filteredUsers = null;
    let usersGroups = {};
    let selectedUsersIds = [];
    if (value) {
      filteredUsers = users.filter((user) => {
        if (
          user.displayName.toLowerCase().includes(value) ||
          user.email.toLowerCase().includes(value) ||
          user.roleName.toLowerCase().includes(value)
        )
          return user;
      });
      selectedUsersIds = filteredUsers
        .map((user) => {
          if (user.roleName === localization.TEAMMATES.textTeamOwner) {
            return null;
          }
          return user._id;
        })
        .filter(Boolean);

      if (filteredUsers && filteredUsers.length === 1) {
        this.setActiveUser(filteredUsers[0].id);
        selectedUsersIds = [];
      }
    }

    const usersToShow = filteredUsers || users;
    usersGroups = prepareUsersGroups(usersToShow);

    this.setState({
      filteredUsers,
      usersGroups,
      selectedUsersIds,
      searchValue: value,
      invitingTeammate: false,
    });
  };

  selectTeammateRole = (role) => {
    this.setState({ invitingRole: role });
  };

  addTeammate = () => {
    this.setState({
      invitingTeammate: true,
      selectedUsersIds: [],
      showInvitingResult: false,
      invitingResult: [],
    });
  };

  cancelAddTeammate = () => {
    this.setState({
      invitingTeammate: false,
      invitedEmails: [],
    });
  };

  showInviteResultDialog = (result) => {
    if (result.invitedTeammates) {
      if (result.invitedTeammates.length === 1 && !result.notAddedTeammates.length) {
        this.setActiveUser(result.invitedTeammates[0]._id);
        Logger.log('UI', 'SettingsMyTeamInvitingResultShow', 1);
      } else {
        this.setState({ invitingResult: result, showInvitingResult: true, selectedUserId: '' });
      }
    }
  };

  hideInvitingResult = () => {
    this.setState({ showInvitingResult: false, invitingResult: [] });
  };

  applyInviteFromGSuite = async () => {
    Logger.log('User', 'SettingsMyTeamInviteGSuiteTeammates');
    const auth2 = await loadAuth2(picsioConfig.google.gSuiteApp, '');
    const user = auth2.currentUser.get();
    this.props.handlers.onInitSpinner();

    user
      .grantOfflineAccess({
        scope: 'https://www.googleapis.com/auth/admin.directory.user.readonly',
      })
      .then((res) => {
        api
          .get('/teammates/usersFromGSuite', { params: { code: res.code } })
          .then((res) => {
            const { users } = res;
            const currentUsersEmails = this.props.teammatesList.map((user) => user.email);
            const emails = users
              .map((user) => user.email)
              .filter((email) => !currentUsersEmails.includes(email));
            Logger.log('User', 'SettingsMyTeamInviteGSuiteTeammatesResult', emails.length);
            const invitedEmails = [...this.state.invitedEmails, ...emails];
            this.setState({ invitedEmails: [...new Set(invitedEmails)], invitedUsers: users });
            this.props.handlers.onDestroySpinner();
          })
          .catch((error) => {
            this.props.handlers.onDestroySpinner();
            const errorSubcode = utils.getDataFromResponceError(error, 'subcode');
            if (errorSubcode === 'CantGetResourceFromGSuiteError') {
              Logger.log('UI', 'CantGetResourceFromGSuiteDialog');
              return showErrorDialog(localization.TEAMMATES.gSuiteNotAllowed);
            }
            if (errorSubcode === 'NotAuthorizedToGetResourceFromGSuiteError') {
              Logger.log('UI', 'NotAuthorizedToGetResourceFromGSuiteDialog');
              return showErrorDialog(
                localization.TEAMMATES.notAuthorizedToGetResourceFromGSuite
              );
            }
            Logger.error(new Error('Can not load users from GSuite'), { error, showDialog: true }, [
              'showWriteToSupportDialog',
              (error && error.message) || 'NoMessage',
            ]);
          });
      })
      .catch((error) => {
        this.props.handlers.onDestroySpinner();
        Logger.warn(error, { error });
        const errorSubcode = utils.getDataFromResponceError(error, 'subcode');
        if (error.error === 'popup_closed_by_user') {
        } else if (errorSubcode === 'CantGetResourceFromGSuiteError') {
          Logger.log('UI', 'CantGetResourceFromGSuiteDialog');
          showErrorDialog(localization.TEAMMATES.gSuiteNotAllowed);
        }
      });
  };

  applyMultipleInvite = async () => {
    const emails = this.state.invitedEmails;
    Logger.log('User', 'SettingsMyTeamInviteNewTeammates', { emails });
    const { value: roleId } = this.state.invitingRole;
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i].trim().toLowerCase();

      // spammers
      if (email.endsWith('@qq.com')) {
        Logger.log('UI', 'SpammersDialog', '@qq.com');
        showDialog({
          title: localization.TEAMMATES.qqcomTitle,
          text: localization.TEAMMATES.qqcomText,
          textBtnCancel: null,
        });
      }

      if (!email.length) {
        showErrorDialog(localization.TEAMMATES.errorEmailEmpty);
        return;
      }

      if (this.props.user.email === email) {
        showErrorDialog(localization.TEAMMATES.errorCantAddYourself);
        return;
      }

      if (!utils.isValidEmailAddress(email)) {
        showErrorDialog(localization.TEAMMATES.errorEmailInvalid(email));
        return;
      }

      if (
        this.props.teammatesList.length - 1 >=
        this.props.user.subscriptionFeatures.teammatesLimit
      ) {
        showErrorDialog(localization.TEAMMATES.errorHaveReachedLimit);
        return;
      }
    }

    // check if a teammate is already exists
    if (emails.length === 1) {
      const teammate = this.props.teammatesList.find((n) => n.email === emails[0]);
      if (teammate) {
        return showErrorDialog(localization.COLLECTIONS.errorTeammatesWasntAdded);
      }
    }

    const invitedUsers = this.state.invitedUsers || [];
    const users = emails.map((email) => {
      if (invitedUsers.length) {
        const invitedUser = invitedUsers.find((user) => user.email === email);
        if (invitedUser) {
          const user = {
            email: invitedUser.email,
            roleId,
          };

          const displayName =
            (invitedUser.name && invitedUser.name.fullName) || invitedUser.displayName;
          if (displayName) {
            user.displayName = displayName;
          }
          if (invitedUser.avatar) {
            user.avatar = invitedUser.avatar;
          }

          return user;
        }
      }
      return {
        email,
        roleId,
      };
    });

    this.props.handlers.onInitSpinner();

    try {
      const result = await this.props.teamActions.addTeammates({ users });
      this.cancelAddTeammate();
      this.props.handlers.onDestroySpinner();
      this.showInviteResultDialog(result);
    } catch (err) {
      this.cancelAddTeammate();
      this.props.handlers.onDestroySpinner();
    }
  };

  updateInvitedEmails = (value) => {
    this.setState({ invitedEmails: [...value] });
  };

  setActiveUser = (id) => {
    this.cancelAddTeammate();
    this.hideInvitingResult();
    this.setState({ selectedUserId: id });
    if (this.state.selectedUsersIds.length) this.clearSelectedUsers();
  };

  selectUser = (id) => {
    Logger.log('User', 'SettingsMyTeamSelectUser');
    if (!this.state.selectedUsersIds.length) this.setActiveUser(id);
    const selectedUsersIds = [...this.state.selectedUsersIds];
    selectedUsersIds.push(id);
    this.setState({ selectedUsersIds });
  };

  deselectUser = (id) => {
    Logger.log('User', 'SettingsMyTeamDeselectUser');
    let selectedUsersIds = [...this.state.selectedUsersIds];
    selectedUsersIds = selectedUsersIds.filter((userId) => userId !== id);
    this.setState({ selectedUsersIds });
  };

  selectOneUser = (id) => {
    Logger.log('User', 'SettingsMyTeamSelectOneUser');
    this.setActiveUser(id);
    const selectedUsersIds = [id];
    this.setState({ selectedUsersIds });
  };

  toggleUser = (event, id) => {
    event.stopPropagation();
    if (this.state.selectedUsersIds.includes(id)) {
      this.deselectUser(id);
    } else {
      this.selectUser(id);
    }
  };

  setUserName = (name) => {
    Logger.log('User', 'SettingsMyTeamSetUserName');
    const invitedUsers = [...this.state.invitedUsers];
    if (this.state.invitedEmails.length === 1) {
      const user = {
        email: this.state.invitedEmails[0],
        displayName: name,
      };

      invitedUsers[0] = user;

      this.setState({ invitedUsers });
    }
  };

  clearSelectedUsers = () => {
    this.setState({ selectedUsersIds: [] });
  };

  changeTeammatePassword = async (password, email) => {
    Logger.log('User', 'SettingsMyTeamChangeTeammatePassword');
    let res;
    try {
      res = await Api.changeTeammatePassword({ email, password });
    } catch (error) {
      Logger.error(new Error('Can not change teammate password'), { error }, [
        'ChangeTeammatePasswordFailed',
        (error && error.message) || 'NoMessage',
      ]);
      Logger.log('UI', 'CantChangeTeammatePasswordDialog');
      let errorMessage = localization.TEAMMATES.errorCantSetPassword;
      const errorSubcode = utils.getDataFromResponceError(error, 'subcode');
      if (errorSubcode === 'UnauthorizedPasswordChangeError') {
        errorMessage = utils.getDataFromResponceError(error, 'msg');
      }
      showErrorDialog(errorMessage);
    }

    if (res) {
      Toast(localization.TEAMMATES.textPasswordSet);
    }
  };

  handleUserGroupClick = (group) => {
    let { collapsedUserGroups } = this.state;
    if (collapsedUserGroups.includes(group)) {
      collapsedUserGroups = collapsedUserGroups.filter((stateGroup) => stateGroup !== group);
    } else {
      collapsedUserGroups = [...collapsedUserGroups, group];
    }

    this.setState({ collapsedUserGroups });
  };

  handleRemoveTeammate = async (id) => {
    this.setState({ removingTeammateId: id });
    this.props.teamActions.removeTeammate(id);
  };

  renderUser = (user) => {
    const { state, props } = this;

    return (
      <TeamUser
        key={user._id}
        user={user}
        roleChangingIds={state.teammates.roleChangingIds}
        processingIds={state.teammates.processingIds}
        roles={props.roles}
        toggleUser={this.toggleUser}
        selectOneUser={this.selectOneUser}
        setActiveUser={this.setActiveUser}
        changeTeammatePassword={this.changeTeammatePassword}
        removeTeammate={this.handleRemoveTeammate}
        sendInviteToTeammate={props.teamActions.resendInviteTeammate}
        assignRoleToTeammate={props.teamActions.assignRole}
        updateUser={props.userActions.updateUser}
        updateTeammateByField={props.teamActions.updateTeammateByField}
        isCurrentUser={user._id === props.user._id}
        isSelected={state.selectedUsersIds.includes(user._id)}
        isActive={!state.invitingTeammate && user._id === state.selectedUserId}
        isCheckboxVisible={Boolean(state.selectedUsersIds.length)}
        isShowTeammateAnalytics={props.user.subscriptionFeatures.teammateAnalytics}
        isAllowManageTeam={props.user.role.permissions.manageTeam}
      />
    );
  };

  renderUserGroups = () => {
    const { usersGroups, collapsedUserGroups } = this.state;

    return Object.keys(usersGroups).map((group) =>
      usersGroups[group].users.length ? (
        <div key={group} className="userGroups">
          <Tooltip content={usersGroups[group].description} placement="right">
            <div
              className={cn('userGroupsOpener', { isClosed: collapsedUserGroups.includes(group) })}
              onClick={() => this.handleUserGroupClick(group)}
            >
              {usersGroups[group].name} <sup>{usersGroups[group].users.length}</sup>
            </div>
          </Tooltip>
          <TransitionGroup className="userGroup">
            {!collapsedUserGroups.includes(group) &&
              usersGroups[group].users.map((user, index) => (
                <CSSTransition key={index} timeout={200} classNames="fade">
                  <>{this.renderUser(user)}</>
                </CSSTransition>
              ))}
          </TransitionGroup>
        </div>
      ) : null
    );
  };

  render() {
    const { props, state } = this;
    const activeUser = props.teammatesList.find((user) => user._id === state.selectedUserId);
    let isTeammatesLimitExceeded = false;
    if (
      this.props.user.subscriptionFeatures.teammatesCountIncludingPending >=
      this.props.user.subscriptionFeatures.teammatesLimit
    ) {
      isTeammatesLimitExceeded = true;
    }

    const InvitingComponent = (
      <InvitingBlock
        roleOptions={state.roleOptions}
        invitingRole={state.invitingRole}
        invitedEmails={state.invitedEmails}
        invitedUsers={state.invitedUsers}
        selectTeammateRole={this.selectTeammateRole}
        updateInvitedEmails={this.updateInvitedEmails}
        applyMultipleInvite={this.applyMultipleInvite}
        applyInviteFromGSuite={this.applyInviteFromGSuite}
        isTeammatesLimitExceeded={isTeammatesLimitExceeded}
        setUserName={this.setUserName}
      />
    );

    return (
      <div className="pageTabsContentTeammate">
        <div className="pageTeam__leftSidebar">
          <SearchBar
            applySearch={debounce(this.searchTeammates, 50)}
            placeholder="Search teammates"
            defaultValue={state.searchValue}
            openedTree={props.openedTree}
            autoFocus
          />
          <Creator
            text={localization.TEAMMATES.textInviteNewTeammate}
            size={50}
            onCreate={this.addTeammate}
            isActive={state.invitingTeammate}
          />
          {state.invitingTeammate && InvitingComponent}
          <div className="pageTeam__leftSidebar__users">
            {state.usersGroups && this.renderUserGroups()}
          </div>
        </div>
        <div className="pageTeam__user">
          {state.showInvitingResult && <InvitingResult result={state.invitingResult} />}
          {state.invitingTeammate ? (
            InvitingComponent
          ) : state.selectedUsersIds.length > 1 ? (
            <SelectedUsers
              isLoading={state.teammates.loading}
              users={props.teammatesList}
              selectedUsersIds={state.selectedUsersIds}
              roles={props.roles}
              deselectUser={this.deselectUser}
              assignRoleToTeammates={props.teamActions.assignRole}
              invitingRole={props.invitingRole}
              clearSelectedUsers={this.clearSelectedUsers}
              roleOptions={state.roleOptions}
            />
          ) : activeUser ? (
            <Hidden implementation="js" desktopDown>
              <TeamUserDetails
                key={activeUser._id}
                user={activeUser}
                isLoading={state.teammates.loading}
                roleChangingIds={state.teammates.roleChangingIds}
                roles={props.roles}
                changeTeammatePassword={this.changeTeammatePassword}
                assignRoleToTeammate={props.teamActions.assignRole}
                confirmTeammate={props.teamActions.confirmTeammate}
                rejectTeammate={props.teamActions.rejectTeammate}
                sendInviteToTeammate={props.teamActions.resendInviteTeammate}
                removeTeammate={this.handleRemoveTeammate}
                updateUser={props.userActions.updateUser}
                updateTeammateByField={props.teamActions.updateTeammateByField}
                isCurrentUser={props.user._id === activeUser._id}
                isShowTeammateAnalytics={props.user.subscriptionFeatures.teammateAnalytics}
                isAllowManageTeam={props.user.role.permissions.manageTeam}
              />
            </Hidden>
          ) : null}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  roles: state.roles.items,
  teammates: state.teammates,
  teammatesList: teammatesSelector(state),
  subscriptionFeatures: state.user.subscriptionFeatures || {},
});
const mapDispatchToProps = (dispatch) => ({
  userActions: bindActionCreators(userActions, dispatch),
  rolesActions: bindActionCreators(rolesActions, dispatch),
  teamActions: bindActionCreators(teamActions, dispatch),
});
const ConnectedTeammates = connect(mapStateToProps, mapDispatchToProps)(Teammates);

export default (props) => (
  <Provider store={store}>
    <ConnectedTeammates {...props} />
  </Provider>
);
