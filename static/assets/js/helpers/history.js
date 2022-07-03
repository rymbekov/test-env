import remove from 'lodash.remove';
import { createBrowserHistory } from 'history';
import withQuery from 'history-query-enhancer';
import queryString from 'query-string';
import picsioConfig from '../../../../config';
import * as utils from '../shared/utils';

const getValue = (key, val) => {
  if (key === 'rating') {
    return ~~val;
  }
  if (key === 'color' && !Array.isArray(val)) {
    return [val];
  }
  if (key === 'flag' && !Array.isArray(val)) {
    return [val];
  }
  if (key === 'keywords' && !Array.isArray(val)) {
    return [val];
  }
  if (key === 'searchIn' && !Array.isArray(val)) {
    return [val];
  }

  return val;
};

export const history = withQuery({
  parse(search) {
    return Object.entries(queryString.parse(search) || {}).reduce(
      (acc, [key, val]) => ({ ...acc, [key]: getValue(key, val) }),
      {},
    );
  },
  stringify: queryString.stringify,
})(
  createBrowserHistory({
    basename: picsioConfig.isProofing() ? window.pathname : '/',
  }),
);

history.entries = [history.location];
history.listen((location, type) => (type === 'REPLACE'
  ? (history.entries[0] = location)
  : history.entries.unshift(location)));

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

  // ignore recursive search in the Trash
  if (params.trashed) delete params.recursive;

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

/**
 * Returns deconstructed search url as an object.
 */
export function getSearchProps() {
  const params = queryString.parse(window.location.search);
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
}

export function isRoutePreview(path = history.location.pathname) {
  return /^\/preview/.test(path);
}

export function isRouteSearch(path = history.location.pathname) {
  return /^\/search/.test(path) || (picsioConfig.isProofing() && path === '/');
}

export function getPreviewId() {
  if (isRoutePreview()) {
    const result = history.location.pathname.match(/preview\/(\w*)\/?/);
    const isValid = result && result.length && result.length > 1;

    if (isValid) {
      return result[1];
    }
  }
  return undefined;
}

export function isRouteFiltering() {
  const searchProps = getSearchProps();
  const searchPropsNames = Object.keys(searchProps);
  remove(searchPropsNames, (item) => ['tagId', 'lightboardId', 'recursive', 'trashed'].includes(item));
  const filteredSearchProps = searchPropsNames;
  return !!filteredSearchProps.length;
}

export function replace(path) {
  history.replace(path);
}

export function navigate(path) {
  history.push(path);
}

export function reloadApp() {
  window.location = '/';
}

export function navigateToRoot() {
  const { rootCollectionId } = window;

  const queryItems = {
    tagId: rootCollectionId,
  };

  const searchProps = getSearchProps();
  if (searchProps.bbox || searchProps.zoom) {
    queryItems.bbox = searchProps.bbox || [-180, -90, 180, 90];
    queryItems.zoom = searchProps.zoom || 2;
  }

  const qs = constructQueryString(queryItems, { forceRecursive: false });

  navigate({
    pathname: '/search',
    search: qs,
  });
}

export function setSearchRoute(
  queryItems,
  { shouldReplace = false, forceRecursive = false } = {},
) {
  if (picsioConfig.isProofing() && !Object.keys(queryItems).length) {
    navigateToRoot();
    return;
  }

  const catalogViewMode = utils.LocalStorage.get('picsio.catalogViewMode') || 'grid';
  if (catalogViewMode === 'geo') {
    if (isRoutePreview()) return;
    if (!queryItems.bbox || (queryItems.bbox && !queryItems.bbox.length)) queryItems.bbox = [-180, -90, 180, 90];
    if (!queryItems.zoom) queryItems.zoom = 2;
  }

  const qs = constructQueryString(queryItems, { forceRecursive });
  if (shouldReplace) {
    replace({
      pathname: '/search',
      search: qs,
    });
  } else {
    // here we also should process fields that possible date ranges
    navigate({
      pathname: '/search',
      search: qs,
    });
  }
  // Intercom fetches new messages on page reloads
  // for SPA we should call `Intercom.update` manually on each route reload to fetch messages
  if (picsioConfig.ENV === 'production') {
    window.Intercom && window.Intercom('update');
  }
}

// we use it for handle updateSortType/setSortType in Lightboards and Collections.
export function reloadRoute() {
  history.replace(history.location.pathname + history.location.search);
}

export function back(toPath) {
  const [currentLocation, ...clonedAndModified] = history.entries.map((n) => ({
    ...n,
    cleanedPathname: n.pathname.replace(/^\/preview\/.{24}/, '/preview'),
  }));

  let location;
  if (toPath) {
    location = clonedAndModified.find(
      (item) => item.cleanedPathname === toPath,
    );
  } else {
    location = clonedAndModified.find(
      (item) => item.cleanedPathname !== currentLocation.pathname,
    );
  }

  if (location) {
    navigate(location.pathname + location.search);
  } else {
    navigateToRoot();
  }
}

export default history;
