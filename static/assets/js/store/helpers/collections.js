import _defaultsDeep from 'lodash.defaultsdeep';
import remove from 'lodash.remove';
import _map from 'lodash/map';
import Logger from '../../services/Logger';
import picsioConfig from '../../../../../config';
import * as collectionsApi from '../../api/collections';

/**
 * Set field to collection
 *
 * @param {Object} collections - collections object from store
 * @param {string} collectionID
 * @param {string} fieldName
 * @param {*} fieldValue
 * @returns {Object} new collections
 */
export function setField(collections, collectionID, fieldName, fieldValue) {
	const handleCollection = collection => {
		if (collection.nodes && collection.nodes.length > 0) {
			collection.nodes = collection.nodes.map(handleCollection);
		}
		return collection._id === collectionID ? { ...collection, [fieldName]: fieldValue } : collection;
	};

	return {
		favorites: handleCollection(collections.favorites),
		websites: handleCollection(collections.websites),
		my: handleCollection(collections.my),
	};
}

/**
 * Set fields to collection
 * @param {Object} collections - collections object from store
 * @param {string} collectionID
 * @param {string[]} keys
 * @param {*[]} values
 * @returns {Object} new collections
 */
export function setFields(collections, collectionID, keys, values) {
	const handleCollection = collection => {
		if (collection.nodes && collection.nodes.length > 0) {
			collection.nodes = collection.nodes.map(handleCollection);
		}
		if (collection._id === collectionID) {
			const newCollection = { ...collection };
			keys.forEach((key, index) => {
				newCollection[key] = values[index];
			});
			return newCollection;
		}
		return collection;
	};

	return {
		favorites: handleCollection(collections.favorites),
		websites: handleCollection(collections.websites),
		my: handleCollection(collections.my),
	};
}

export function updateCollections(collections, ids, values) {
	const handleCollection = collection => {
		if (collection.nodes && collection.nodes.length > 0) {
			collection.nodes = collection.nodes.map(handleCollection);
		}
		if (ids.includes(collection._id)) {
			const newCollection = { ...collection, ...values };
			return newCollection;
		}
		return collection;
	};

	return {
		favorites: handleCollection(collections.favorites),
		websites: handleCollection(collections.websites),
		my: handleCollection(collections.my),
	};
}

/**
 * Set child nodes to collection
 *
 * @param {Object} collections - collections object from store
 * @param {string} collectionID
 * @param {Array} nodes
 * @returns {Object} new collections
 */
export function setChildNodes(collections, collectionID, nodes) {
	const handleCollection = collection => {
		if (collection.nodes && collection.nodes.length > 0) {
			collection.nodes = collection.nodes.map(handleCollection);
		}
		if (collection._id === collectionID) {
			let clonedCollection = { ...collection, isFetching: false, nodes: [...(collection.nodes || [])] };
			_defaultsDeep(clonedCollection, { nodes });
			return clonedCollection;
		}
		return collection;
	};

	return {
		favorites: handleCollection(collections.favorites),
		websites: handleCollection(collections.websites),
		my: handleCollection(collections.my),
	};
}

/**
 * Add collection by parent id
 *
 * @param {Object} collections - collections object from store
 * @param {string} parentID
 * @param {Object} _node
 * @returns {Object} new collections
 */
export function addCollection(collections, parentID, _node) {
	const handleCollection = collection => {
		const node = { ..._node };

		if (collection.nodes && collection.nodes.length > 0) {
			collection.nodes = collection.nodes.map(handleCollection);
		}
		if (collection._id === parentID) {
			if (collection.nodes) {
				return { ...collection, nodes: [node, ...collection.nodes] };
			} else {
				return { ...collection, nodes: [node] };
			}
		} else {
			return collection;
		}
	};

	return {
		favorites: handleCollection(collections.favorites),
		websites: handleCollection(collections.websites),
		my: handleCollection(collections.my),
	};
}

