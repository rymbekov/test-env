import { createSelector } from 'reselect';

// const archiveSelector = (state) => Boolean(
//  state.main.openedTree === 'archive' && state.archive.activeCollection);
const archiveSelector = (state) => Boolean(
  state.router.location.query.archived && state.archive.activeCollection,
);

const getActiveCollection = (state) => state.collections.activeCollection;

const getActiveArchiveCollection = (state) => state.archive.activeCollection;

export const activeCollectionSelector = createSelector(
  archiveSelector,
  getActiveCollection,
  getActiveArchiveCollection,
  (isArchive, collection, archiveCollection) => (isArchive ? archiveCollection : collection),
);

export default {
  activeCollectionSelector,
};
