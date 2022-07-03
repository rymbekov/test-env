import React from 'react'; // eslint-disable-line

import Tag from '../../../Tag';
import eventsFormater from '../../../../shared/eventsFormater';
import * as pathHelper from '../../../../helpers/paths';

import Item from '../Item';
import formatAssets from '../../helpers/formatAssets';

const AssetsUnarchived = ({ event, goToUrl, isRenderDate, isLastDayEvent }) => {
	const { initiator, data, timestamp } = event;
	const { displayName, avatar } = initiator;
	const { assets, unarchivedTo } = data;
	const formattedAssets = formatAssets(assets, { goToUrl });
	const collectionName = pathHelper.getCollectionName(unarchivedTo.path);
	const collectionNode = (
		<Tag
			type="collection"
			text={collectionName}
			onClick={() => goToUrl(`search?tagId=${unarchivedTo._id}`)}
		/>
	);
	const initiatorNode = <Tag type="user" avatar={avatar} text={displayName} />;
	const text = eventsFormater.AssetsUnarchived(formattedAssets, collectionNode, initiatorNode);

	return (
		<Item
			timestamp={isRenderDate && timestamp}
			time={timestamp}
			isLastDayEvent={isLastDayEvent}
		>
			{text}
		</Item>
	);
}

export default AssetsUnarchived;
