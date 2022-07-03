import React from 'react';

import Tag from '../../../Tag';
import eventsFormater from '../../../../shared/eventsFormater';
import { checkUserAccess } from '../../../../store/helpers/user';

import Item from '../Item';
import formatAssets from '../../helpers/formatAssets';

const AssetsArchived = ({ event, goToUrl, isRenderDate, isLastDayEvent }) => {
	const { initiator, data, timestamp } = event;
	const { displayName, avatar } = initiator;
	const { assets } = data;

	const isArchiveAllowed = checkUserAccess('subscriptions', 'archive') && checkUserAccess('permissions', 'viewArchive');
	const formatOptions = {};
	if (isArchiveAllowed) formatOptions.goToUrl = goToUrl;

	const formattedAssets = formatAssets(assets, formatOptions);
	const initiatorNode = (<Tag type="user" avatar={avatar} text={displayName} />);
	const text = eventsFormater.AssetsArchived(formattedAssets, initiatorNode);

	return (
		<Item
			time={timestamp}
			timestamp={isRenderDate && timestamp}
			isLastDayEvent={isLastDayEvent}
		>
			{text}
		</Item>
	);
}

export default AssetsArchived;
