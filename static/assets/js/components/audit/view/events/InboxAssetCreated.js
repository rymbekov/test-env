import React from 'react'; // eslint-disable-line
import Item from '../Item';
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
	const inboxAsset = (event.data.assets && event.data.assets[0]) || event.data.asset;
	const inboxName = inboxAsset.inbox && inboxAsset.inbox.name;
	const inboxId = inboxAsset.inbox && inboxAsset.inbox._id;

	const assets = formatAssets(event.data.assets || [event.data.asset], { goToUrl });
	const inbox = <Tag type="inbox" text={inboxName} onClick={() => goToUrl('search?inboxId=' + inboxId)} />;
	const initiatorName = event.initiator.displayName || null;
	const avatar = (event.initiator && event.initiator.avatar) || null;
	const time = event.timestamp;
	const initiator = <Tag type="user" avatar={avatar} text={initiatorName} />;
	const text = eventsFormater.AssetCreated(assets, inbox, initiator, avatar);

	return (
		<Item timestamp={isRenderDate ? event.timestamp : undefined} time={time} isLastDayEvent={isLastDayEvent}>
			{text}
		</Item>
	);
}
