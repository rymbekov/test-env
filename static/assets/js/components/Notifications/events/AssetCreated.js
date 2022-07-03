import React from 'react'; // eslint-disable-line
import Item from '../Item';
import * as utils from '../../../shared/utils';
import eventsFormater from '../../../shared/eventsFormater';
import formatAssets from './../helpers/formatAssets';
import * as UtilsCollections from '../../../store/utils/collections';
import Store from '../../../store';

/**
 * Event component
 * @param {Object} props
 * @param {Object} props.event
 * @param {boolean} props.isRenderDate
 * @param {Function} props.goToUrl
 * @returns {JSX}
 */
export default function({ event, isRenderDate, goToUrl }) {
	let collectionName;
	if (event.data.asset && event.data.asset.tags && event.data.asset.tags.length) {
		collectionName = event.data.asset.tags[0].path.split('/').pop();
	} else if (
		event.data.assets &&
		event.data.assets.length &&
		event.data.assets[0] &&
		event.data.assets[0].tags.length
	) {
		collectionName = event.data.assets[0].tags[0].path.split('/').pop();
	} else {
		collectionName = Store.getState().collections.collections.my.name;
	}

	let collectionId;
	if (event.data.asset && event.data.asset.tags && event.data.asset.tags.length) {
		collectionId = event.data.asset.tags[0]._id;
	} else if (
		event.data.assets &&
		event.data.assets.length &&
		event.data.assets[0] &&
		event.data.assets[0].tags.length
	) {
		collectionId = event.data.assets[0].tags[0]._id;
	} else {
		collectionId = UtilsCollections.getRootId();
	}

	const assets = formatAssets(event.data.assets || [event.data.asset], { goToUrl });
	const assetId = event.data.asset ? event.data.asset._id : event.data.assets[0]._id;
	const collection = (
		<span className="picsioLink" onClick={() => goToUrl('search?tagId=' + collectionId)}>
			{utils.decodeSlash(collectionName)}
		</span>
	);

	const text = eventsFormater.AssetCreated(assets, collection);

	const avatar = event.initiator && event.initiator.avatar;
	const time = event.timestamp;

	return (
		<Item
			timestamp={isRenderDate ? event.timestamp : undefined}
			time={time}
			avatar={avatar}
			name={event.initiator.displayName}
			thumbnail={event.thumbnail}
			assetID={assetId}
			goToUrl={goToUrl}
		>
			{text}
		</Item>
	);
}
