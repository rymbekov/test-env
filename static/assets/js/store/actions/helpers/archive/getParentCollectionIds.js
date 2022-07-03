import _map from 'lodash/map';

import findParentCollections from './findParentCollections';

function getParentCollectionIds(collections, targetCollection, childKey) {
  const parentCollections = findParentCollections(collections, targetCollection, childKey);

  return _map(parentCollections, '_id');
}

export default getParentCollectionIds;