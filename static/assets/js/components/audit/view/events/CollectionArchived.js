import React from 'react';

import eventsFormater from '../../../../shared/eventsFormater';
import { checkUserAccess } from '../../../../store/helpers/user';

import Tag from '../../../Tag';
import Item from '../Item';

const CollectionArchived = ({ event, isRenderDate, goToUrl, isLastDayEvent }) => {
	const { initiator, data: { collection }, timestamp }= event;
	const { displayName, avatar } = initiator;
	const { _id, name } = collection;
	const icon = 'archive';
	const isArchiveAllowed = checkUserAccess('subscriptions', 'archive') && checkUserAccess('permissions', 'viewArchive');

	const collectionNode = (
		<Choose>
			<When condition={isArchiveAllowed}>
				<Tag
					type="collection"
					text={name}
					onClick={() => goToUrl(`search?tagId=${_id}&archived=true`)}
				/>
			</When>
			<Otherwise>{name}</Otherwise>
		</Choose>
	);
	const initiatorNode = (<Tag type="user" avatar={avatar} text={displayName} />);
	const text = eventsFormater.CollectionArchived(collectionNode, initiatorNode);

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

export default CollectionArchived;
