import React from 'react'; // eslint-disable-line
import { Folder } from '@picsio/ui/dist/icons';
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
export default function ({ event, isRenderDate }) {
  const folder = event.data.workingFolder.name;
  const text = eventsFormater.UserWorkingFolderChanged(folder);
  const avatar = event.initiator && event.initiator.avatar;
  const icon = () => <Folder />;
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