/**
 * Push collections to tree
 * @param {Object} collections
 * @param {Object[]} collectionsToPush
 * @returns {Object} new collections
 */
export function pushCollections(collections, collectionsToPush, replace) {
	let tree = { ...collections };
	collectionsToPush.forEach(newCollection => {
		/** In new collection has name -> collections already in store */
		if (newCollection.name && !replace) return;

		const pathArr = newCollection.path.split('/');
		if (pathArr[1] === 'root') pathArr.splice(1, 1);
		const name = pathArr.pop();

		if (!replace) {
			newCollection.name = name;
			newCollection.path = pathArr.join('/') + '/';
			newCollection.hasChild = false;
		}

		const parentName = pathArr.pop();
		const parentPath = pathArr.join('/') + '/';

		let parentCollection = null;
		/** if parent is root collection */
		if (parentPath === '/' && !parentName) {
			parentCollection = collections.my;
		} else {
			/** @type {Object[]} */
			const parentLvl = findCollections(collections, null, { path: parentPath });
			if (parentLvl && parentLvl.length > 0) {
				parentCollection = parentLvl.find(collection => collection.name === parentName);
			}
		}
		if (parentCollection && parentCollection._id) {
			/** if collections not already added */
			if (
				!parentCollection.nodes ||
				(parentCollection.nodes && !parentCollection.nodes.some(node => node.name === newCollection.name))
			) {
				tree = addCollection(tree, parentCollection._id, newCollection);
			}
		} else {
			Logger.info('By some reason parent collection not found');
		}
	});
	return tree;
}

/**
 * Remove collection
 *
 * @param {Object} collections - collections object from store
 * @param {string} collectionID
 * @returns {Object} new collections
 */
export function removeCollection(collections, collectionID) {
	const _collection = findCollection(collections, null, { _id: collectionID });
	if (!_collection) return {};

	const handleCollection = collection => {
		if (collection.nodes && collection.nodes.length > 0) {
			const nodeForRemove = collection.nodes.find(
				node => node._id === collectionID || node.path.startsWith(_collection.path + _collection.name + '/')
			);
			if (nodeForRemove) {
				remove(collection.nodes, i => i === nodeForRemove);
				if (collection.nodes.length === 0) {
					collection.hasChild = false;
				}
			} else {
				collection.nodes = collection.nodes.map(handleCollection);
			}
		}
		return collection;
	};

	return {
		favorites: handleCollection(collections.favorites),
		websites: handleCollection(collections.websites),
		my: handleCollection(collections.my),
	};
}

export function removeCollections(collections, ids) {
	const handleCollection = collection => {
		if (collection.nodes && collection.nodes.length > 0) {
			const nodeForRemove = collection.nodes.find(node => ids.includes(node._id));
			if (nodeForRemove) {
				remove(collection.nodes, i => ids.includes(i._id));
				if (collection.nodes.length === 0) {
					collection.hasChild = false;
				}
			} else {
				collection.nodes = collection.nodes.map(handleCollection);
			}
		}
		return collection;
	};

	return {
		favorites: handleCollection(collections.favorites),
		websites: handleCollection(collections.websites),
		my: handleCollection(collections.my),
	};
}

/**
 * Rename collection
 *
 * @param {Object} collections
 * @param {string} collectionID
 * @param {string} newName
 * @returns {Object} new collections
 */
export function renameTag(collections, collectionID, newName, notify) {
	let renamedCollection = null;
	const repath = collection => {
		if (collection.nodes && collection.nodes.length > 0) {
			collection.nodes.forEach(node => {
				node.path = collection.path + collection.name + '/';
				node.nodes && node.nodes.length && repath(node);
			});
		}
	};
	const handleCollection = collection => {
		if (collection._id === collectionID) {
			renamedCollection = { ...collection, name: newName, isRenaming: false };
			repath(renamedCollection);
			if (notify) renamedCollection.highlight = true;
			return renamedCollection;
		} else {
			if (collection.nodes && collection.nodes.length > 0) {
				collection.nodes = collection.nodes.map(handleCollection);
			}

			return collection;
		}
	};

	const newCollections = {
		favorites: handleCollection(collections.favorites),
		websites: handleCollection(collections.websites),
		my: handleCollection(collections.my),
	};

	return newCollections;
}

