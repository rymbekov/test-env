import React, { Suspense } from 'react';
import { useSelector } from 'react-redux';
import { Media } from 'react-breakpoints';
import ErrorBoundary from '../ErrorBoundary';

import Spinner from '../CatalogItem/Spinner';

import CollectionsTree from '../collectionsTree';
import SavedSearchesTree from '../savedSearchesTree';
import LightboardsTree from '../lightboardsTree';
import InboxTree from '../InboxTree';
import KeywordsTree from '../KeywordsTree';
import Archive from '../Archive';
import DetailsSideBar from '../details';

import { checkUserAccess } from '../../store/helpers/user';

import ToolbarCatalog from '../toolbars/ToolbarCatalog';
import ToolbarActions from '../toolbars/ToolbarActions';

import MapView from '../MapView';
import CatalogView from '../CatalogView';
import MobileApp from './MobileApp';
import MobileAppBanner from '../MobileAppBanner';

const ImportComponent = React.lazy(() => import('../import'));
const DownloadListComponent = React.lazy(() => import('../DownloadList'));

export default function App(props) {
  const { children } = props;
  const { catalogViewMode, openedTree } = useSelector((state) => state.main);
  const { permissions: userPermissions } = useSelector((state) => state.user.role);
  const { featureFlags } = useSelector((state) => state.user.team) || {};
  const isArchiveAllowed = checkUserAccess('subscriptions', 'archive') && checkUserAccess('permissions', 'viewArchive');

  return (
    <ErrorBoundary>
      <Media>
        {({ breakpoints, currentBreakpoint }) => (
          <Choose>
            <When condition={breakpoints[currentBreakpoint] > breakpoints.tablet}>
              <div className="appMain">
                <div className="content">
                  <Suspense fallback={<Spinner spinnerTitle="Loading" />}>
                    <ImportComponent />
                  </Suspense>
                  <Suspense fallback={<Spinner spinnerTitle="Loading" />}>
                    <DownloadListComponent />
                  </Suspense>

                  <div className="catalogDetailsPanel wrapperDetailsPanel">
                    <DetailsSideBar
                      panelName="right"
                      textareaHeightNameLS="picsio.detailsDescriptionHeight"
                    />
                  </div>

                  <Choose>
                    <When condition={openedTree === 'collections'}>
                      <CollectionsTree />
                    </When>
                    <When condition={openedTree === 'keywords'}>
                      <KeywordsTree />
                    </When>
                    <When condition={openedTree === 'savedSearches'}>
                      <SavedSearchesTree />
                    </When>
                    <When condition={userPermissions.manageLightboards && openedTree === 'lightboards'}>
                      <LightboardsTree />
                    </When>
                    <When condition={userPermissions.manageInboxes && openedTree === 'inbox'}>
                      <InboxTree />
                    </When>
                    <When condition={openedTree === 'archive' && isArchiveAllowed}>
                      <Archive />
                    </When>
                    <Otherwise>{null}</Otherwise>
                  </Choose>

                  <div className="appCatalog">
                    <Choose>
                      <When condition={catalogViewMode === 'geo'}>
                        <MapView />
                      </When>
                      <Otherwise>
                        <CatalogView />
                      </Otherwise>
                    </Choose>
                    <ToolbarCatalog />
                    <ToolbarActions />
                  </div>
                </div>
                {children}
              </div>
            </When>
            <Otherwise>
              <MobileAppBanner />
              <MobileApp
                // search={props.location.search}
                catalogViewMode={catalogViewMode}
                userPermissions={userPermissions}
              >
                {children}
              </MobileApp>
            </Otherwise>
          </Choose>
        ) }
      </Media>
    </ErrorBoundary>
  );
}
