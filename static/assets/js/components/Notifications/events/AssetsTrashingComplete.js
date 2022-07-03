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
export default function({ event, isRenderDate }) {
	const assets = formatAssets(event.data.assets);
	const text = eventsFormater.AssetsTrashingComplete(assets);

	const avatar = event.initiator && event.initiator.avatar;
	const time = event.timestamp;

	return (
		<Item
			timestamp={isRenderDate ? event.timestamp : undefined}
			time={time}
			avatar={avatar}
			thumbnail={event.thumbnail}
			name={event.initiator.displayName}
		>
			{text}
		</Item>
	);
}
