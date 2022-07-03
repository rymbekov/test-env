import remove from 'lodash.remove';
import _ from 'lodash';
import localization from '../../shared/strings';
import * as utils from '../../shared/utils';
import Logger from '../../services/Logger';
import { NEW_PATH_DELIMITER } from '@picsio/db/src/constants';

const sortAlgorithms = {
  createdAt: {
    asc: (a, b) => ((a.createdAt || '') < (b.createdAt || '')
      ? -1
      : (a.createdAt || '') > (b.createdAt || '') ? 1 : sortAlgorithms.name.asc(a, b)),
    desc: (a, b) => ((a.createdAt || '') > (b.createdAt || '')
      ? -1
      : (a.createdAt || '') < (b.createdAt || '') ? 1 : sortAlgorithms.name.desc(a, b)),
  },

  name: {
    asc: (a, b) => ((a.path || a.title).toLowerCase() < (b.path || b.title).toLowerCase()
      ? -1
      : (a.path || a.title).toLowerCase() > (b.path || b.title).toLowerCase() ? 1 : 0),
    desc: (a, b) => ((a.path || a.title).toLowerCase() > (b.path || b.title).toLowerCase()
      ? -1
      : (a.path || a.title).toLowerCase() < (b.path || b.title).toLowerCase() ? 1 : 0),
  },
  count: {
    asc: (a, b) => ((a.count || 0) < (b.count || 0) ? -1 : (a.count || 0) > (b.count || 0) ? 1 : sortAlgorithms.name.asc(a, b)),
    desc: (a, b) => ((a.count || 0) > (b.count || 0) ? -1 : (a.count || 0) < (b.count || 0) ? 1 : sortAlgorithms.name.desc(a, b)),
  },
};

/**
 * Make keywords tree from list
 * @param {Object[]} allKeywords
 * @param {string} sortType
 * @returns {Object}
 */
export function makeTree(allKeywords, sortType) {
  const list = allKeywords.map((node) => ({ ...node }));
  const tree = {
    favorites: {
      title: localization.COLLECTIONS.titleFavorites,
      path: `${NEW_PATH_DELIMITER}${localization.COLLECTIONS.titleFavorites}`,
      root: true,
      _id: 'favorites',
      isOpen:
        utils.LocalStorage.get('picsio.keywordsTree.favorites.open') === null
        || utils.LocalStorage.get('picsio.keywordsTree.favorites.open'),
      nodes: [],
    },
    keywords: {
      title: localization.COLLECTIONS.titleKeywords,
      path: `${NEW_PATH_DELIMITER}${localization.COLLECTIONS.titleKeywords}`,
      root: true,
      _id: 'keywords',
      isOpen:
        utils.LocalStorage.get('picsio.keywordsTree.main.open') === null || utils.LocalStorage.get('picsio.keywordsTree.main.open'),
      nodes: [],
    },
  };
  const mapKeywords = {};

  list.forEach((keyword) => {
    /** add to map */
    mapKeywords[keyword.path.toLowerCase()] = keyword;
  });

  tree.keywords.nodes = list
    .map((keyword) => {
      /** add to favorites */
      if (keyword.isFavorite) tree.favorites.nodes.push(keyword);

      /** @type {string[]} */
      const path = keyword.path.split(NEW_PATH_DELIMITER);

      if (path.length < 3) return keyword;

      const parentName = path.slice(0, -1).join(NEW_PATH_DELIMITER);
      const parentKeyword = mapKeywords[parentName.toLowerCase()];

      if (!parentKeyword) {
        console.error(`Keywords error: No such parent ${parentName} for keyword`, keyword);
        return keyword;
      }
      if (parentKeyword.nodes) {
        parentKeyword.nodes.push(keyword);
      } else {
        parentKeyword.nodes = [keyword];
      }
    })
    .filter((keyword) => !!keyword);

  tree.keywords.nodes = sort(tree.keywords.nodes, sortType);
  tree.favorites.nodes = sort(tree.favorites.nodes, sortType);

  return tree;
}

/**
 * Make search tree
 * @param {Object[]} all
 * @param {string} searchQuery
 * @param {string} sortType
 * @returns {Object} search tree
 */
