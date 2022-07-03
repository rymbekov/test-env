import React from 'react'; // eslint-disable-line
import Button from './Button';
import localization from '../../shared/strings';

/**
 * Mobile top right toolbar for Preview View
 * @param {Object} props
 * @param {Object} props.originalSizeImg
 * @param {Function} props.zoomIn
 * @param {Function} props.zoomOut
 * @returns {JSX}
 */
export default function(props) {
	return (
		<div className="toolbarPreviewRightMobile">
			{props.originalSizeImg && (
				<Button
					id="button-fitsize"
					icon={props.originalSizeImg.fit ? 'originalSizeImg' : 'fitSizeImg'}
					onClick={props.originalSizeImg.handler}
					tooltip={props.originalSizeImg.fit ? localization.TOOLBARS.titleZoom : localization.TOOLBARS.titleFit}
					additionalClass="transparentToolbarButton"
				/>
			)}
			{props.zoomIn && <div className="transparentToolbarButton zoomInButton" onClick={props.zoomIn} role="button" />}
			{props.zoomOut && (
				<div className="transparentToolbarButton zoomOutButton" onClick={props.zoomOut} role="button" />
			)}
		</div>
	);
}
