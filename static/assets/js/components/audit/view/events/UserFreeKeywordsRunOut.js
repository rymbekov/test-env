import React from 'react'; // eslint-disable-line
import Item from '../Item';
import eventsFormater from '../../../../shared/eventsFormater';

/**
 * Event component
 * @param {Object} props
 * @param {Object} props.event
 * @param {boolean} props.isRenderDate
 * @param {Function} props.goToUrl
 * @param {boolean} props.isLastDayEvent
 * @returns {JSX}
 */
export default function({ event, isRenderDate, isLastDayEvent }) {
	const text = eventsFormater.UserFreeKeywordsRunOut();
	const time = event.timestamp;

	return (
		<Item timestamp={isRenderDate ? event.timestamp : undefined} time={time} isLastDayEvent={isLastDayEvent}>
			{text}
		</Item>
	);
}
