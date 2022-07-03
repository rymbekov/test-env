import React from 'react';
import _get from 'lodash/get';

// import Tag from '../../Tag';
import eventsFormater from '../../../shared/eventsFormater';
import * as pathHelper from '../../../helpers/paths';

import Item from '../Item';
import EventLink from './EventLink';
import formatAssets from '../helpers/formatAssets';

const AssetsUnarchived = ({ event, user, goToUrl, isRenderDate, isLastDayEvent }) => {
	const { initiator, data, timestamp } = event;
	const { displayName, avatar } = initiator;
	const { assets, unarchivedTo } = data;

	const formattedAssets = formatAssets(assets, { goToUrl });
	const collectionName = pathHelper.getCollectionName(unarchivedTo.path);
	const collectionNode = (<EventLink goToUrl={goToUrl} url={`/search?tagId=${unarchivedTo._id}`}>{collectionName}</EventLink>);
	const text = eventsFormater.AssetsUnarchived(formattedAssets, collectionNode);

	return (
		<Item
			avatar={avatar}
			name={displayName}
			timestamp={isRenderDate && timestamp}
			time={timestamp}
			isLastDayEvent={isLastDayEvent}
		>
			{text}
		</Item>
	);
};

export default AssetsUnarchived;
