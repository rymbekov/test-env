import React from 'react'; // eslint-disable-line
import Item from '../Item';
import * as utils from '../../../shared/utils';
import eventsFormater from '../../../shared/eventsFormater';

/**
 * Event component
 * @param {Object} props
 * @param {Object} props.event
 * @param {boolean} props.isRenderDate
 * @param {Function} props.goToUrl
 * @returns {JSX}
 */
export default function({ event, isRenderDate, goToUrl }) {
	const asset = (
		<span className="picsioLink" onClick={() => goToUrl('preview/' + event.data.asset._id)}>
			{utils.decodeSlash(event.data.asset.name)}
		</span>
	);
	const text = eventsFormater.AssetRevisionDisapproved(asset);

	const avatar = event.initiator && event.initiator.avatar;
	const time = event.timestamp;

	return (
		<Item
			timestamp={isRenderDate ? event.timestamp : undefined}
			time={time}
			avatar={avatar}
			name={event.initiator.displayName}
			thumbnail={event.thumbnail}
			goToUrl={goToUrl}
			assetID={event.data.asset._id}
		>
			{text}
		</Item>
	);
}
