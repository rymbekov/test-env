import React from 'react'; // eslint-disable-line
import { object, bool, func } from 'prop-types';
import Item from '../Item';
import eventsFormater from '../../../../shared/eventsFormater';
import Tag from '../../../Tag';

function UserSupportConsentCreated({ event, isRenderDate, isLastDayEvent }) {
	const initiatorName = event.initiator.displayName;
	const avatar = event.initiator && event.initiator.avatar;
	const icon = 'avatar';
	const time = event.timestamp;
	const initiator = <Tag type="user" avatar={avatar} text={initiatorName} />;
	const text = eventsFormater.UserSupportConsentCreated(initiator);

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

UserSupportConsentCreated.propTypes = {
	event: object,
	isRenderDate: bool,
	isLastDayEvent: bool,
};

export default UserSupportConsentCreated;
