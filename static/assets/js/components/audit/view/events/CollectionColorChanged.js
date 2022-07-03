import React from 'react'; // eslint-disable-line
import Item from '../Item';
import * as utils from '../../../../shared/utils';
import eventsFormater from '../../../../shared/eventsFormater';
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
export default function ({ event, isRenderDate, goToUrl, isLastDayEvent }) {
  const initiatorName = event.initiator ? event.initiator.displayName : 'Web user';
  const avatar = event.initiator && event.initiator.avatar;
  const time = event.timestamp;
  const icon = 'folderFull';
  let collectionName = event.data.collection.name;
  if (!collectionName) {
    const pathArr = (event.data.collection.path || '').split('/');
    collectionName = pathArr.pop() || 'unknown';
  }

  const collection = (
    <Tag
      type="collection"
      text={utils.decodeSlash(collectionName)}
      onClick={() => goToUrl('search?tagId=' + event.data.collection._id)}
    />
  );
  const collectionColor = (event.data.collection && event.data.collection.color) || '';
  const color = <span style={{ color: collectionColor }}>{collectionColor}</span>;
  const initiator = <Tag type="user" avatar={avatar} text={initiatorName} />;
  const text = eventsFormater.CollectionColorChanged(collection, color, initiator);

  return (
    <Item
      timestamp={isRenderDate ? event.timestamp : undefined}
      time={time}
      icon={icon}
      isLastDayEvent={isLastDayEvent}
    >
      {text}
    </Item>
  );
}
