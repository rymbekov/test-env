import _find from 'lodash/find';

function getTargetCollection(collections, targetCollectionId) {
  const targetCollection = _find(collections, { _id: targetCollectionId });
  
  return targetCollection;
}

export default getTargetCollection;