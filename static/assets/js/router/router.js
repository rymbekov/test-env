import React, { useEffect, Suspense } from 'react';
import {
  Router, Route, Switch, useLocation, useHistory,
} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { isRouteSearch, navigateToRoot } from '../helpers/history';
import AppUrlListener from './AppUrlListener';
// import Spinner from '../components/collectionsTree/views/Spinner';
import Spinner from '../components/CatalogItem/Spinner';
import App from '../components/App';
// const App = React.lazy(() => import('../components/App'));
import Home from '../components/Home';

import ScreenPreview from '../components/previewView';
import ScreenCompare from '../components/Compare';
import ScreenEditor from '../components/Editor';
import ScreenTeammates from '../components/teammates';
import Billing from '../components/Billing';
import ScreenDeleteAccount from '../components/deleteAccount';
import ScreenRestrictAccess from '../components/restrictAccess';
import ScreenRevokeConsent from '../components/revokeConsent';
import ScreenAccount from '../components/account';
import ScreenWebsite from '../components/Websites';
import ScreenSingleSharing from '../components/screenSingleSharing';
import ScreenSync from '../components/sync';
import ScreenCustomfields from '../components/customFieldsSchema';
import ScreenCustomfieldsEdit from '../components/customFieldsSchemaEdit';
import ScreenAudit from '../components/audit';
import ScreenPlanCancellation from '../components/ScreenPlanCancellation';
import ScreenPlanDowngrade from '../components/ScreenPlanDowngrade';
import ScreenShortcuts from '../components/Shortcuts';
import ScreenReferral from '../components/ScreenReferral';
import ScreenInboxSettings from '../components/ScreenInboxSettings';
import ScreenStorage from '../components/Storage';
import ScreenPersonalInfo from '../components/PersonalInfo';
import CsvUploadView from '../components/CsvUploadView';

/** @TODO LAZY load components */
// const ScreenPreview = React.lazy(() => import('../components/previewView'));
// const ScreenCompare = React.lazy(() => import('../components/Compare'));
// const ScreenEditor = React.lazy(() => import('../components/Editor'));
// const ScreenTeammates = React.lazy(() => import('../components/teammates'));
// const Billing = React.lazy(() => import('../components/Billing'));
// const ScreenDeleteAccount = React.lazy(() => import('../components/deleteAccount'));
// const ScreenRestrictAccess = React.lazy(() => import('../components/restrictAccess'));
// const ScreenRevokeConsent = React.lazy(() => import('../components/revokeConsent'));
// const ScreenAccount = React.lazy(() => import('../components/account'));
// const ScreenWebsite = React.lazy(() => import('../components/Websites'));
// const ScreenSingleSharing = React.lazy(() => import('../components/screenSingleSharing'));
// const ScreenSync = React.lazy(() => import('../components/sync'));
// const ScreenCustomfields = React.lazy(() => import('../components/customFieldsSchema'));
// const ScreenCustomfieldsEdit = React.lazy(() => import('../components/customFieldsSchemaEdit'));
// const ScreenAudit = React.lazy(() => import('../components/audit'));
// const ScreenPlanCancellation = React.lazy(() => import('../components/ScreenPlanCancellation'));
// const ScreenPlanDowngrade = React.lazy(() => import('../components/ScreenPlanDowngrade'));
// const ScreenShortcuts = React.lazy(() => import('../components/Shortcuts'));
// const ScreenReferral = React.lazy(() => import('../components/ScreenReferral'));
// const ScreenInboxSettings = React.lazy(() => import('../components/ScreenInboxSettings'));
// const ScreenStorage = React.lazy(() => import('../components/Storage'));
// const ScreenPersonalInfo = React.lazy(() => import('../components/PersonalInfo'));

import { isHaveTeammatePermission } from '../store/helpers/user';
import { getAssets, deselectAll } from '../store/actions/assets';
import { setActiveCollection, setRecursiveSearch } from '../store/actions/collections';
import { setActiveCollection as setActiveArchiveCollection } from '../store/actions/archive';
import { setActiveLightboard } from '../store/actions/lightboards';
import { setActive as setActiveInbox } from '../store/inboxes/actions';
import { setActive as setActiveKeywords } from '../store/actions/keywords';
import { activeCollectionSelector } from '../store/selectors/collections';

import checkRecursiveSearch from './helpers/checkRecursiveSearch';

let initialUrlRecursive;

