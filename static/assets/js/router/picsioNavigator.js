import React from 'react';
import remove from 'lodash.remove';
import { createBrowserHistory } from 'history';
import picsioConfig from '../../../../config';
import * as utils from '../shared/utils';

export const history = createBrowserHistory({
  basename: picsioConfig.isProofing() ? window.pathname : '/',
});
history.entries = [history.location];
history.listen((location, type) => (type === 'REPLACE' ? (history.entries[0] = location) : history.entries.unshift(location)));

// uses for run callback in listenSearch() when user changing sortType
let isSorting = false;

const constructQueryString = (params, options) => {
  // recursively search - undefined === true
  // we don't store value as "true" in browser navigating string

  if (!options.forceRecursive) {
    // so we always remove it
    delete params.recursive;
  }

  // then set it "false" if it stored in cookies
  const notRecursiveSearch = utils.LocalStorage.get('picsio.recursiveSearch') === false;
  if (notRecursiveSearch) params.recursive = false;

  return Object.entries(params)
    .reduce((acc, [key, value]) => {
      if (value === null || value === undefined) return acc;
      if (Array.isArray(value)) {
        value.forEach((item) => acc.push(`${encodeURIComponent(key)}=${encodeURIComponent(item)}`));
      } else {
        acc.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
      return acc;
    }, [])
    .join('&');
};

const picsioNavigator = {
  /**
	 * Set search route with passed key=value object
	 */
  setSearchRoute(queryItems, { replace = false, forceRecursive = false } = {}) {
    if (picsioConfig.isProofing() && !Object.keys(queryItems).length) {
      picsioNavigator.navigateToRoot();
      return;
    }

    const catalogViewMode = utils.LocalStorage.get('picsio.catalogViewMode') || 'grid';
    if (catalogViewMode === 'geo') {
      if (picsioNavigator.isRoutePreview()) return;
      if (!queryItems.bbox || (queryItems.bbox && !queryItems.bbox.length)) queryItems.bbox = [-180, -90, 180, 90];
      if (!queryItems.zoom) queryItems.zoom = 2;
    }

    const qs = constructQueryString(queryItems, { forceRecursive });
    if (replace) {
      picsioNavigator.replace(`/search?${qs}`);
    } else {
      // here we also should process fields that possible date ranges
      picsioNavigator.navigate(`/search?${qs}`);
    }

    isSorting = false;

    // Intercom fetches new messages on page reloads
    // for SPA we should call `Intercom.update` manually on each route reload to fetch messages
    window.Intercom && window.Intercom('update');
  },

  /**
	 * Returns deconstructed search url as an object.
	 */
  getSearchProps() {
    const qs = window.location.search.replace(/^\?/, '');
    const params = utils.deconstructQueryString(qs);
    // normalize types and values
    // not sure if validation code should be here
    Object.keys(params).forEach((key) => {
      if (key === 'rating') {
        params.rating = ~~params.rating;
      }
      if (key === 'color' && !Array.isArray(params.color)) {
        params.color = [params.color];
      }
      if (key === 'flag' && !Array.isArray(params.flag)) {
        params.flag = [params.flag];
      }
      if (key === 'keywords' && !Array.isArray(params.keywords)) {
        params.keywords = [params.keywords];
      }
      if (key === 'searchIn' && !Array.isArray(params.searchIn)) {
        params.searchIn = [params.searchIn];
      }
    });
    return params;
  },

  replace(path) {
    history.replace(path);
  },

  // TODO should be removed everywhere. it's bad practise in React app. (с) NightNei
  // it uses for 'refresh page' without full reloading in notifications center
  // and we use it for handle updateSortType/setSortType in Lightboards and Collections.
  reloadRoute() {
    isSorting = true; // if somebody decide to remove this, think about change sortType :) (с) AM
    history.replace(history.location.pathname + history.location.search);
  },

  reloadApp() {
    window.location = '/';
  },

  navigateToRoot: () => {
    picsioNavigator.navigate('/');
  },

  isRouteTag() {
    const s = picsioNavigator.getSearchProps();
    return Object.keys(s).length === 1 && 'tagId' in s;
  },

  isRouteFiltering() {
    const searchProps = picsioNavigator.getSearchProps();
    const searchPropsNames = Object.keys(searchProps);
    remove(searchPropsNames, (item) => ['tagId', 'lightboardId', 'recursive', 'trashed'].includes(item));
    const filteredSearchProps = searchPropsNames;
    return !!filteredSearchProps.length;
  },

  isRoutePreview(path = history.location.pathname) {
    return /^\/preview/.test(path);
  },

  isRouteSearch(path = history.location.pathname) {
    return /^\/search/.test(path) || (picsioConfig.isProofing() && path === '/');
  },

  getPreviewId() {
    if (this.isRoutePreview()) {
      const result = history.location.pathname.match(/preview\/(\w*)\/?/);
      const isValid = result && result.length && result.length > 1;

      if (isValid) {
        return result[1];
      }
    }
    return undefined;
  },

  navigate(path) {
    history.push(path);
    isSorting = false;
  },

  back(toPath) {
    const [currentLocation, ...clonedAndModified] = history.entries.map((n) => ({
      ...n,
      cleanedPathname: n.pathname.replace(/^\/preview\/.{24}/, '/preview'),
    }));

    let location;
    if (toPath) {
      location = clonedAndModified.find((item) => item.cleanedPathname === toPath);
    } else {
      location = clonedAndModified.find((item) => item.cleanedPathname !== currentLocation.pathname);
    }

    location ? picsioNavigator.navigate(location.pathname + location.search) : picsioNavigator.navigateToRoot();
  },

  listenSearch(callback) {
    const unlisten = history.listen((...args) => {
      if (!picsioNavigator.isRouteSearch()) return;

      const currentSearch = history.entries[0];
      const prevSearch = history.entries.find((item, index) => {
        const isNotCurrent = !!index;
        return isNotCurrent && picsioNavigator.isRouteSearch(item.pathname);
      });
      let isBackToPrevSearch = !!prevSearch && prevSearch.search === currentSearch.search;

      // if isSorting = true - we needs to run callback for fetching assets
      if (isSorting) {
        isBackToPrevSearch = false;
      }

      !isBackToPrevSearch && callback(...args); // ignore refetch assets
    });
    picsioNavigator.isRouteSearch() && callback();
    return unlisten;
  },

  createRouteSwitcher(DefaultScreen, screens) {
    return (historyData) => {
      const { pathname } = historyData.location;
      let CurrentScreen;

      if (screens[pathname]) {
        CurrentScreen = screens[pathname];
      } else {
        Object.entries(screens).forEach(([routeName, screen]) => {
          const splittedPathname = pathname.split('/');
          const splittedRoutename = routeName.split('/');

          if (splittedPathname.length !== splittedRoutename.length) return;

          const params = {};
          splittedRoutename.forEach((item, index) => {
            if (item.startsWith(':')) {
              params[item.slice(1)] = splittedPathname[index];
              splittedPathname[index] = item;
            }
          });
          if (splittedPathname.join('') === splittedRoutename.join('')) {
            CurrentScreen = screen;
            historyData.match.params = params;
          }
        });
      }

      return (
        <DefaultScreen {...historyData}>{CurrentScreen ? <CurrentScreen {...historyData} /> : null}</DefaultScreen>
      );
    };
  },
};

export default picsioNavigator;
