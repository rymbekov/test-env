import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button as PicsioButton } from '@picsio/ui';

import Avatar from '../../Avatar';
import { ReactSelect, Input, Button } from '../../../UIComponents';
import Icon from '../../Icon';

import localization from '../../../shared/strings';
import * as Api from '../../../api/team';
import { normalizeUserAvatarSrc } from '../../../store/helpers/teammates';
import TeammateStatus from './TeammateStatus';
import AnalyticsTab from './AnalyticsTab';
import UserInfoEdit from './UserInfoEdit';

function TeamUserDetails(props) {
  const {
    user,
    isLoading,
    roleChangingIds,
    roles,
    changeTeammatePassword,
    sendInviteToTeammate,
    assignRoleToTeammate,
    confirmTeammate,
    rejectTeammate,
    removeTeammate,
    updateUser,
    updateTeammateByField,
    isCurrentUser,
    isShowTeammateAnalytics,
    isAllowManageTeam,
  } = props;
  const [initialPassword, setInitialPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setProcessing] = useState(false);
  const [userMetric, setUserMetric] = useState({});
  const [userMetricFetching, setUserMetricFetching] = useState();

  const { _id: userId, isOwner } = user;
  // const isManagingTeammateDisabled = !isCurrentUser && user.status === 'Accepted' ? false : isAllowManageTeam;
  const isManagingTeammateEnabled = !isCurrentUser && user.status === 'Accepted' ? isAllowManageTeam : false;
  const deleteBTnText = isCurrentUser ? 'Remove from the team' : 'Delete User';
  const getProcessing = () => {
    if (isLoading && roleChangingIds.includes(user._id)) {
      setProcessing(true);
    } else {
      setProcessing(false);
    }
  };

  useEffect(() => {
    getProcessing();
  }, [isLoading, roleChangingIds]);

  useEffect(() => {
    getProcessing();
    setPassword('');

    fetchRatingData();
  }, [user]);

  const fetchRatingData = async () => {
    setUserMetricFetching(true);

    try {
      const teammatesStatsRating = await Api.fetchTeammatesStats();
      const haveMetricsForCurrentUser = teammatesStatsRating.feed.some((i) => i._id == user._id);

      if (haveMetricsForCurrentUser) {
        teammatesStatsRating.feed.forEach((index) => {
          if (index._id === user._id) {
            setUserMetric({
              asset_created: index.asset_created,
              asset_comment_added: index.asset_comment_added,
              assets_assigned: index.assets_assigned,
              asset_revision_created: index.asset_revision_created,
            });
            setUserMetricFetching(false);
          }
        });
      } else {
        setUserMetric({
          asset_created: 'n/a',
          asset_comment_added: 'n/a',
          assets_assigned: 'n/a',
          asset_revision_created: 'n/a',
        });
        setUserMetricFetching(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const roleOptions = roles.map((role) => ({
    value: role._id,
    label: role.name,
  }));

  const handleInputPasswordFocus = () => {
    setInitialPassword(password);
  };

  const handleInputPasswordBlur = (event) => {
    event.target.blur();
    const trimmed = password && password.trim();

    if (trimmed.length < 8) {
      setPasswordError(localization.TEAMMATES.errorPasswordMin);
      return;
    }
    if (trimmed.length > 128) {
      setPasswordError(localization.TEAMMATES.errorPasswordMax);
      return;
    }
    setPasswordError('');

    if (initialPassword !== trimmed) {
      changeTeammatePassword(trimmed, user.email);
    }
  };

  const handleInputPassword = (event) => {
    const ENTER = 13;
    const ESC = 27;

    switch (event.keyCode) {
    case ENTER: {
      event.stopPropagation();
      handleInputPasswordBlur(event);
      break;
    }
    case ESC: {
      event.stopPropagation();
      setPassword('');
      break;
    }
    default:
      break;
    }
  };

  const handleChangeRole = ({ value }) => {
    assignRoleToTeammate(value, [user._id]);
  };

  const disabledSetPassword = !user.parent
    || user.parent.confirmedByTeam === false
    || (user.parent.confirmed && user.visitedAt !== localization.TEAMMATES.textNoAnswer);
  const canShowAnalytics = user.status === 'Accepted' || user.status === 'owner';
  const userAvatar = normalizeUserAvatarSrc(user.avatarOriginal, 'large', true);

  return (
    <div className="pageTeam__user__inner">
      <div className="pageTeam__user__userLogo">
        <Avatar src={userAvatar} username={user.displayName} size={140} />
      </div>
      <div className="pageItemTitle pageTeam__user__userName">{user.displayName}</div>
      <If condition={user.isOwner}>
        <span className="pageTeam__user__roleTeamowner">
          <Icon name="crown" /> {localization.TEAMMATES.textTeamOwner}
        </span>
      </If>
      <div className="pageTeam__user__userMail">{user.email}</div>
      <If condition={user.status === 'Requested'}>
        <div className="teamUserApproveButtons">
          <Button
            className="buttonAction"
            onClick={() => {
              confirmTeammate(user._id);
            }}
          >
            Accept
          </Button>
          <Button
            className="buttonReset"
            onClick={() => {
              rejectTeammate(user._id);
            }}
          >
            Reject
          </Button>
        </div>
      </If>
      <If condition={!user.isOwner}>
        <div className="pageTeam__user__select">
          <form autoComplete="off">
            <ReactSelect
              label={localization.TEAMMATES.labelSelectRole}
              value={{ value: user.roleId, label: user.roleName }}
              onChange={handleChangeRole}
              options={roleOptions}
              isDisabled={isProcessing}
            />
          </form>
        </div>
      </If>
      <If condition={!disabledSetPassword}>
        <div className="pageTeam__user__pass">
          <div className="passwordField">
            <Input
              label={localization.TEAMMATES.labelPassword}
              autoComplete="new-password"
              value={password}
              type="password"
              onFocus={handleInputPasswordFocus}
              onChange={(event) => setPassword(event.target.value)}
              onBlur={(event) => handleInputPasswordBlur(event)}
              onKeyDown={handleInputPassword}
              disabled={isProcessing}
              error={passwordError}
            />
          </div>
        </div>
      </If>
      <If condition={!user.isOwner}>
        <TeammateStatus user={user} sendInviteToTeammate={sendInviteToTeammate} />
      </If>

      <UserInfoEdit
        user={user}
        updateUser={updateUser}
        updateTeammateByField={updateTeammateByField}
        isCurrentUser={isCurrentUser}
        isManagingTeammateEnabled={isManagingTeammateEnabled}
      />

      <If condition={canShowAnalytics}>
        <div className="userAnalyticsTabWrapper">
          <AnalyticsTab
            userMetricFetching={userMetricFetching}
            user={user}
            userMetric={userMetric}
            isShowTeammateAnalytics={isShowTeammateAnalytics}
          />
        </div>
      </If>

      <If condition={isAllowManageTeam && !isOwner}>
        <div className="pageTeam__user__delete">
          <PicsioButton
            variant="contained"
            size="md"
            color="secondary"
            onClick={() => removeTeammate(userId)}
            error
            componentProps={{
              'data-qa-id': 'deleteUser',
            }}
          >
            {deleteBTnText}
          </PicsioButton>
        </div>
      </If>
    </div>
  );
}

TeamUserDetails.defaultProps = {
  isLoading: false,
  roleChangingIds: [],
  confirmTeammate: null,
  rejectTeammate: null,
  removeTeammate: null,
};
TeamUserDetails.propTypes = {
  user: PropTypes.objectOf(PropTypes.any).isRequired,
  roles: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      userId: PropTypes.string,
      name: PropTypes.string,
      permissions: PropTypes.objectOf(PropTypes.bool),
      allowedCollections: PropTypes.arrayOf(PropTypes.object),
    }),
  ).isRequired,
  roleChangingIds: PropTypes.arrayOf(PropTypes.string),
  changeTeammatePassword: PropTypes.func.isRequired,
  sendInviteToTeammate: PropTypes.func.isRequired,
  assignRoleToTeammate: PropTypes.func.isRequired,
  confirmTeammate: PropTypes.func,
  rejectTeammate: PropTypes.func,
  removeTeammate: PropTypes.func,
  updateUser: PropTypes.func.isRequired,
  updateTeammateByField: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  isCurrentUser: PropTypes.bool.isRequired,
  isShowTeammateAnalytics: PropTypes.bool.isRequired,
  isAllowManageTeam: PropTypes.bool.isRequired,
};

export default TeamUserDetails;
