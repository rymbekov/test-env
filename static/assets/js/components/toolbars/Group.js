import React from 'react'; // eslint-disable-line

/**
 * Toolbar group component
 * @param {string} additionalClass
 * @returns {JSX}
 */
export default function({ additionalClass, children }) {
	let className = 'toolbarGroup';
	if (additionalClass) className += ` ${additionalClass}`;

	return <div className={className}>{children}</div>;
}