export const makeSearchTree = (all, searchQuery, sortType) => {
  const keywords = all.filter((node) => node.path
    .split(NEW_PATH_DELIMITER)
    .pop()
    .toLowerCase()
    .includes(searchQuery.toLowerCase()));
  return {
    favorites: {
      title: localization.COLLECTIONS.titleFavorites,
      path: `→${localization.COLLECTIONS.titleFavorites}`,
      root: true,
      _id: 'favorites',
      isOpen:
        utils.LocalStorage.get('picsio.keywordsTree.favorites.open') === null
        || utils.LocalStorage.get('picsio.keywordsTree.favorites.open'),
      nodes: sort(keywords.filter((node) => !!node.isFavorite), sortType),
    },
    keywords: {
      title: localization.COLLECTIONS.titleKeywords,
      path: `→${localization.COLLECTIONS.titleKeywords}`,
      root: true,
      _id: 'keywords',
      isOpen:
        utils.LocalStorage.get('picsio.keywordsTree.main.open') === null || utils.LocalStorage.get('picsio.keywordsTree.main.open'),
      nodes: sort(keywords, sortType),
    },
  };
};

/**
 * Add keyword
 * @param {Object} tree
 * @param {string} parentID
 * @param {Object} _node
 * @param {string} sortType
 * @returns {Object}
 */
export function addKeyword(tree, parentID, _node, sortType) {
  const handleKeyword = (keyword) => {
    const node = { ..._node };
    if (keyword.nodes && keyword.nodes.length > 0) {
      keyword.nodes = keyword.nodes.map(handleKeyword);
    }
    if (keyword._id === parentID) {
      if (keyword.nodes) {
        // don't add dublicates
        if (keyword.nodes.find((item) => item._id === node._id)) {
          return { ...keyword, nodes: [...keyword.nodes] };
        }
        return { ...keyword, nodes: [node, ...keyword.nodes] };
      }
      return { ...keyword, nodes: [node] };
    }
    return keyword;
  };

  const newFavorites = parentID ? handleKeyword(tree.favorites) : null;
  const newKeywords = handleKeyword(tree.keywords);

  return {
    favorites: newFavorites ? { ...newFavorites, nodes: sort(newFavorites.nodes, sortType) } : tree.favorites,
    keywords: { ...newKeywords, nodes: sort(newKeywords.nodes, sortType) },
  };
}

/**
 * Set field to keyword
 * @param {Object} tree
 * @param {string} id
 * @param {string} fieldName
 * @param {*} fieldValue
 * @returns {Object} new tree
 */
export function setField(tree, id, fieldName, fieldValue) {
  const handleKeyword = (keyword) => {
    if (keyword.nodes && keyword.nodes.length > 0) {
      keyword.nodes = keyword.nodes.map(handleKeyword);
    }
    return keyword._id === id ? { ...keyword, [fieldName]: fieldValue } : keyword;
  };

  return {
    favorites: handleKeyword(tree.favorites),
    keywords: handleKeyword(tree.keywords),
  };
}

/**
 * Update count
 * @param {Object} tree
 * @param {string} id
 * @param {number} value
 * @returns {Object} new tree
 */
export function updateCount(tree, id, value) {
  const handleKeyword = (keyword) => {
    if (keyword.nodes && keyword.nodes.length > 0) {
      keyword.nodes = keyword.nodes.map(handleKeyword);
    }
    return keyword._id === id ? { ...keyword, count: (keyword.count || 0) + value } : keyword;
  };

  return {
    favorites: handleKeyword(tree.favorites),
    keywords: handleKeyword(tree.keywords),
  };
}

/**
 * Rename keyword
 * @param {Object} tree
 * @param {Object[]} all
 * @param {string} id
 * @param {string} name
 * @param {string} sortType
 * @return {Object} - new tree
 */
export function rename(tree, all, id, name, sortType) {
  let oldPath = '';
  let newPath = '';
  function handle(keyword) {
    if (keyword.nodes && keyword.nodes.length > 0) {
      keyword.nodes = keyword.nodes.map(handle);
    }

    if (keyword._id === id) {
      oldPath = keyword.path;
      const path = keyword.path.split(NEW_PATH_DELIMITER);
      path[path.length - 1] = name;
      newPath = path.join(NEW_PATH_DELIMITER);
      return { ...keyword, path: newPath, isRenaming: false };
    }
    return keyword;
  }

  const newFavorites = handle(tree.favorites);
  const newKeywords = handle(tree.keywords);

  const result = {
    favorites: { ...newFavorites, nodes: sort(newFavorites.nodes, sortType) },
    keywords: { ...newKeywords, nodes: sort(newKeywords.nodes, sortType) },
    all: all.map((node) => {
      if (node.path.startsWith(oldPath)) {
        return { ...node, path: node.path.replace(oldPath, newPath) };
      }
      return node;
    }),
  };
  return result;
}

