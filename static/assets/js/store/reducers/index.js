/* istanbul ignore file */
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import main from './main';
import collections from './collections';
import keywords from './keywords';
import assets from './assets';
import lightboards from './lightboards';
import savedSearches from './savedSearches';
import customFields from './customFields';
import notifications from './notifications';
import downloadList from './downloadList';
import user from './user';
import roles from './roles';
import teammates from './teammates';
import inboxes from '../inboxes';
import billing from './billing';
import archive from './archive';
import uploadList from './uploadList';

const createRootReducer = (history) => combineReducers({
  router: connectRouter(history),
  assets,
  main,
  collections,
  keywords,
  lightboards,
  savedSearches,
  customFields,
  downloadList,
  notifications,
  user,
  roles,
  teammates,
  inboxes,
  billing,
  archive,
  uploadList,
});

export default createRootReducer;
