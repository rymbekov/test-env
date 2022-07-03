import React from 'react'; // eslint-disable-line
import Item from '../Item';
import eventsFormater from '../../../../shared/eventsFormater';
import CONSTANTS from '@picsio/db/src/constants';
import Tag from '../../../Tag';
import Store from '../../../../store';

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
	const collectionName = event.data.collection.name;
	const collectionNameLength = collectionName ? collectionName.length + 1 : 0;
	const collectionTeamName = Store.getState().collections.collections.my.name + '/';
	const regexp = new RegExp(CONSTANTS.ROOT_COLLECTION_PATH + '/', 'g');
	let newPath = event.data.collection.newPath.replace(regexp, collectionTeamName).slice(0, -collectionNameLength);
	let oldPath = event.data.collection.oldPath.replace(regexp, collectionTeamName).slice(0, -collectionNameLength);
	newPath = (
		<Tag
			type="collection"
			text={newPath}
			onClick={() => goToUrl('search?tagId=' + event.data.collection.targetCollectionId)}
		/>
	);
	oldPath = (
		<Tag
			type="collection"
			text={oldPath}
			onClick={() => goToUrl('search?tagId=' + event.data.collection.parentCollectionId)}
		/>
	);
	const collection = (
		<Tag type="collection" text={collectionName} onClick={() => goToUrl('search?tagId=' + event.data.collection._id)} />
	);
	const initiator = <Tag type="user" avatar={avatar} text={initiatorName} />;
	const text = eventsFormater.CollectionMoved(collection, newPath, oldPath, initiator);

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
