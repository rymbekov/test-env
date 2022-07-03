import remove from 'lodash.remove';
import { NEW_PATH_DELIMITER } from '@picsio/db/src/constants';
import * as utils from '../../shared/utils';
import localization from '../../shared/strings';

/**
 * Make SavedSearches tree from list
 * @param {Object[]} savedSearchesTree
 * @returns {Object}
 */
export function makeTree(items, userId) {
  const list = items.map((svdSearch) => ({ ...svdSearch }));
  const tree = {
    favorites: {
      name: localization.SAVEDSEARCHESTREE.textFavorites,
      path: 'favorites',
      root: true,
      isOpen:
				utils.getCookie('picsio.savedSearchedTree.favorites.open') === null
				|| utils.getCookie('picsio.savedSearchedTree.favorites.open'),
      nodes: [],
    },
    savedSearches: {
      name: localization.SAVEDSEARCHESTREE.textSavedSearches,
      path: 'savedSearches',
      root: true,
      isOpen:
				utils.getCookie('picsio.savedSearchedTree.savedSearches.open') === null
				|| utils.getCookie('picsio.savedSearchedTree.savedSearches.open'),
      nodes: [],
    },
  };

  // turning plain savedSearch array to tree
  const savedSearchesTree = [];
  const mapSavedSearches = { savedSearchesTree };

  list.forEach((svdSearch) => {
    const pathArr = svdSearch?.path?.split(NEW_PATH_DELIMITER);
    if (!pathArr) {
      mapSavedSearches.savedSearchesTree.push({
        ...svdSearch,
        nodes: [],
      });
      return;
    }

    pathArr?.shift();
    const pathArrLength = pathArr.length;

    pathArr?.reduce((acc, name, i) => {
      if (!acc[name]) {
        acc[name] = { savedSearchesTree: [] };
        // this check to make sure that data of the saved search goes only to the child
        if (pathArrLength - 1 === i) {
          acc.savedSearchesTree.push({
            ...svdSearch,
            name,
            buttons: pathArrLength <= 1,
            nodes: acc[name].savedSearchesTree,
          });
        } else {
          acc.savedSearchesTree.push({
            _id: `tree${svdSearch._id}`,
            name,
            buttons: pathArrLength <= 1,
            nodes: acc[name].savedSearchesTree,
          });
        }
      }
      return acc[name];
    }, mapSavedSearches);
  });

  tree.savedSearches.nodes = savedSearchesTree;
  tree.favorites.nodes = list.filter(
    (node) => node.favorites !== undefined && node.favorites.length > 0 && node.favorites.includes(userId),
  );

  return tree;
}

/**
 * Make search tree
 * @param {Object[]} all
 * @param {string} searchQuery
 * @returns {Object} search tree
 */
export const makeSearchTree = (all, searchQuery, userId) => {
  // this code for search by parent node too, it shows all the children of the searched node

  // const savedSearches = all
  //   .filter((savedSearch) => {
  //     const pathArr = savedSearch.path.toLowerCase().split(SEPARATOR);
  //     for (let i = 0; i < pathArr.length; i++) {
  //       if (pathArr[i].includes(searchQuery.toLowerCase())) {
  //         return true;
  //       }
  //     }
  //   })
  //   .map((node) => ({ ...node, name: node.path.split(SEPARATOR)[node.path.split(SEPARATOR).length - 1] }));

  const savedSearches = all.filter((node) => node.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const tree = {
    favorites: {
      name: localization.SAVEDSEARCHESTREE.textFavorites,
      path: 'favorites',
      root: true,
      isOpen:
				utils.getCookie('picsio.savedSearchedTree.favorites.open') === null
				|| utils.getCookie('picsio.savedSearchedTree.favorites.open'),
      nodes: savedSearches.filter(
        (node) => node.favorites !== undefined && node.favorites.length > 0 && node.favorites.includes(userId),
      ),
    },
    savedSearches: {
      name: localization.SAVEDSEARCHESTREE.textSavedSearches,
      path: 'savedSearches',
      root: true,
      isOpen:
				utils.getCookie('picsio.savedSearchedTree.savedSearches.open') === null
				|| utils.getCookie('picsio.savedSearchedTree.savedSearches.open'),
      nodes: savedSearches,
    },
  };

  return tree;
};

/**
 * Remove savedSearches
 * @param {Object} tree
 * @param {Object[]} all
 * @param {string} id
 * @returns {Object}
 */
export function removeSavedSearches(tree, all, id) {
  const result = {
    all: [...all],
    favorites: { ...tree.favorites },
    savedSearches: { ...tree.savedSearches },
  };

  const item = all.find((el) => el._id === id);
  const handle = (ss) => {
    if (ss.nodes && ss.nodes.length > 0) {
      const nodesForRemove = ss.nodes.filter((node) => node._id === id);
      if (nodesForRemove.length > 0) {
        nodesForRemove.forEach((node) => remove(ss.nodes, (i) => i === node));
      } else {
        ss.nodes = ss.nodes.map(handle);
      }
    }
    return ss;
  };

  if (item) {
    result.all = result.all.filter((node) => node._id !== id);
    result.savedSearches = handle(result.savedSearches);
    result.favorites = handle(result.favorites);
  }

  return result;
}

/**
 * Set favorites
 * @param {Object} tree
 * @param {Object[]} all
 * @param {string} id
 * @param {string} userId
 * @returns {Object}
 */
export function changeFavorites(tree, all, id, userId) {
  const item = all.find((el) => el._id === id);
  const itemFavorite = tree.favorites.nodes.find((el) => el._id === id);
  let updatedTree = {};

  if (item) {
    if (itemFavorite === undefined) {
      if (!item.favorites) {
        item.favorites = [];
      }
      item.favorites.push(userId);
      updatedTree = makeTree(all, userId);
    } else {
      item.favorites = item.favorites.filter((id) => id !== userId);
      updatedTree = makeTree(all, userId);
    }
  }

  const result = {
    all: [...all],
    favorites: { ...updatedTree.favorites },
    savedSearches: { ...updatedTree.savedSearches },
  };

  return result;
}

/**
 * Set field to savedSearch
 * @param {Object} tree
 * @param {string} id
 * @param {string} fieldName
 * @param {*} fieldValue
 * @returns {Object} new tree
 */
export function setField(tree, id, fieldName, fieldValue) {
  const handleSavedSearch = (savedSearch) => {
    if (savedSearch.nodes && savedSearch.nodes.length > 0) {
      savedSearch.nodes = savedSearch.nodes.map(handleSavedSearch);
    }
    return savedSearch._id === id ? { ...savedSearch, [fieldName]: fieldValue } : savedSearch;
  };

  return {
    favorites: handleSavedSearch(tree.favorites),
    savedSearches: handleSavedSearch(tree.savedSearches),
  };
}
