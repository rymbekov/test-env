import React from 'react';
import Button from './Button';

/**
 * Logo
 * @param {Object} props
 * @param {string} props.src
 * @param {string} props.username
 * @param {number} props.size
 * @param {boolean} props.avatarPicsio
 * @param {string} props.className
 * @returns {JSX}
 */
export default function Logo({ handleLogoClick, additionalClass }) {
	return <Button id="button-logo" icon="logoPicsio" additionalClass={additionalClass} onClick={handleLogoClick} />;
}
