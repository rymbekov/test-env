import sortBy from 'lodash.sortby';

/**
 * Create customFields groups
 * @param {Object} items,
 */
export function createGroups(items) {
	const newItems = items.map(item => ({ ...item }));
	const customFieldsMap = {};
	/** fill customFieldsMap */
	// newItems.forEach(customField => (customFieldsMap[customField.title] = Object.clone(customField, true)));
	newItems.forEach(customField => (customFieldsMap[customField.title] = { ...customField }));

	const customFields = sortBy(newItems, ['order']).map(customField => customFieldsMap[customField.title]);
	/** create groups */
	const groups = customFields.reduce((acc, value) => {
		if (value.type === 'separator') {
			acc.push([value]);
		} else {
			// if first customField is not of type 'separator' - we are creating fake group with title "Custom fields"
			if (!acc.length) {
				acc.push([{ type: 'separator', title: 'Custom fields', visibility: 'visible', notRemovable: true }]);
			}
			acc[acc.length - 1].push(value);
		}
		return acc;
	}, []);

	return groups;
}

/**
 * Make search items
 * @param {Object[]} all
 * @param {string} searchQuery
 * @returns {Object} search items
 */
export const makeSearchItems = (all, searchQuery) => {
	const items = all.filter(
		node => node.type === 'separator' || node.title.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return items;
};
