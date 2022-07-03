import React from 'react'; // eslint-disable-line
import eventsFormater from '../../../../shared/eventsFormater';
import localization from '../../../../shared/strings';
import Tag from '../../../Tag';
import Item from '../Item';

/**
 * Event component
 * @param {Object} props
 * @param {Object} props.event
 * @param {boolean} props.isRenderDate
 * @param {Function} props.goToUrl
 * @param {boolean} props.isLastDayEvent
 * @returns {JSX}
 */
export default function ({ event, isRenderDate, goToUrl, isLastDayEvent }) {
  const initiatorName = event.initiator.email;
  const avatar = (event.initiator && event.initiator.avatar) || null;
  const icon = 'avatar';
  const time = event.timestamp;
  const teamLink = (
    <span className="picsioLink" onClick={() => goToUrl('teammates?tab=teammates')}>
      {localization.AUDIT.linkTeam}
    </span>
  );
  const initiator = <Tag type="user" avatar={avatar} text={initiatorName} />;
  const text = eventsFormater.InvitationAccepted(teamLink, initiator);

  return (
    <Item
      timestamp={isRenderDate ? event.timestamp : undefined}
      icon={icon}
      time={time}
      isLastDayEvent={isLastDayEvent}
    >
      {text}
    </Item>
  );
}
