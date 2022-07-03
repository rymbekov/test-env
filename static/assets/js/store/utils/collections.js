import Q from 'q';
import * as collectionsActions from '../actions/collections';
import store from '../index';
import * as collectionsApi from '../../api/collections';
import { findCollection } from '../helpers/collections';
import picsioConfig from '../../../../../config';

const getState = () => store.getState().collections;

/**
 * Set sortType field to collection
 * @param {string} sortType
 * @param {boolean} onlyLocal
 */
export const setSortType = (sortType, onlyLocal) => {
  const { tagId: collectionID } = store.getState().router.location.query;
  collectionsActions.setSortType(
    collectionID ? collectionID : sortType.id,
    sortType,
    onlyLocal,
  )(store.dispatch);
};

/**
 * Get tag by id
 * @param {string} collectionID
 * @returns {Promise}
 */
export const forceFindTagWithTagId = async (collectionID) => {
  const query = { _id: collectionID };
  let localCollection = findCollection(getState().collections, null, query)
    || findCollection(getState().search.collections, null, query);
  if (picsioConfig.isProofing()) return localCollection;
  if (!localCollection) {
    localCollection = await collectionsApi.getCollection(collectionID);
  } else if (!localCollection.storageId) {
    const tag = await collectionsApi.getCollection(collectionID);
    localCollection.storageId = tag.storageId;
  }

  return localCollection;
};

/** Find root tag
 * @returns {Promise}
 */
export const forceFindRootTag = () => Q(
  (() => findCollection(getState().collections, null, { path: 'root' })
      || collectionsApi.getRoot())(),
);

/**
 * Get id of root tag
 * @returns {string} tag id
 */
export const getRootId = () => findCollection(getState().collections, null, { path: 'root' })._id;

export const isRootActive = () => store.getState().router.location.query.tagId === getRootId();
