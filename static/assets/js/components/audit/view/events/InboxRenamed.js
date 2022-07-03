import React from 'react'; // eslint-disable-line
import Item from '../Item';
import eventsFormater from '../../../../shared/eventsFormater';
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
	const initiatorName = event.initiator.displayName;
	const avatar = event.initiator && event.initiator.avatar;
	const icon = 'inbox';
	const time = event.timestamp;
	const inbox = (
		<Tag
			type="inbox"
			text={event.data.inbox.oldName}
			onClick={() => goToUrl('search?inboxId=' + event.data.inbox._id)}
		/>
	);
	const newInbox = (
		<Tag type="inbox" text={event.data.inbox.name} onClick={() => goToUrl('search?inboxId=' + event.data.inbox._id)} />
	);
	const initiator = <Tag type="user" avatar={avatar} text={initiatorName} />;
	const text = eventsFormater.InboxRenamed(inbox, newInbox, initiator);

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
