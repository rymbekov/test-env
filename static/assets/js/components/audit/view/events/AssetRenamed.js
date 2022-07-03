import React from 'react'; // eslint-disable-line
import { object, bool, func } from 'prop-types';
import Item from '../Item';
import * as utils from '../../../../shared/utils';
import eventsFormater from '../../../../shared/eventsFormater';
import Tag from '../../../Tag';

function AssetRenamed({ event, isRenderDate, goToUrl, isLastDayEvent }) {
	const initiatorName = event.initiator.displayName;
	const avatar = event.initiator && event.initiator.avatar;
	const time = event.timestamp;
	const asset = (
		<span className="picsioLink" onClick={() => goToUrl('preview/' + event.data.asset._id)}>
			{utils.decodeSlash(event.data.asset.name)}
		</span>
	);
	const initiator = <Tag type="user" avatar={avatar} text={initiatorName} />;
	const text = eventsFormater.AssetRenamed(asset, initiator);

	return (
		<Item timestamp={isRenderDate ? event.timestamp : undefined} time={time} isLastDayEvent={isLastDayEvent}>
			{text}
		</Item>
	);
}

AssetRenamed.propTypes = {
	event: object,
	isRenderDate: bool,
	isLastDayEvent: bool,
	goToUrl: func,
};

export default AssetRenamed;