/**
 * Set favorites
 * @param {Object} tree
 * @param {Object[]} all
 * @param {string} id
 * @param {boolean} value
 * @param {string} sortType
 * @returns {Object}
 */
export function changeFavorites(tree, all, id, value, sortType) {
  const result = {
    favorites: { ...tree.favorites },
    keywords: { ...tree.keywords },
    all: [...all],
  };
  const keyword = findKeyword(result, 'keywords', { _id: id });

  if (keyword) {
    if (value) {
      // result.favorites.nodes.push(Object.clone(keyword, true));
      result.favorites.nodes.push({ ...keyword });
      result.favorites.nodes = sort(result.favorites.nodes, sortType);
    } else {
      const keywordToRemove = findKeyword(result, 'favorites', { _id: id });
      remove(result.favorites.nodes, (item) => item._id === keywordToRemove._id);
    }
  }
  findKeywords(result, null, { _id: id }).forEach((keyword) => {
    keyword.isFavorite = value;
    keyword.isBusy = false;
  });

  for (let i = 0; i < result.all.length; i++) {
    if (result.all[i]._id === id) {
      result.all[i].isFavorite = value;
      break;
    }
  }

  return result;
}

/**
 * Remove keywords
 * @param {Object} tree
 * @param {Object[]} all
 * @param {string[]} ids
 * @returns {Object}
 */
export function removeKeywords(tree, all, ids) {
  const result = {
    all: [...all],
    favorites: { ...tree.favorites },
    keywords: { ...tree.keywords },
  };
  const keywordsToDelete = all.filter((keyword) => ids.includes(keyword._id));

  function filterFunction(node) {
    return ids.includes(node._id)
      || keywordsToDelete.some((keyword) => node.path.startsWith(keyword.path + NEW_PATH_DELIMITER));
  }

  const handle = (kw) => {
    if (kw.nodes?.length > 0) {
      const nodesForRemove = kw.nodes.filter(filterFunction);
      if (nodesForRemove.length > 0) {
        nodesForRemove.forEach((node) => remove(kw.nodes, (i) => i === node));
      }
      kw.nodes = kw.nodes.map(handle);
    }

    return kw;
  };

  if (keywordsToDelete?.length) {
    remove(result.all, filterFunction);
    result.keywords = handle(result.keywords);
    result.favorites = handle(result.favorites);
  }

  return result;
}

/**
 * Move keyword
 * @param {Object} tree
 * @param {Object[]} _all
 * @param {string} id
 * @param {string} parentID
 * @returns {Object} new tree and all
 */
export function move(tree, _all, id, parentID, sortType) {
  const all = [..._all];
  const itemForMove = all.find((node) => node._id === id);
  if (!itemForMove) return { ...tree, all };

  const parentForMove = all.find((node) => node._id === parentID);
  const parentPath = parentForMove ? parentForMove.path : '';

  const oldPath = itemForMove.path;
  const newPath = parentPath + NEW_PATH_DELIMITER + itemForMove.path.split(NEW_PATH_DELIMITER).pop();

  const childrenForMove = all.filter((node) => node.path.startsWith(oldPath) && node._id !== id);

  itemForMove.path = newPath;
  childrenForMove.forEach((node) => (node.path = node.path.replace(oldPath, newPath)));

  return {
    all,
    ...makeTree(all, sortType),
  };
}

/**
 * Sort
 * @param {Object[]} list
 * @param {Object} type
 * @returns {Object[]} sorted list
 */
export function sort(list, sortType) {
  if (!sortAlgorithms?.[sortType.type]?.[sortType.order]) {
    Logger.info(`Wrong sortType passed to sort helper [${JSON.stringify(sortType)}]`);
    sortType = { type: 'createdAt', order: 'asc' };
  }

  const algorithm = sortAlgorithms[sortType.type][sortType.order];
  list.sort(algorithm);
  list.forEach((node) => {
    if (node.nodes && node.nodes.length > 0) sort(node.nodes, sortType);
  });
  return list;
}

/**
 * Find keyword
 * @param {Object} tree
 * @param {string} nameTree
 * @param {Object} query(!)
 * @return {Object}
 */
