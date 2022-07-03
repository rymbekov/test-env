import React from 'react'; // eslint-disable-line
import { Folder } from '@picsio/ui/dist/icons';
import Item from '../Item';
import * as utils from '../../../shared/utils';
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
  let collectionName = event.data.collection.name;
  if (!collectionName) {
    const pathArr = (event.data.collection.path || '').split('/');
    collectionName = pathArr.pop() || 'unknown';
  }
  const collection = (
    <span className="picsioLink" onClick={() => goToUrl(`search?tagId=${event.data.collection._id}`)}>
      {utils.decodeSlash(collectionName)}
    </span>
  );
  const text = eventsFormater.CollectionCreated(collection);

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