function useRouteListener() {
  const dispatch = useDispatch();
  const location = useLocation();
  const reactHistory = useHistory();
  const activeCollection = useSelector((state) => activeCollectionSelector(state));
  const { activeLightboard } = useSelector((state) => state.lightboards);

  useEffect(
    () => {
      const {
        archived, lightboardId, tagId, inboxId, keywords, recursive, bbox, zoom,
      } = location.query;

      initialUrlRecursive = checkRecursiveSearch(
        initialUrlRecursive,
        recursive,
        (value) => dispatch(setRecursiveSearch(value)),
      );

      if (bbox || zoom) return;

      function handleSearchRouteChange() {
        if (lightboardId && activeLightboard?._id !== lightboardId) {
          if (!lightboardId || lightboardId.length !== 24) {
            navigateToRoot();
            return;
          }
          dispatch(setActiveLightboard(lightboardId));
        } else if (inboxId) {
          if (!isHaveTeammatePermission('manageInboxes')) {
            navigateToRoot();
            return;
          }
          if (!inboxId || inboxId.length !== 24) {
            navigateToRoot();
            return;
          }
          dispatch(setActiveInbox(inboxId));
        } else if (archived && tagId && activeCollection?._id !== tagId) {
          dispatch(setActiveArchiveCollection(tagId));
        } else if (tagId && activeCollection?._id !== tagId) {
          if (!tagId || tagId.length !== 24) {
            navigateToRoot();
            return;
          }
          dispatch(setActiveCollection(tagId));
        }

        dispatch(setActiveKeywords(keywords || []));
        dispatch(deselectAll());
      }

      const { search } = location;
      if (!isRouteSearch() || !search) return;
      const { action } = reactHistory;

      const currentSearch = reactHistory.entries[0];
      const prevSearch = reactHistory.entries.find((item, index) => {
        const isNotCurrent = !!index;
        return isNotCurrent && isRouteSearch(item.pathname);
      });
      const isBackToPrevSearch = !!prevSearch && prevSearch.search === currentSearch.search;
      // isBackToPrevSearch && action === 'REPLACE' - it is a fix for change Sort
      if (!isBackToPrevSearch || (isBackToPrevSearch && action === 'REPLACE')) {
        handleSearchRouteChange();
        dispatch(getAssets(true));
      }
    },
    [location, dispatch, reactHistory],
  );
}

function LazyLoading(Component, props) {
  return (
    <Suspense fallback={<Spinner spinnerTitle="Loading" />}>
      <Component {...props} />
    </Suspense>
  );
}

export default () => {
  const reactHistory = useHistory();
  useRouteListener();

  return (
    <Router history={reactHistory}>
      <Switch>
        <App>
          <AppUrlListener />
          <Route path="/" exact component={Home} />
          <Route path="/_=_" component={Home} />
          <Route path="/app" component={Home} />
          <Route path="/appmobile" component={Home} />

          <Route path="/audit" render={(routeProps) => LazyLoading(ScreenAudit, routeProps)} />
          <Route path="/billing" render={(routeProps) => LazyLoading(Billing, routeProps)} />
          <Route path="/billing/cancellation" render={(routeProps) => LazyLoading(ScreenPlanCancellation, routeProps)} />
          <Route path="/billing/downgrade/:id" render={(routeProps) => LazyLoading(ScreenPlanDowngrade, routeProps)} />
          <Route path="/compare/:ids" render={(routeProps) => LazyLoading(ScreenCompare, routeProps)} />
          <Route path="/customfields" render={(routeProps) => LazyLoading(ScreenCustomfields, routeProps)} />
          <Route path="/customfields/:type" render={(routeProps) => LazyLoading(ScreenCustomfieldsEdit, routeProps)} />
          <Route path="/develop/:id" render={(routeProps) => LazyLoading(ScreenEditor, routeProps)} />
          <Route path="/inbox/:id" render={(routeProps) => LazyLoading(ScreenInboxSettings, routeProps)} />
          <Route path="/preview/:id" render={(routeProps) => LazyLoading(ScreenPreview, routeProps)} />
          <Route path="/referral" render={(routeProps) => LazyLoading(ScreenReferral, routeProps)} />
          <Route path="/shortcuts" render={(routeProps) => LazyLoading(ScreenShortcuts, routeProps)} />
          <Route path="/singlesharing/:id" render={(routeProps) => LazyLoading(ScreenSingleSharing, routeProps)} />
          <Route path="/storage" render={(routeProps) => LazyLoading(ScreenStorage, routeProps)} />
          <Route path="/sync" render={(routeProps) => LazyLoading(ScreenSync, routeProps)} />
          <Route path="/teammates" render={(routeProps) => LazyLoading(ScreenTeammates, routeProps)} />
          <Route path="/users/me" render={(routeProps) => LazyLoading(ScreenAccount, routeProps)} />
          <Route path="/users/me/delete" render={(routeProps) => LazyLoading(ScreenDeleteAccount, routeProps)} />
          <Route path="/users/me/info" render={(routeProps) => LazyLoading(ScreenPersonalInfo, routeProps)} />
          <Route path="/users/me/restrict" render={(routeProps) => LazyLoading(ScreenRestrictAccess, routeProps)} />
          <Route path="/users/me/revoke" render={(routeProps) => LazyLoading(ScreenRevokeConsent, routeProps)} />
          <Route path="/websites/:tagId" render={(routeProps) => LazyLoading(ScreenWebsite, routeProps)} />
          <Route path="/csvUpload" render={(routeProps) => LazyLoading(CsvUploadView, routeProps)} />
        </App>
      </Switch>
    </Router>
  );
};
