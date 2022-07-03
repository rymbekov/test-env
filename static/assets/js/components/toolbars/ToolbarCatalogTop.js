import React, { memo } from 'react';
import PropTypes from 'prop-types';
import {
  Audit,
  User,
  Dollar,
  Sync,
  Bell,
  Info,
  Settings,
  Storage,
  QuestionTransparent,
  WhatsNew,
  MyTeam,
  Referal,
  Logout,
  SwapHorizontal,
} from '@picsio/ui/dist/icons';
import { useSelector } from 'react-redux';
import ToolbarSort from '../Sort';
import showSwitchAccountDialog from '../../helpers/showSwitchAccountDialog';

import ErrorBoundary from '../ErrorBoundary';

import localization from '../../shared/strings';
import ua from '../../ua';

import { isHaveTeammatePermission } from '../../store/helpers/user';
import Notifications from '../Notifications';
import Search from '../Search';
import Breadcrumbs from '../Breadcrumbs';
import CatalogViewMode from '../CatalogViewMode';
import Logo from './Logo';
import DropItem from '../DropItem';
import JobsStatusOpener from './JobsStatusOpener';
import DropOpener from './DropOpener';
import Group from './Group';
import Button from './Button';
import GiftBox from './giftBox.svg';
import InviteButton from './InviteButton';
import RequestDemoButton from './RequestDemoButton';

