import React from 'react'; // eslint-disable-line
import Item from '../Item';
import eventsFormater from '../../../../shared/eventsFormater';
import formatAssets from '../../helpers/formatAssets';
import Tag from '../../../Tag';

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
	// to support events old format
	if (event.data.assignee) {
		event.data.assignees = [event.data.assignee];
	}
	const assets = formatAssets(event.data.assets, {
		goToUrl,
		assetsTotalCount: event.data.assetsTotalCount,
	});
	const initiatorName = event.initiator.displayName;
	const avatar = event.initiator && event.initiator.avatar;
	const time = event.timestamp;
	const names = event.data.assignees.map(user => user.displayName).join(', ');
	const initiator = <Tag type="user" avatar={avatar} text={initiatorName} />;
	const text = eventsFormater.AssetsAssigned(assets, names, initiator);

	return (
		<Item timestamp={isRenderDate ? event.timestamp : undefined} time={time} isLastDayEvent={isLastDayEvent}>
			{text}
		</Item>
	);
}
