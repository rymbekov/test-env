import React from 'react'; // eslint-disable-line
import eventsFormater from '../../../../shared/eventsFormater';
import * as utils from '../../../../shared/utils';
import Tag from '../../../Tag';
import Item from '../Item';

/**
 * Event component
 * @param {Object} props
 * @param {Object} props.event
 * @param {boolean} props.isRenderDate
 * @param {Function} props.goToUrl
 * @param {boolean} props.isLastDayEvent
 * @returns {JSX}
 */
export default function({ event, isRenderDate, goToUrl, isLastDayEvent }) {
	const initiatorName = event.initiator ? event.initiator.displayName : 'Web user';
	const avatar = event.initiator && event.initiator.avatar;
	const time = event.timestamp;

	const asset = (
		<span className="picsioLink" onClick={() => goToUrl(`preview/${event.data.asset._id}#${event.data.comment._id}`)}>
			{utils.decodeSlash(event.data.asset.name)}
		</span>
	);
	const initiator = <Tag type="user" avatar={avatar} text={initiatorName} />;
	const text = eventsFormater.AssetCommentAdded(asset, initiator);

	return (
		<Item timestamp={isRenderDate ? event.timestamp : undefined} time={time} isLastDayEvent={isLastDayEvent}>
			{text}
		</Item>
	);
}
