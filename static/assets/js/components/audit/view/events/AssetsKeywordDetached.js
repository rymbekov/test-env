import React from 'react'; // eslint-disable-line
import Item from '../Item';
import eventsFormater from '../../../../shared/eventsFormater';
import formatAssets from '../../helpers/formatAssets';
import formatKeywords from './../../helpers/formatKeywords';
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
	const keywords = formatKeywords(event.data.keywords, { goToUrl, assetsTotalCount: event.data.keywordsTotalCount });
	const initiator = <Tag type="user" avatar={avatar} text={initiatorName} />;
	const text = eventsFormater.AssetsKeywordDetached(assets, keywords, initiator);

	return (
		<Item timestamp={isRenderDate ? event.timestamp : undefined} time={time} isLastDayEvent={isLastDayEvent}>
			{text}
		</Item>
	);
}
