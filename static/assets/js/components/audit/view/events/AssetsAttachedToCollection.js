import React from 'react'; // eslint-disable-line
import Item from '../Item';
import * as utils from '../../../../shared/utils';
import eventsFormater from '../../../../shared/eventsFormater';
import formatAssets from '../../helpers/formatAssets';
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
	const time = event.timestamp;
	const assets = formatAssets(event.data.assets, {
		goToUrl,
		assetsTotalCount: event.data.assetsTotalCount,
	});
	const collection = (
		<Tag
			type="collection"
			text={utils.decodeSlash(event.data.collection.name)}
			onClick={() => goToUrl('search?tagId=' + event.data.collection._id)}
		/>
	);
	const initiator = <Tag type="user" avatar={avatar} text={initiatorName} />;
	const text = eventsFormater.AssetsAttachedToCollection(assets, collection, initiator);

	return (
		<Item timestamp={isRenderDate ? event.timestamp : undefined} time={time} isLastDayEvent={isLastDayEvent}>
			{text}
		</Item>
	);
}
