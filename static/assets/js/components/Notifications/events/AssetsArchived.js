import React from 'react';

import eventsFormater from '../../../shared/eventsFormater';
import { checkUserAccess } from '../../../store/helpers/user';

import Item from '../Item';
import formatAssets from '../helpers/formatAssets';

const AssetsArchived = ({ event, user, goToUrl, isRenderDate, isLastDayEvent }) => {
	const { initiator, data, timestamp } = event;
	const { displayName, avatar } = initiator;
	const { assets } = data;

	const isArchiveAllowed = checkUserAccess('subscriptions', 'archive') && checkUserAccess('permissions', 'viewArchive');
	const formatOptions = {};
	if (isArchiveAllowed) formatOptions.goToUrl = goToUrl;

	const formattedAssets = formatAssets(assets, formatOptions);
	const text = eventsFormater.AssetsArchived(formattedAssets);

	return (
		<Item
			avatar={avatar}
			name={displayName}
			time={timestamp}
			timestamp={isRenderDate && timestamp}
			isLastDayEvent={isLastDayEvent}
		>
			{text}
		</Item>
	);
}

export default AssetsArchived;
