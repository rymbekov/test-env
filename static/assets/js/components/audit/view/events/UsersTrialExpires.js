import React from 'react'; // eslint-disable-line
import Item from '../Item';
import eventsFormater from '../../../../shared/eventsFormater';

/**
 * Event component
 * @param {Object} props
 * @param {Object} props.event
 * @param {boolean} props.isRenderDate
 * @param {boolean} props.isLastDayEvent
 * @returns {JSX}
 */
export default function({ event, isRenderDate, isLastDayEvent }) {
	const text = eventsFormater.UserTrialExpires();
	const avatar = event.initiator && event.initiator.avatar;
	const icon = 'avatar';
	const time = event.timestamp;

	return (
		<Item
			timestamp={isRenderDate ? event.timestamp : undefined}
			icon={icon}
			time={time}
			avatar={avatar}
			isLastDayEvent={isLastDayEvent}
		>
			{text}
		</Item>
	);
}