/**
 * Move collection
 *
 * @param {Object} collections
 * @param {string} targetCollectionId
 * @param {Object} collectionToMove
 * @param {Object} collectionParent
 */
export function moveCollection(
	collections,
	targetCollectionId,
	collectionToMove,
	collectionParent,
	needsFetchChildren
) {
	let collectionTarget = findCollection(collections, 'my', { _id: targetCollectionId });
	collectionToMove.path = collectionTarget.path + collectionTarget.name + '/';

	const repath = collection => {
		if (collection.nodes && collection.nodes.length > 0) {
			collection.nodes.forEach(node => {
				node.path = collection.path + collection.name + '/';
				node.nodes && node.nodes.length && repath(node);
			});
		}
	};

	repath(collectionToMove);
	const handleCollection = collection => {
		if (collection.nodes && collection.nodes.length > 0) {
			collection.nodes = collection.nodes.map(handleCollection);
		}

		// add new collection
		if (collection._id === targetCollectionId) {
			let clonedCollection = { ...collection, isBusy: false };
			if (!needsFetchChildren) {
				if (clonedCollection.nodes) {
					clonedCollection.nodes.push(collectionToMove);
				} else {
					clonedCollection.nodes = [collectionToMove];
				}
			}
			return clonedCollection;
		}

		// remove moved collection from last parent
		if (collection._id === collectionParent._id) {
			let clonedCollection = { ...collection };
			clonedCollection.nodes = collectionParent.nodes.filter(collection => collection._id !== collectionToMove._id);
			if (clonedCollection.nodes.length === 0) {
				clonedCollection.hasChild = false;
			}
			return clonedCollection;
		}
		return collection;
	};

	const newCollections = {
		favorites: handleCollection(collections.favorites),
		websites: handleCollection(collections.websites),
		my: handleCollection(collections.my),
	};

	return newCollections;
}

/**
 * Set collection.favorites
 *
 * @param {Object} collections
 * @param {string} collectionID
 * @param {boolean} value - set TRUE or FALSE
 * @returns {Object} new collections
 */
export function changeFavorites(collections, collectionID, value) {
	const favorites = { ...collections.favorites };
	if (!value) favorites.nodes = favorites.nodes.filter((c) => c._id !== collectionID);

	let needToAddToFavorites = value;
	const updateCollection = (collection) => {
		if (collection._id === collectionID) {
			const updated = { ...collection, isBusy: false, favorites: value };
			if (needToAddToFavorites) {
				favorites.nodes.push({ ...updated });
				needToAddToFavorites = false; // to prevent double adding from 'websites' and 'my'
			}
			return updated;
		}
		if (collection.nodes) {
			return { ...collection, nodes: collection.nodes.map(updateCollection) };
		}
		return collection;
	};

	const websites = {
		...collections.websites,
		nodes: collections.websites.nodes.map(updateCollection),
	};

	const my = {
		...collections.my,
		nodes: collections.my.nodes.map(updateCollection),
	};

	return { favorites, websites, my };
}

/**
 * Set collection.website
 *
 * @param {Object} collections
 * @param {string} collectionID
 * @param {Object} value
 * @returns {Object} new collections
 */
export function changeWebsite(collections, collectionID, value, notify) {
	const websites = { ...collections.websites };
	if (!value) websites.nodes = websites.nodes.filter((c) => c._id !== collectionID);

	let needToAddToWebsites = !!value;
	const updateCollection = (collection) => {
		if (collection._id === collectionID) {
			const updated = { ...collection, website: value };
			if (notify) updated.websiteChangedByTeammate = true;
			if (!value) updated.websiteId = null;

			if (needToAddToWebsites) {
				websites.nodes = [...websites.nodes, { ...updated }];
				needToAddToWebsites = false; // to prevent double adding from 'favorites' and 'my'
			}
			return updated;
		}
		if (collection.nodes) {
			return { ...collection, nodes: collection.nodes.map(updateCollection) };
		}
		return collection;
	};

	return {
		websites,
		favorites: {
			...collections.favorites,
			nodes: collections.favorites.nodes.map(updateCollection),
		},
		my: { ...collections.my, nodes: collections.my.nodes.map(updateCollection) },
	};
}

