import React from 'react'; // eslint-disable-line
import Item from '../Item';
import * as utils from '../../../../shared/utils';
import eventsFormater from '../../../../shared/eventsFormater';
import formatAssets from '../../helpers/formatAssets';
import * as UtilsCollections from '../../../../store/utils/collections';
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
	const rootCollectionName = Store.getState().collections.collections.my.name;
	const collectionName =
		(event.data.assets[0].tags &&
			event.data.assets[0].tags.length &&
			event.data.assets[0].tags[0].path.split('/').pop()) ||
		rootCollectionName;
	const collectionId =
		(event.data.assets[0].tags && event.data.assets[0].tags.length && event.data.assets[0].tags[0]._id) ||
		UtilsCollections.getRootId();

	const assets = formatAssets(event.data.assets, { goToUrl });
	const collection = (
		<Tag
			type="collection"
			text={utils.decodeSlash(collectionName)}
			onClick={() => goToUrl('search?tagId=' + collectionId)}
		/>
	);
	const initiatorName = event.initiator.displayName;
	const avatar = event.initiator && event.initiator.avatar;
	const time = event.timestamp;
	const initiator = <Tag type="user" avatar={avatar} text={initiatorName} />;
	const text = eventsFormater.AssetCreated(assets, collection, initiator, avatar);

	return (
		<Item timestamp={isRenderDate ? event.timestamp : undefined} time={time} isLastDayEvent={isLastDayEvent}>
			{text}
		</Item>
	);
}
