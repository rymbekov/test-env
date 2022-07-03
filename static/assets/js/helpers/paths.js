import * as utils from '../shared/utils';
/**
 * Remove "root" at begin of string
 * @param {string} path
 * @returns {string}
 */
export function removeRoot(path) {
	return path.replace(/\/root\//, '');
}

/**
 * @param {string} path
 * @returns {string}
 */
export function getCollectionName(path) {
	return utils.decodeSlash(path.split('/').pop());
}

/**
 * Get array from path
 * @param {string} path
 * @returns {string[]}
 */
export function getPathItems(path) {
	return path.split('/');
}
