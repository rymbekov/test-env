import React from 'react'; // eslint-disable-line
import { Folder } from '@picsio/ui/dist/icons';
import Item from '../Item';
import * as utils from '../../../shared/utils';
import eventsFormater from '../../../shared/eventsFormater';
import * as pathHelper from '../../../helpers/paths';

/**
 * Event component
 * @param {Object} props
 * @param {Object} props.event
 * @param {boolean} props.isRenderDate
 * @param {Function} props.goToUrl
 * @returns {JSX}
 */
export default function ({ event, isRenderDate }) {
  const name = pathHelper.getCollectionName(event.data.collection.path);
  const text = eventsFormater.CollectionDeleted(name);
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
