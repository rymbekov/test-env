import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { usePrevious } from 'react-use';
import {
  Home,
  Upload,
  Search,
  Bell,
  Settings,
} from '@picsio/ui/dist/icons';
import { setMobileAdditionalScreenPanel, openImport, closeImport } from '../../store/actions/main';
import { getAssets } from '../../store/actions/assets';
import * as UtilsCollections from '../../store/utils/collections';
import BottomNavigationButton from './BottomNavigationButton';
import { isRouteFiltering, isRouteSearch } from '../../helpers/history';

export default function MobileToolbarBottom(props) {
  const dispatch = useDispatch();
  const { permissions: rootCollectionPermissions } = useSelector(
    (state) => state.collections.collections.my,
  );
  const { permissions } = useSelector((state) => state.user.role);
  const { query: searchQuery } = useSelector((state) => state.router.location);
  const prevSearchQuery = usePrevious(searchQuery);
  const { mobileAdditionalPanelActive, importOpened } = useSelector((state) => state.main);
  const { notificationsUnreadCount } = useSelector((state) => state.notifications);
  const [additionalPermissions, setAdditionalPermissions] = useState(rootCollectionPermissions);

  useEffect(() => {
    const handleRouteChange = async () => {
      let newPermissions;
      if (searchQuery.lightboardId) {
        newPermissions = { upload: true };
      } else if (isRouteFiltering()) {
        newPermissions = rootCollectionPermissions;
      } else {
        const { tagId } = searchQuery;
        if (tagId) {
          const currentCollection = await UtilsCollections.forceFindTagWithTagId(tagId);
          newPermissions = currentCollection.permissions;
        } else {
          newPermissions = rootCollectionPermissions;
        }
      }
      newPermissions = { ...additionalPermissions, upload: newPermissions.upload };
      setAdditionalPermissions(newPermissions);
    };

    if (isRouteSearch() && prevSearchQuery !== searchQuery) {
      handleRouteChange();
    }
  }, [additionalPermissions, prevSearchQuery, rootCollectionPermissions, searchQuery]);

  const handleClickHome = () => {
    if (importOpened) dispatch(closeImport());
    if (mobileAdditionalPanelActive !== 'Home') {
      dispatch(setMobileAdditionalScreenPanel('Home'));
    } else {
      dispatch(getAssets(true));
    }
  };

  return (
    <nav className="bottomNavigation" role="navigation">
      <BottomNavigationButton
        label="Home"
        isActive={mobileAdditionalPanelActive === 'Home'}
        icon={() => <Home />}
        onClick={handleClickHome}
      />
      <BottomNavigationButton
        label="Upload"
        isActive={mobileAdditionalPanelActive === 'Upload'}
        isDisabled={permissions.upload !== true && additionalPermissions.upload !== true}
        icon={() => <Upload />}
        onClick={() => {
          dispatch(openImport());
          dispatch(setMobileAdditionalScreenPanel('Upload'));
        }}
      />
      <BottomNavigationButton
        label="Search"
        isActive={mobileAdditionalPanelActive === 'Search'}
        icon={() => <Search />}
        miniBadge={isRouteFiltering()}
        onClick={() => {
          if (importOpened) dispatch(closeImport());
          dispatch(setMobileAdditionalScreenPanel('Search'));
        }}
      />
      <BottomNavigationButton
        label="Notifications"
        isActive={mobileAdditionalPanelActive === 'Notifications'}
        icon={() => <Bell />}
        badge={notificationsUnreadCount || 0}
        onClick={() => {
          if (importOpened) dispatch(closeImport());
          dispatch(setMobileAdditionalScreenPanel('Notifications'));
        }}
      />
      <BottomNavigationButton
        label="Settings"
        isActive={mobileAdditionalPanelActive === 'Settings'}
        icon={() => <Settings />}
        onClick={() => {
          if (importOpened) dispatch(closeImport());
          dispatch(setMobileAdditionalScreenPanel('Settings'));
        }}
      />
    </nav>
  );
}