const ToolbarCatalogTop = (props) => {
  const {
    avatarSrc,
    sortType,
    isSyncAllowed,
    handleToggleDetails,
    handleChangeSort,
    handleTutorials,
    handleWhatsNew,
    handleLogout,
    handleLogoClick,
    handleLiveSupport,
    chatSupport,
    jobsStatus,
    isDetailsOpen,
    notifications,
    notificationsUnreadCount,
    notificationsIsLoaded,
    notificationsIsInprogress,
    notificationsActions,
  } = props;

  const planId = useSelector((state) => state.user.subscriptionFeatures.planId);

  const isSyncRunning = jobsStatus.syncing && jobsStatus.syncing === 'running';

  let jobsCount = 0;
  for (const key in jobsStatus) {
    if (typeof jobsStatus[key] === 'number') jobsCount += jobsStatus[key];
  }

  const unreadNotifications = notificationsUnreadCount || 0;

  return (
    <div className="toolbar toolbarCatalogTop">
      <Group>
        <Logo handleLogoClick={handleLogoClick} additionalClass="tabletHidden logoPicsio" />
      </Group>
      <Group additionalClass="wrapperBreadcrumbs">
        <ErrorBoundary>
          <Breadcrumbs />
        </ErrorBoundary>
      </Group>
      <Group>
        <ErrorBoundary>
          <Search />
        </ErrorBoundary>
        <If condition={planId === 'trial'}>
          <RequestDemoButton handleLiveSupport={handleLiveSupport} chatSupport={chatSupport} />
        </If>
        <If condition={isHaveTeammatePermission('manageTeam')}>
          <InviteButton />
        </If>
        <If condition={jobsCount > 0 || isSyncRunning}>
          <JobsStatusOpener
            additionalClass="toolbarButtonDropdown toolbarButtonDropdownNotClickable"
            name="Work in progress"
            left
            jobsCount={jobsCount}
            fetch={notificationsActions.fetchJobsStatus}
            isSyncRunning={isSyncRunning}
          >
            <div className="jobs-status-title">{localization.PROCESSING.title}</div>
            {jobsStatus.keywording > 0 && (
              <DropItem
                icon="keyword"
                id="menu-keywording"
                text={`${jobsStatus.keywording} ${localization.PROCESSING.keywording}`}
              />
            )}
            {jobsStatus.metadating > 0 && (
              <DropItem
                icon="label"
                id="menu-metadating"
                text={`${jobsStatus.metadating} ${localization.PROCESSING.metadating}`}
              />
            )}
            {jobsStatus.thumbnailing > 0 && (
              <DropItem
                icon="previewTitle"
                id="menu-thumbnailing"
                text={`${jobsStatus.thumbnailing} ${localization.PROCESSING.thumbnailing}`}
              />
            )}
            {jobsStatus.replicating > 0 && (
              <DropItem
                icon="retry"
                id="menu-replicating"
                text={`${jobsStatus.replicating} ${localization.PROCESSING.replicating}`}
              />
            )}
            {jobsStatus.contenting > 0 && (
              <DropItem
                icon="content"
                id="menu-contenting"
                text={`${jobsStatus.contenting} ${localization.PROCESSING.contenting}`}
              />
            )}
            {jobsStatus.trashing > 0 && (
              <DropItem
                icon="trash"
                id="menu-trashing"
                text={`${jobsStatus.trashing} ${localization.PROCESSING.trashing}`}
              />
            )}
            {jobsStatus.untrashing > 0 && (
              <DropItem
                icon="restoreFromTrash"
                text={`${jobsStatus.untrashing} ${localization.PROCESSING.untrashing}`}
              />
            )}
            {jobsStatus.deleting > 0 && (
              <DropItem
                icon="deleteFromTrash"
                id="menu-deleting"
                text={`${jobsStatus.deleting} ${localization.PROCESSING.deleting}`}
              />
            )}
            {jobsStatus.moving > 0 && (
              <DropItem
                icon="folderMoving"
                id="menu-moving"
                text={`${jobsStatus.moving} ${localization.PROCESSING.moving}`}
              />
            )}
            {jobsStatus.transcoding > 0 && (
              <DropItem
                icon="transcoding"
                id="menu-transcoding"
                text={`${jobsStatus.transcoding} ${localization.PROCESSING.transcoding}`}
              />
            )}
            {isSyncRunning && (
              <DropItem icon="sync" id="menu-syncing" text={localization.PROCESSING.syncing} />
            )}
          </JobsStatusOpener>
        </If>
        <DropOpener
          icon={() => <Bell />}
          id="notifications"
          badge={unreadNotifications || null}
          name="Notifications"
          left
        >
          <ErrorBoundary>
            <Notifications
              items={notifications}
              notificationsUnreadCount={notificationsUnreadCount}
              isLoaded={notificationsIsLoaded}
              isInprogress={notificationsIsInprogress}
              actions={notificationsActions}
            />
          </ErrorBoundary>
        </DropOpener>
        <CatalogViewMode />
        <ToolbarSort
          sortType={sortType}
          changeSort={handleChangeSort}
        />
        <Button
          id="button-catalogDetails"
          icon={() => <Info />}
          isActive={!!isDetailsOpen}
          onClick={handleToggleDetails}
          tooltip={localization.TOOLBARS.titleDetails}
          tooltipPosition="bottom"
        />
        <DropOpener
          icon={() => <Settings />}
          id="button-settings"
          name="Settings"
          left
          avatarSrc={avatarSrc}
        >
          <DropItem
            icon={() => <User />}
            id="menu-account"
            text={localization.TOOLBARS.textMyAccount}
            href="/users/me?tab=account"
          />
          {isSyncAllowed && (
            <DropItem
              icon={() => <Sync />}
              id="menu-sync"
              text={localization.TOOLBARS.textSync}
              href="/sync"
            />
          )}
          {isHaveTeammatePermission('manageBilling') && !ua.isMobileApp() && (
            <DropItem
              icon={() => <Dollar />}
              id="menu-billing"
              text={localization.TOOLBARS.textBilling}
              href="/billing?tab=overview"
            />
          )}
          {isHaveTeammatePermission('manageStorage') && (
            <DropItem
              icon={() => <Storage />}
              id="menu-storage"
              text={localization.TOOLBARS.textStorage}
              href="/storage"
            />
          )}
          {isHaveTeammatePermission('editCustomFieldsSchema') && (
            <DropItem
              icon="customFields"
              id="menu-customFields"
              text={localization.TOOLBARS.textCustomFields}
              href="/customfields"
            />
          )}
          <DropItem
            icon={() => <MyTeam />}
            id="menu-teammates"
            text={localization.TOOLBARS.textMyTeam}
            href="/teammates?tab=settings"
          />
          <DropItem
            icon={() => <Audit />}
            id="menu-audit"
            text={localization.TOOLBARS.textAuditTrail}
            href={isHaveTeammatePermission('accessAuditTrail')
              ? '/audit?tab=audit'
              : '/audit?tab=analytics'}
          />
          <DropItem
            icon={() => <Referal />}
            id="menu-referal"
            text={localization.TOOLBARS.textReferralProgram}
            href="/referral"
          >
            <GiftBox className="giftBox" />
          </DropItem>
          <div className="toolbarDropdownSeparator" />

          <DropItem
            icon={() => <QuestionTransparent />}
            id="menu-tutorials"
            text={localization.TOOLBARS.textTutorials}
            onClick={handleTutorials}
          />
          <DropItem
            icon={() => <WhatsNew />}
            id="menu-whatsNew"
            text={localization.TOOLBARS.textWhatsNew}
            onClick={handleWhatsNew}
          />
          <div className="toolbarDropdownSeparator" />
          <DropItem
            icon={() => <SwapHorizontal />}
            id="menu-switchAccount"
            text={localization.TOOLBARS.textSwitchAccount}
            onClick={showSwitchAccountDialog}
          />
          <div className="toolbarDropdownSeparator" />
          <DropItem
            icon={() => <Logout />}
            id="menu-logout"
            text={localization.TOOLBARS.textLogOut}
            onClick={handleLogout}
          />
        </DropOpener>
      </Group>
    </div>
  );
};

