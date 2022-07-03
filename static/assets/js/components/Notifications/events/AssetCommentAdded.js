import React from 'react'; // eslint-disable-line
import * as utils from '../../../shared/utils';
import eventsFormater from '../../../shared/eventsFormater';
import { useSelector } from 'react-redux';
import Item from '../Item';

/**
 * Event component
 * @param {Object} props
 * @param {Object} props.event
 * @param {boolean} props.isRenderDate
 * @param {Function} props.goToUrl
 * @returns {JSX}
 */
export default function ({ event, isRenderDate, goToUrl }) {
  const { _id: currentUserId } = useSelector((state) => state.user);
  const { mentions = [] } = event.data?.comment || {};
  const isCurrentUserMentioned = mentions.some((item) => item._id === currentUserId);

  const asset = (
    <span
      className="picsioLink"
      onClick={() => goToUrl(`preview/${event.data.asset._id}#${event.data.comment._id}`)}
    >
      {utils.decodeSlash(event.data.asset.name)}
    </span>
  );

  const text = isCurrentUserMentioned
    ? eventsFormater.AssetCommentAddedWithMention(asset)
    : eventsFormater.AssetCommentAdded(asset);

  const avatar = event.initiator && event.initiator.avatar;
  const time = event.timestamp;

  return (
    <Item
      timestamp={isRenderDate ? event.timestamp : undefined}
      time={time}
      avatar={avatar}
      name={event.initiator ? event.initiator.displayName : 'Web user'}
      thumbnail={event.thumbnail}
      goToUrl={goToUrl}
      assetID={event.data.asset._id}
    >
      {text}
    </Item>
  );
}
