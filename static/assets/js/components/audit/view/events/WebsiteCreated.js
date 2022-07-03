import React from 'react'; // eslint-disable-line
import Item from '../Item';
import * as utils from '../../../../shared/utils';
import localization from '../../../../shared/strings';
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
	const icon = 'folderFull';
	const time = event.timestamp;
	const websiteLink = (
		<span className="picsioLink" onClick={() => goToUrl(`websites/${event.data.collection._id}?tab=main`)}>
			{localization.AUDIT.linkWebsite}
		</span>
	);
	const collection = (
		<Tag
			type="collection"
			text={utils.decodeSlash(event.data.collection.name)}
			onClick={() => goToUrl('search?tagId=' + event.data.collection._id)}
		/>
	);
	const initiator = <Tag type="user" avatar={avatar} text={initiatorName} />;
	const text = eventsFormater.WebsiteCreated(websiteLink, collection, initiator);

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
