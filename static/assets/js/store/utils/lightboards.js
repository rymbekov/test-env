import * as lightboardsActions from '../actions/lightboards';
import * as Api from '../../api/lightboards';
import store from '../index';
import { reloadRoute } from '../../helpers/history';

const getState = () => store.getState().lightboards;

/**
 * Set sortType field to lightboard
 * @param {string} sortType
 * @param {boolean} onlyLocal
 */
export const setSortType = (sortType, onlyLocal) => {
  const { lightboardId } = store.getState().router.location.query;
  if (onlyLocal) {
    return lightboardsActions.setSortType(lightboardId, sortType)(store.dispatch);
  }
  reloadRoute();
};

/**
 * Get lightboard by id
 * @param {string} lightboardID
 * @returns {Promise}
 */
export const getLightboardWithId = async (lightboardID) => {
  let { lightboards } = getState();
  if (!lightboards) lightboards = await Api.getAll();
  return lightboards.find((lb) => lb._id === lightboardID);
};
