import _find from 'lodash/find';

import getRestrictedPaths from './getRestrictedPaths';
import getCollectionsByPath from './getCollectionsByPath';

const recursiveMap = (tree, collections, options = {}, fullPath = '') => {
  return tree.map((i) => {
    const { name, path, hasChild } = i;
    const childs = i[options.childsKey];
    const currentPath = path === 'root' ? '/' : `${fullPath}${name}/`;
    const currentNewChilds = getCollectionsByPath(collections, currentPath, options.restrictedPaths);

    if (childs) {
      const updatedChilds = childs.map((c) => {
        const newChild = options.update ? _find(currentNewChilds, { _id: c._id }) : null;
        if (newChild) {
          return { ...c, ...newChild };
        }
        return c;
      });
      const newestChilds = currentNewChilds.filter((c) => !_find(updatedChilds, { _id: c._id }));
      const mergedChilds = [...newestChilds, ...updatedChilds];
      
      return {
        ...i,
        [options.childsKey]: recursiveMap(mergedChilds, collections, options, currentPath),
      };
    }
    if (!hasChild && currentNewChilds.length) {
      return {
        ...i,
        hasChild: true,
        [options.childsKey]: currentNewChilds,
      };
    }
    return i;
  });
};

const defaultOptions = {
  childsKey: 'children',
  user: {},
  update: true
};

const getTreeWithNewCollections = (tree, collections, options = {}) => {
  const mergedOptions = { ...defaultOptions, ...options };
  const { user } = mergedOptions;
  const restrictedPaths = getRestrictedPaths(user);
  
  return recursiveMap(tree, collections, { ...mergedOptions, restrictedPaths });
};

export default getTreeWithNewCollections;