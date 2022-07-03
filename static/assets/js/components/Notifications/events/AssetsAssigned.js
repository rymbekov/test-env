import React from 'react'; // eslint-disable-line
import Item from '../Item';
import eventsFormater from '../../../shared/eventsFormater';
import formatAssets from './../helpers/formatAssets';

/**
 * Event component
 * @param {Object} props
 * @param {Object} props.event
 * @param {boolean} props.isRenderDate
 * @param {Function} props.goToUrl
 * @returns {JSX}
 */
export default function({ event, isRenderDate, goToUrl }) {
	const assets = formatAssets(event.data.assets, { goToUrl });

	const text = eventsFormater.AssetsAssigned(assets, event.data.assignees[0].displayName);
	const assetId = event.data.asset ? event.data.asset._id : event.data.assets[0]._id;
	const avatar = event.initiator && event.initiator.avatar;
	const time = event.timestamp;

	return (
		<Item
			timestamp={isRenderDate ? event.timestamp : undefined}
			time={time}
			avatar={avatar}
			name={event.initiator.displayName}
			thumbnail={event.thumbnail}
			assetID={assetId}
			goToUrl={goToUrl}
		>
			{text}
		</Item>
	);
}
