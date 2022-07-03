import React from 'react'; // eslint-disable-line
import { Folder } from '@picsio/ui/dist/icons';
import Item from '../Item';
import eventsFormater from '../../../shared/eventsFormater';

/**
 * Event component
 * @param {Object} props
 * @param {Object} props.event
 * @param {boolean} props.isRenderDate
 * @returns {JSX}
 */
export default function ({ event, isRenderDate }) {
  const text = eventsFormater.LowDiskSpace();
  const icon = () => <Folder />;
  const time = event.timestamp;

  return (
    <Item
      timestamp={isRenderDate ? event.timestamp : undefined}
      icon={icon}
      time={time}
      name={event.initiator.displayName}
    >
      {text}
    </Item>
  );
}
