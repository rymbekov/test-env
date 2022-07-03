import React from 'react'; // eslint-disable-line
import eventsFormater from '../../../../shared/eventsFormater';
import * as utils from '../../../../shared/utils';
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
      onClick={() => goToUrl(`search?tagId=${event.data.collection._id}`)}
    />
  );
  const value = (event.data.collection && event.data.collection.description) || '';
  const initiator = <Tag type="user" avatar={avatar} text={initiatorName} />;
  const text = eventsFormater.CollectionDescriptionChanged(collection, value, initiator);

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
