import _find from 'lodash/find';

import getRestrictedPaths from './getRestrictedPaths';
import getCollectionsByPath from './getCollectionsByPath';

const recursiveFilter = (tree, collections, update = [], options, fullPath = '') => {
  return tree.reduce((acc, i) => {
    const { name, path } = i;
    const childs = i[options.childsKey];
    const currentPath = path === 'root' ? '/' : `${fullPath}${name}/`;
    const currentDeletedChilds = getCollectionsByPath(collections, currentPath, options.restrictedPaths);

    if (childs) {
      const filteredChilds = childs.reduce((result, c) => {
        const isExist = !!_find(currentDeletedChilds, { _id: c._id });

        if (!isExist) {
          const childUpdate = options.update ? _find(update, { _id: c._id }) : null;

          if (childUpdate) {
            return [...result, { ...c, ...childUpdate }];
          }
          return [...result, c];
        }
        return result;
      }, []);

      if (!filteredChilds.length) {
        return [...acc, { ...i, hasChild: false, children: null } ];
      }
      return [
        ...acc,
        {
          ...i,
          [options.childsKey]: recursiveFilter(filteredChilds, collections, update, options, currentPath),
        },
      ];      
    }
    return [...acc, i];
  }, []);
};

const defaultOptions = {
  childsKey: 'children',
  user: {},
  update: true
};

const getTreeWithoutCollections = (tree, collections, update, options = {}) => {
  const mergedOptions = { ...defaultOptions, ...options };
  const { user } = mergedOptions;
  const restrictedPaths = getRestrictedPaths(user);
  
  return recursiveFilter(tree, collections, update, { ...mergedOptions, restrictedPaths });
};

export default getTreeWithoutCollections;