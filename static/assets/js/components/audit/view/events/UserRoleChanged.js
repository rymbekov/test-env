import React from 'react'; // eslint-disable-line
import Item from '../Item';
import eventsFormater from '../../../../shared/eventsFormater';
import Tag from '../../../Tag';

/**
 * Event component
 * @param {Object} props
 * @param {Object} props.event
 * @param {boolean} props.isRenderDate
 * @param {boolean} props.isLastDayEvent
 * @returns {JSX}
 */
export default function({ event, isRenderDate, isLastDayEvent }) {
	const initiatorName = event.initiator.displayName;
	const avatar = event.initiator && event.initiator.avatar;
	const icon = 'avatar';
	const time = event.timestamp;
	const teammate = event.data.teammate.displayName;
	const oldRole = event.data.oldRole.name;
	const newRole = event.data.newRole.name;
	const initiator = <Tag type="user" avatar={avatar} text={initiatorName} />;
	const text = eventsFormater.UserRoleChanged(oldRole, newRole, initiator, teammate);

	return (
		<Item
			timestamp={isRenderDate ? event.timestamp : undefined}
			icon={icon}
			time={time}
			isLastDayEvent={isLastDayEvent}
		>
			{text}
		</Item>
	);
}