export function findKeyword(tree, nameTree, query) {
  if (!tree) return undefined;

  let item;
  const loop = function (list = []) {
    list.forEach((n) => {
      Object.keys(query).every((key) => n[key] === query[key]) && (item = n);
      n.nodes && loop(n.nodes);
    });
  };
  if (nameTree) {
    loop([tree[nameTree]]);
  } else {
    Object.keys(tree).forEach((nameTree) => {
      loop([tree[nameTree]]);
    });
  }
  return item;
}

/**
 * Find keywords
 * @param {Object} tree
 * @param {String} nameTree
 * @param {Object} query(!)
 * @return {Array}
 */
export function findKeywords(tree, nameTree, query) {
  const items = [];
  const loop = function (list = []) {
    list.forEach((n) => {
      Object.keys(query).every((key) => n[key] === query[key]) && items.push(n);
      n.nodes && loop(n.nodes);
    });
  };
  if (nameTree) {
    loop([tree[nameTree]]);
  } else {
    Object.keys(tree).forEach((nameTree) => {
      loop([tree[nameTree]]);
    });
  }
  return items;
}

function findAll(id, items) {
  let i = 0; let found; let
    result = [];

  for (; i < items.length; i++) {
    if (!items[i].nodes) {
      result.push(items[i]._id);
    } else if (_.isArray(items[i].nodes)) {
      result.push(items[i]._id);
      found = findAll(id, items[i].nodes);
      if (found.length) {
        result = result.concat(found);
      }
    }
  }

  return result;
}

export function findIds(nodes, parentNodeId) {
  const [parentNode] = findKeywords(nodes, null, { _id: parentNodeId });
  if (parentNode) {
    let childrenIds = [];
    if (parentNode.nodes?.length) {
      childrenIds = findAll(parentNodeId, parentNode.nodes);
    }
    return [parentNode._id, ...childrenIds];
  }
  return [];
}

export function updateKeywords(keywords, ids, values) {
  const handleKeyword = (keyword) => {
    if (keyword.nodes && keyword.nodes.length > 0) {
      keyword.nodes = keyword.nodes.map(handleKeyword);
    }
    if (ids.includes(keyword._id)) {
      const newKeyword = { ...keyword, ...values };
      return newKeyword;
    }
    return keyword;
  };

  return {
    favorites: handleKeyword(keywords.favorites),
    keywords: handleKeyword(keywords.keywords),
    // all: handleKeyword(keywords.all),
  };
}

/**
 * Add keywords to selection
 * @param {*[]} all
 * @param {string[]} _ids
 * @returns {string[]}
 */
export function addManyToSelection(all, _ids) {
  const keywords = all.filter((kw) => _ids.includes(kw._id));
  if (!keywords.length) return [];
  const childBranch = all.filter(
    ({ path }) => {
      const keyword = keywords.find(
        (kw) => kw.path === path || path.startsWith(`${kw.path}${NEW_PATH_DELIMITER}`),
      );
      return !!keyword;
    },
  );
  return _.uniq([...childBranch.map((kw) => kw._id)]);
}

/**
 * Add keyword to selection
 * @param {*[]} all
 * @param {string[]} selected
 * @param {string} _id
 * @returns {string[]}
 */
export function addToSelection(all, selected, _id) {
  const keyword = all.find((kw) => kw._id === _id);
  if (!keyword) return selected;
  const childBranch = all.filter(
    ({ path }) => path === keyword.path || path.startsWith(`${keyword.path}${NEW_PATH_DELIMITER}`),
  );
  return _.uniq([...selected, ...childBranch.map((kw) => kw._id)]);
}

/**
 * Remove keyword from selection
 * @param {*[]} all
 * @param {string[]} selected
 * @param {string} _id
 * @returns {string[]}
 */
export function removeFromSelection(all, selected, _id) {
  const keyword = all.find((kw) => kw._id === _id);
  if (!keyword) return selected;

  const pathArray = keyword.path.split(NEW_PATH_DELIMITER).filter(Boolean);
  /** When deselect keyword -> need to deselect his parents
   * make an array of parent keywords paths + deselected keyword path */
  const pathsToRemove = pathArray.map(
    (_, i) => NEW_PATH_DELIMITER + pathArray.slice(0, i + 1).join(NEW_PATH_DELIMITER),
  );
  const idsToRemove = all.filter(({ path }) => pathsToRemove.includes(path)).map((kw) => kw._id);

  return selected.filter((id) => idsToRemove.indexOf(id) === -1);
}
