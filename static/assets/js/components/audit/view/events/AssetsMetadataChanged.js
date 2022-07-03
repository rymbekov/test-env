import React from 'react'; // eslint-disable-line
import Item from '../Item';
import eventsFormater from '../../../../shared/eventsFormater';
import formatAssets from '../../helpers/formatAssets';
import formatMetadataFields from './../../helpers/formatMetadataFields';
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
	const fields = formatMetadataFields(event.data.fields, { fieldsTotalCount: event.data.fieldsTotalCount });
	const initiator = <Tag type="user" avatar={avatar} text={initiatorName} />;
	const text = eventsFormater.AssetsMetadataChanged(assets, fields, initiator);

	return (
		<Item timestamp={isRenderDate ? event.timestamp : undefined} time={time} isLastDayEvent={isLastDayEvent}>
			{text}
		</Item>
	);
}
