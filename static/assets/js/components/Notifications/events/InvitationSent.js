import React from 'react'; // eslint-disable-line
import { MyTeam } from '@picsio/ui/dist/icons';
import Item from '../Item';
import eventsFormater from '../../../shared/eventsFormater';
import localization from '../../../shared/strings';

/**
 * Event component
 * @param {Object} props
 * @param {Object} props.event
 * @param {boolean} props.isRenderDate
 * @param {Function} props.goToUrl
 * @returns {JSX}
 */
export default function ({ event, isRenderDate, goToUrl }) {
  const teamLink = (
    <span className="picsioLink" onClick={() => goToUrl('teammates?tab=teammates')}>
      {localization.AUDIT.linkTeam}
    </span>
  );
  const text = eventsFormater.InvitationSentToMe(teamLink);

  const icon = () => <MyTeam />;
  const time = event.timestamp;

  return (
    <Item
      timestamp={isRenderDate ? event.timestamp : undefined}
      icon={icon}
      time={time}
      hiddenInitiator
    >
      {text}
    </Item>
  );
}