/**
 * Find collection
 * based on the passed in "query". "nameTree" can be missed, in this case search will be done by whole tree
 *
 * @param {Object} _tree
 * @param {string} nameTree
 * @param {Object} query(!)
 * @return {Object||Undefined}
 */
export function findCollection(_tree, nameTree, query) {
	if (!_tree) return undefined;

	let item;
	let loop = function(list = []) {
		list.forEach(function(n) {
			Object.keys(query).every(key => n[key] === query[key]) && (item = n);
			n.nodes && loop(n.nodes);
		});
	};
	if (nameTree) {
		loop([_tree[nameTree]]);
	} else {
		Object.keys(_tree).forEach(function(nameTree) {
			loop([_tree[nameTree]]);
		});
	}
	return item;
}

/**
 * Get array of nodes
 * based on the passed in "query". "nameTree" can be missed, in this case search will be done by whole tree
 *
 * @param {Object} _tree
 * @param {String} nameTree
 * @param {Object} query(!)
 * @return {Array}
 */
export function findCollections(_tree, nameTree, query) {
	let items = [];
	let loop = function(list = []) {
		list.forEach(function(n) {
			Object.keys(query).every(key => n[key] === query[key]) && items.push(n);
			n.nodes && loop(n.nodes);
		});
	};
	if (nameTree) {
		loop([_tree[nameTree]]);
	} else {
		Object.keys(_tree).forEach(function(nameTree) {
			loop([_tree[nameTree]]);
		});
	}
	return items;
}

/**
 * Get parent node
 * based on the passed in "query" info about children.
 *
 * @param {Object} _tree
 * @param {String} nameTree
 * @param {Object} query(!)
 * @return {Object||Undefined} nest
 */
export function getParent(_tree, nameTree, query) {
	let parent;
	let check = function(item = {}) {
		if (!item.nodes || !item.nodes.length) return;

		item.nodes.forEach(function(n) {
			Object.keys(query).every(key => n[key] === query[key]) && (parent = item);
			n.nodes && check(n);
		});
	};
	if (nameTree) {
		check(_tree[nameTree]);
	} else {
		Object.keys(_tree).forEach(function(nameTree) {
			check(_tree[nameTree]);
		});
	}
	return parent;
}

/**
 * Get url for collections
 * based on the passed in "collection", if exists
 *
 * @param {String} collection
 * @return {String}
 */
export function getUrl(collection) {
	let url = '/tags';
	collection && (url += '/' + encodeURIComponent(collection.from(1)));
	return url;
}

/**
 * Handle search result
 * @param {} collections
 * @param {Array} collections
 * @returns {Object} search.collections
 */
export function handleSearchResult(collections, foundCollections) {
	const result = {
		favorites: { ...collections.favorites, nodes: [] },
		websites: { ...collections.websites, nodes: [] },
		my: { ...collections.my, nodes: [] },
	};

	foundCollections.forEach(collection => {
		if (collection.favorites) result.favorites.nodes.push(collection);
		if (collection.websiteId) result.websites.nodes.push(collection);
		result.my.nodes.push(collection);
	});

	return result;
}

/**
 * Get tag by id
 * @param {string} collectionID
 * @returns {Promise}
 */
export async function forceFindTagWithTagId(collections, search, collectionID) {
	const query = { _id: collectionID };
	const localCollection = findCollection(collections, null, query) || findCollection(search.collections, null, query);
	if (picsioConfig.isProofing()) return localCollection;
	if (!localCollection) {
		return await collectionsApi.getCollection(collectionID);
	} else if (!localCollection.storageId) {
		const tag = await collectionsApi.getCollection(collectionID);
		localCollection.storageId = tag.storageId;
	}
	return localCollection;
}

