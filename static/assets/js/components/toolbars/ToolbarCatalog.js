/** @TODO - need to rewrite this component in the future ❗ */
import React, { useState, useEffect, useCallback } from 'react';
import { useMount, usePrevious } from 'react-use';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Logger from '../../services/Logger';
import * as actions from '../../store/actions/main';
import { setSortType as setInboxSortType } from '../../store/inboxes/actions';
import * as actionsLightboards from '../../store/actions/lightboards';
import * as notificationsActions from '../../store/actions/notifications';

import { checkUserAccess } from '../../store/helpers/user';
import { activeCollectionSelector } from '../../store/selectors/collections';
import { activeSortTypeSelector } from '../../store/inboxes/selectors';
import { allowedActionsSelector } from '../../store/selectors/assets';
import { toggleAdBlockWarning } from '../../store/actions/user';
import { isRouteFiltering, isRouteSearch, navigateToRoot } from '../../helpers/history';
import * as UtilsCollections from '../../store/utils/collections';
import ToolbarCatalogTop from './ToolbarCatalogTop';
import ToolbarCatalogLeft from './ToolbarCatalogLeft';

const defaultSort = { type: 'uploadTime', order: 'desc' };

const ToolbarCatalog = (props) => {
  const {
    actionsLightboards,
    activeCollection,
    avatarSrc,
    chatSupport,
    collectionsSortType,
    downloadListItemsLength,
    downloadListOpened,
    importOpened,
    isDetailsOpen,
    isSyncAllowed,
    jobsStatus,
    lightboardsSortType,
    location,
    mainActions,
    manageInboxes,
    notifications,
    notificationsActions,
    notificationsIsInprogress,
    notificationsIsLoaded,
    notificationsUnreadCount,
    openedTree,
    rootCollectionsPermissions,
    uploadListCount,
    userActions,
    inboxes,
    inboxesActions,
    activeInboxSortType,
  } = props;
  const activeCollectionId = activeCollection?._id;
  const activeCollectionPermissions = activeCollection?.permissions || {};
  const [permissions, setPermissions] = useState({});
  const [sortType, setSortType] = useState(defaultSort);
  const prevLocation = usePrevious(location);
  const prevActiveCollectionId = usePrevious(activeCollectionId);
  const prevCollectionsSortType = usePrevious(collectionsSortType);
  const prevLightboardsSortType = usePrevious(lightboardsSortType);
  const prevInboxesSortType = usePrevious(activeInboxSortType);

  const getPermissions = useCallback((query) => {
    const { lightboardId, tagId } = query;
    let permissionsNew;

    if (lightboardId) {
      permissionsNew = { upload: true };
    } else if (isRouteFiltering()) {
      permissionsNew = rootCollectionsPermissions;
    } else if (tagId) {
      permissionsNew = activeCollectionPermissions;
    }
    permissionsNew = { ...permissionsNew, upload: permissionsNew?.upload };
    setPermissions(permissionsNew);
  }, [rootCollectionsPermissions, activeCollectionPermissions]);

  useMount(() => {
    getPermissions(location.query);
  });

  useEffect(() => {
    if (isRouteSearch()
      && (
        // prevLocation !== location ||
        prevActiveCollectionId !== activeCollectionId
      )
    ) {
      getPermissions(location.query);
    }
  }, [prevLocation, location, prevActiveCollectionId, activeCollectionId, getPermissions]);

  const getCurrentSortType = () => {
    const { tagId, lightboardId, inboxId } = location.query;
    let sortTypeNew = sortType;

    if (tagId && collectionsSortType) {
      sortTypeNew = collectionsSortType;
    } else if (lightboardId && lightboardsSortType) {
      sortTypeNew = lightboardsSortType;
    } else if (inboxId) {
      if (activeInboxSortType) {
        sortTypeNew = activeInboxSortType;
      }
    }

    return sortTypeNew;
  };

  const changeSortType = () => {
    const sortTypeNew = getCurrentSortType();
    if (sortTypeNew !== sortType) {
      setSortType(sortTypeNew);
    }
  };

  useEffect(() => {
    if ((isRouteSearch() && prevLocation !== location) || (
      prevCollectionsSortType !== collectionsSortType
      || prevLightboardsSortType !== lightboardsSortType
      || prevInboxesSortType !== activeInboxSortType
    )) {
      changeSortType();
    }
  });

  const handleLiveSupport = useCallback(() => {
    if (chatSupport) {
      window.dispatchEvent(new Event('toolbar:ui:liveSupport'));
    }
  }, [chatSupport]);

  const handleAddonsClick = useCallback(() => {
    Logger.log('User', 'ToolbarGoToAddons');
    const url = 'https://help.pics.io/en/collections/294971-integrations-with-third-party-apps';
    window.open(url, '_blank');
  }, []);

  const handleChangeTree = useCallback((buttonName) => {
    mainActions.changeTree(buttonName);
  }, [mainActions]);

  const handleDownloadList = useCallback(() => {
    Logger.log('User', 'DonwloadPanelShowClicked');
    mainActions.toggleDownloadList();
  }, [mainActions]);

  const handleImportList = useCallback(() => {
    Logger.log('User', 'UploadPanelShowClicked');
    mainActions.toggleImport();
  }, [mainActions]);

  const handleToggleAdBlockWarning = useCallback(() => {
    userActions.toggleAdBlockWarning();
  }, [userActions]);

  const handleToggleDetails = useCallback(() => {
    mainActions.toggleDetails();
  }, [mainActions]);

  const handleLogoClick = useCallback(() => {
    Logger.log('User', 'LogoClicked');
    navigateToRoot();
    if (openedTree !== 'collections') {
      mainActions.changeTree('collections');
    }
  }, [mainActions, openedTree]);

  const handleChangeSort = useCallback((name, order) => {
    const { tagId, lightboardId, inboxId } = location.query;
    if (tagId) {
      UtilsCollections.setSortType({
        type: name,
        order,
      });
    }

    if (inboxId) {
      inboxesActions.setInboxSortType({ _id: inboxId, sortType: { type: name, order } });
    }

    if (lightboardId) {
      actionsLightboards.updateSortType(lightboardId, {
        type: name,
        order,
      });
    }
  }, [actionsLightboards, location.query, inboxes]);

  const handleTutorials = useCallback(() => {
    window.dispatchEvent(new Event('toolbar:ui:tutorials'));
  }, []);

  const handleWhatsNew = useCallback(() => {
    Logger.log('User', 'SettingsWhatsNew');
    window.open('https://blog.pics.io/', '_blank');
  }, []);

  const handleLogout = useCallback(() => {
    window.dispatchEvent(new Event('toolbar:ui:logout'));
  }, []);

  const isAllowedArchive = checkUserAccess('subscriptions', 'archive') && checkUserAccess('permissions', 'viewArchive');
  const isAllowedLightboards = checkUserAccess('permissions', 'manageLightboards');

  return (
    <div className="toolbarCatalog">
      <ToolbarCatalogTop
        avatarSrc={avatarSrc}
        handleChangeSort={handleChangeSort}
        handleLogoClick={handleLogoClick}
        handleLogout={handleLogout}
        handleToggleDetails={handleToggleDetails}
        handleTutorials={handleTutorials}
        handleWhatsNew={handleWhatsNew}
        chatSupport={chatSupport}
        handleLiveSupport={handleLiveSupport}
        isDetailsOpen={isDetailsOpen}
        isSyncAllowed={isSyncAllowed}
        jobsStatus={jobsStatus}
        notifications={notifications}
        notificationsActions={notificationsActions}
        notificationsIsInprogress={notificationsIsInprogress}
        notificationsIsLoaded={notificationsIsLoaded}
        notificationsUnreadCount={notificationsUnreadCount}
        sortType={sortType}
      />
      <ToolbarCatalogLeft
        chatSupport={chatSupport}
        downloadListItemsLength={downloadListItemsLength}
        downloadListOpened={downloadListOpened}
        handleAddonsClick={handleAddonsClick}
        handleChangeTree={handleChangeTree}
        handleDownloadList={handleDownloadList}
        handleImportList={handleImportList}
        handleLiveSupport={handleLiveSupport}
        handleToggleAdBlockWarning={handleToggleAdBlockWarning}
        importOpened={importOpened}
        isAllowedArchive={isAllowedArchive}
        isAllowedLightboards={isAllowedLightboards}
        manageInboxes={manageInboxes}
        openedTree={openedTree}
        permissions={permissions}
        uploadListCount={uploadListCount}
      />
    </div>

  );
};
const ConnectedToolbarCatalog = connect(
  (state) => ({
    activeCollection: activeCollectionSelector(state),
    allowedAssetsActions: allowedActionsSelector(state),
    assets: state.assets.items,
    avatarSrc: state.user.avatar,
    chatSupport: state.user.subscriptionFeatures?.chatSupport || false,
    collectionsSortType: state.collections.activeCollection?.sortType,
    downloadListItemsLength: state.downloadList.items?.length || 0,
    downloadListOpened: state.main.downloadListOpened,
    importOpened: state.main.importOpened,
    isDetailsOpen: state.main.isDetailsOpen,
    isSyncAllowed: state.user.isSyncAllowed || false,
    jobsStatus: state.notifications.jobsStatus,
    lightboardsSortType: state.lightboards.activeLightboard?.sortType,
    location: state.router.location,
    manageInboxes: state.user.role.permissions?.manageInboxes || false,
    notifications: state.notifications.items,
    notificationsIsInprogress: state.notifications.isInprogress,
    notificationsIsLoaded: state.notifications.isLoaded,
    notificationsUnreadCount: state.notifications.notificationsUnreadCount,
    openedTree: state.main.openedTree,
    rootCollectionsPermissions: state.collections.collections.my.permissions,
    uploadListCount: state.uploadList.totalCount,
    inboxes: state.inboxes.inboxes,
    activeInboxSortType: activeSortTypeSelector(state),
  }),
  (dispatch) => ({
    actionsLightboards: bindActionCreators(actionsLightboards, dispatch),
    mainActions: bindActionCreators(actions, dispatch),
    notificationsActions: bindActionCreators(notificationsActions, dispatch),
    userActions: bindActionCreators({ toggleAdBlockWarning }, dispatch),
    inboxesActions: bindActionCreators({ setInboxSortType }, dispatch),
  }),
)(ToolbarCatalog);

export default ConnectedToolbarCatalog;
