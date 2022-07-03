import React from 'react';

import eventsFormater from '../../../../shared/eventsFormater';

import Tag from '../../../Tag';
import Item from '../Item';

const CollectionUnarchived = ({ event, isRenderDate, goToUrl, isLastDayEvent }) => {
	const { initiator, data: { collection }, timestamp } = event;
	const { displayName, avatar } = initiator;
	const { _id, name } = collection;
	const icon = 'folderFull';

	const collectionNode = (
		<Tag
			type="collection"
			text={name}
			onClick={() => goToUrl(`search?tagId=${_id}`)}
		/>
	);
	const initiatorNode = <Tag type="user" avatar={avatar} text={displayName} />;
	const text = eventsFormater.CollectionUnarchived(collectionNode, initiatorNode);

	return (
		<Item
			timestamp={isRenderDate ? timestamp : undefined}
			icon={icon}
			time={timestamp}
			isLastDayEvent={isLastDayEvent}
		>
			{text}
		</Item>
	);
}

export default CollectionUnarchived;
