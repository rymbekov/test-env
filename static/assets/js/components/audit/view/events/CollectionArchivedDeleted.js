import React from 'react';
// import PropTypes from 'prop-types';

import eventsFormater from '../../../../shared/eventsFormater';
import * as pathHelper from '../../../../helpers/paths';

import Tag from '../../../Tag';
import Item from '../Item';

const CollectionArchivedDeleted = ({ event, isRenderDate }) => {
	const { data: { collection }, initiator, timestamp } = event;
	const { avatar, displayName } = initiator;
	const { _id, path } = collection;
	const name = pathHelper.getCollectionName(path);
	const collectionNode = (<Tag type="archive" text={name} />);
	const initiatorNode = (<Tag type="user" avatar={avatar} text={displayName} />);
	const text = eventsFormater.CollectionArchivedDeleted(collectionNode, initiatorNode);
	const icon = 'archive';

	return (
		<Item
			timestamp={isRenderDate ? timestamp : undefined}
			icon={icon}
			time={timestamp}
		>
			{text}
		</Item>
	);
}

export default CollectionArchivedDeleted;