/**
 * Normalize collection
 * @param {Object} collection,
 */
export function normalizeCollection(collection) {
	const SLASH = '/';
	let path = collection.path;
	let arrPath = path.split(SLASH);

	arrPath.splice(-1, 1);
	arrPath = arrPath.join(SLASH);
	!arrPath ? (arrPath = SLASH) : (arrPath += '/');

	const trait = {
		fullPath: path,
		path: arrPath,
		/** old google collections has no storageId */
		storageId: collection.storageId || collection.googleId,
	};

	if (collection.children) {
		collection.nodes = collection.children.map(normalizeCollection);
	}

	// return Object.merge(collection, trait);
	return { ...collection, ...trait }
}

/**
 * Check is collection have children
 * @param {Object} tree,
 * @param {string} collectionID
 * @returns {boolean}
 */
export function hasCollectionChild(tree, collectionID) {
	const collection = findCollection(tree, 'my', { _id: collectionID });
	return !!collection && (collection.hasChild || collection.nodes);
}

/**
 * Check that the collection is nested
 * @param {string} pathParentCollection,
 * @param {string} pathChildCollection
 * @returns {boolean}
 */
export function isChild(pathParentCollection, pathChildCollection) {
	return pathChildCollection.startsWith(pathParentCollection);
}

/**
 * Generate Selected collections for Roles and Notifications
 * @param {Array} allCollections
 * @param {Array} selectedCollections
 * @returns {Array}
 */
export function prepareSelectedCollections(allCollections, selectedCollections) {
	const rootCollection = allCollections && allCollections[0];

	return selectedCollections.map(item => {
		const originalItem = findCollection(allCollections, null, {
			_id: item._id,
		});

		const name = originalItem ? originalItem.name : item.path.split('/').pop();
		let title;
		if (originalItem && (originalItem.path === 'root' || originalItem.path === '/root')) {
			title = originalItem.name;
		} else {
			title = originalItem
				? rootCollection.name + originalItem.path + originalItem.name
				: item.path.replace('/root', rootCollection.name);
		}
		return { _id: item._id, name, title };
	});
}

export const getCollectionPath = (collection) => {
	const rootRegexp = new RegExp('^/root/');
	const isNormalized = !collection.path.match(rootRegexp);
	const result = isNormalized ? `/root${collection.path}${collection.name}` : collection.path;

	return result;
};

export const checkCollectionAccess = (collection, user) => {
	const { allowedCollections } = user.role;

	if (allowedCollections.some(({ path }) => path === '/root')) {
		return true;
	}
	const collectionPath = getCollectionPath(collection);
	const isAllowed = allowedCollections.some(({ path }) => {
			const regexp = new RegExp(`^${path}/`);
			return collectionPath === path || collectionPath.match(regexp);
		});
	return isAllowed;
		}

export function getAllowedCollections(collections, user) {
	const result = collections.filter((c) => {
		const isAllowed = checkCollectionAccess(c, user);

		return isAllowed;
	});
	return result;
}

export async function getAllowedCollectionsWithPermissions(collections) {
	if (collections.length) {
		const ids = _map(collections, '_id');
		try {
			const allowedCollections = await collectionsApi.getCollections(ids);
			const collectionsWithPermissions = allowedCollections.map((c) => {
				const collection = collections.find(i => i._id === c._id);

				if (collection) {
					return { ...c, ...collection };
				}
				return collection;
			});
			return collectionsWithPermissions;
		} catch (e) {
			console.log(e);
			return [];
		}
	}
	return collections;
}

export const getCollectionName = ({ name, path }) => {
	if (!name) {
		const lastIndex = path.lastIndexOf('/');
		const pathName = path.slice(lastIndex + 1, path.length);
		return pathName;
	}
	return name;
}
