import React from 'react'; // eslint-disable-line
import Item from '../Item';
import * as utils from '../../../../shared/utils';
import eventsFormater from '../../../../shared/eventsFormater';
import Tag from '../../../Tag';
import dayjs from 'dayjs';

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
			text={utils.decodeSlash(event.data.inbox.name)}
			onClick={() => goToUrl('search?inboxId=' + event.data.inbox._id)}
		/>
	);
	let changedParam = event.data.changedParam;
	let changedParamValue = event.data.inbox[changedParam];
	if (changedParam === 'startAt' || changedParam === 'expiresAt') {
		if (dayjs(changedParamValue).isValid()) {
			changedParamValue = dayjs(changedParamValue).format('lll');
		} else {
			changedParamValue = 'none';
		}
	}
	if (changedParam === 'isShared') {
		if (changedParamValue === false) {
			changedParamValue = 'off';
		} else {
			changedParamValue = 'on';
		}

		changedParam = 'shared status';
	}

	const initiator = <Tag type="user" avatar={avatar} text={initiatorName} />;
	const text = eventsFormater.InboxChanged(inbox, changedParam, changedParamValue, initiator);

	if (changedParam === 'password') return null;

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
