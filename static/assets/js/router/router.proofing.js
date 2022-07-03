import React, { useEffect } from 'react';
import {
  Router, Route, Switch, useLocation, useHistory,
} from 'react-router-dom';
import { usePrevious } from 'react-use';
import { useDispatch, useSelector } from 'react-redux';
import picsioConfig from '../../../../config';
import { isRouteSearch, navigateToRoot } from '../helpers/history';

import AppProofing from '../components/AppProofing';
import ScreenPreview from '../components/previewView';
import { setActiveCollection } from '../store/actions/collections';
import { activeCollectionSelector } from '../store/selectors/collections';
import { getAssets, deselectAll } from '../store/actions/assets';

function useRouteListener() {
  const dispatch = useDispatch();
  const location = useLocation();
  const reactHistory = useHistory();
  // const { activeCollection } = useSelector((state) => state.collections);
  const activeCollection = useSelector((state) => activeCollectionSelector(state));
  const { collections } = useSelector((state) => state.collections);
  const { isFetching } = collections?.my || false;
  const prevSearchQuery = usePrevious(location);

  // Get assets
  useEffect(
    () => {
      if (!isRouteSearch()) return;

      const currentSearch = reactHistory.entries[0];
      const prevSearch = reactHistory.entries.find((item, index) => {
        const isNotCurrent = !!index;
        return isNotCurrent && isRouteSearch(item.pathname);
      });
      const isBackToPrevSearch = !!prevSearch && prevSearch.search === currentSearch.search;
      if (!isBackToPrevSearch) {
        dispatch(getAssets(true));
      }
    },
    [location, dispatch, reactHistory],
  );

  useEffect(() => {
    function handleSearchRouteChange() {
      const { tagId } = location.query;

      if (tagId) {
        if (!tagId || tagId.length !== 24) {
          navigateToRoot();
          return;
        }

        // Set active collection. Used by Search placeholder
        if (picsioConfig.access.searchShow) {
          if (activeCollection?._id === tagId) return;
          if (!isFetching) {
            dispatch(setActiveCollection(tagId));
          }
        }
      }

      dispatch(deselectAll());
    }

    if (location !== prevSearchQuery) {
      handleSearchRouteChange();
    }
  }, [isFetching, activeCollection, location, dispatch, prevSearchQuery]);
}

export default () => {
  const reactHistory = useHistory();
  useRouteListener();

  return (
    <Router history={reactHistory}>
      <Switch>
        <AppProofing>
          <Route path="/preview/:id" component={ScreenPreview} />
        </AppProofing>
      </Switch>
    </Router>
  );
};
