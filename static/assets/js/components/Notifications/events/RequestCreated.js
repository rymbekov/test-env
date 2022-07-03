import React from 'react'; // eslint-disable-line
import { MyTeam } from '@picsio/ui/dist/icons';
import Item from '../Item';
import eventsFormater from '../../../shared/eventsFormater';

/**
 * Event component
 * @param {Object} props
 * @param {Object} props.event
 * @param {boolean} props.isRenderDate
 * @param {Function} props.goToUrl
 * @returns {JSX}
 */
export default function ({ event, isRenderDate, goToUrl }) {
  const initiator = event.initiator.email;
  const teamLink = (
    <span className="picsioLink" onClick={() => goToUrl('teammates?tab=teammates')}>
      team settings
    </span>
  );
  const text = eventsFormater.RequestCreated(teamLink, initiator);

  const avatar = event.initiator && event.initiator.avatar;
  const icon = () => <MyTeam />;
  const time = event.timestamp;

  return (
    <Item
      timestamp={isRenderDate ? event.timestamp : undefined}
      icon={icon}
      time={time}
      avatar={avatar}
      name={event.initiator.displayName}
    >
      {text}
    </Item>
  );
}