ToolbarCatalogTop.defaultProps = {
  avatarSrc: null,
  notificationsIsInprogress: false,
};

ToolbarCatalogTop.propTypes = {
  avatarSrc: PropTypes.string,
  sortType: PropTypes.object,
  isSyncAllowed: PropTypes.bool.isRequired,
  handleToggleDetails: PropTypes.func.isRequired,
  handleChangeSort: PropTypes.func.isRequired,
  handleTutorials: PropTypes.func.isRequired,
  handleWhatsNew: PropTypes.func.isRequired,
  handleLogout: PropTypes.func.isRequired,
  handleLogoClick: PropTypes.func.isRequired,
  handleLiveSupport: PropTypes.func.isRequired,
  chatSupport: PropTypes.bool.isRequired,
  jobsStatus: PropTypes.object,
  isDetailsOpen: PropTypes.bool.isRequired,
  notifications: PropTypes.array,
  notificationsUnreadCount: PropTypes.number.isRequired,
  notificationsIsLoaded: PropTypes.bool.isRequired,
  notificationsIsInprogress: PropTypes.bool,
  notificationsActions: PropTypes.object,
};

export default memo(ToolbarCatalogTop);

// const ConnectedToolbarCatalogTop = connect(
//   (state) => ({
//     location: state.router.location,
//     mainStore: state.main,
//     notifications: state.notifications.items,
//     notificationsUnreadCount: state.notifications.notificationsUnreadCount,
//     notificationsIsLoaded: state.notifications.isLoaded,
//     notificationsIsInprogress: state.notifications.isInprogress,
//     jobsStatus: state.notifications.jobsStatus,
//     collectionsSortType: state.collections.activeCollection?.sortType,
//     lightboardsSortType: state.lightboards.activeLightboard?.sortType,
//     team: state.user.team,
//     user: state.user,
//   }),
//   (dispatch) => ({
//     mainActions: bindActionCreators(mainActions, dispatch),
//     notificationsActions: bindActionCreators(notificationsActions, dispatch),
//     actionsCollections: bindActionCreators(actionsCollections, dispatch),
//     actionsLightboards: bindActionCreators(actionsLightboards, dispatch),
//   }),
// )(ToolbarCatalogTop);

// export default () => (
//   <Provider store={store}>
//     <ConnectedToolbarCatalogTop />
//   </Provider>
// );
