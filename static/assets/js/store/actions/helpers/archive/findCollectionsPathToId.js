import _map from 'lodash/map';

/* eslint-disable no-param-reassign */
const recursiveFind = (collections, targetId, childsKey = 'children', list) => collections.every((c) => {
  const { _id } = c;
  const children = c[childsKey];
  
  list.push(c);
  
  if (_id === targetId) {
    return false;
  }
  if (children && children.length) {
    const result = recursiveFind(children, targetId, childsKey, list);

    if (result) {
      list.length -= 1;
    }
    return result;
  }
  list.length -= 1;
  return true;
});
/* eslint-enable no-param-reassign */

// find all collections on the way to target collection 
function findCollectionsPathToId(collections, targetId, childsKey) {
  const list = [];
  recursiveFind(collections, targetId, childsKey, list);
  
  const path = _map(list, '_id'); 
  return { path, list };
}

export default findCollectionsPathToId;
