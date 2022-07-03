import React from 'react'; // eslint-disable-line
import { Inbox } from '@picsio/ui/dist/icons';
import Item from '../Item';
import * as utils from '../../../shared/utils';
import eventsFormater from '../../../shared/eventsFormater';
import formatAssets from '../helpers/formatAssets';

/**
 * Event component
 * @param {Object} props
 * @param {Object} props.event
 * @param {boolean} props.isRenderDate
 * @param {Function} props.goToUrl
 * @returns {JSX}
 */
export default function ({ event, isRenderDate, goToUrl }) {
  const inboxAsset = (event.data.assets && event.data.assets[0]) || event.data.asset;
  const eventInbox = inboxAsset.inbox;

  const assets = formatAssets(event.data.assets || [event.data.asset], { goToUrl });
  const assetId = event.data.asset ? event.data.asset._id : event.data.assets[0]._id;
  const inbox = (
    <span className="picsioLink" onClick={() => goToUrl(`search?inboxId=${eventInbox._id}`)}>
      {utils.decodeSlash(eventInbox.name)}
    </span>
  );

  const initiatorName = event.initiator.displayName || null;
  const avatar = (event.initiator && event.initiator.avatar) || null;
  const text = eventsFormater.AssetCreated(assets, inbox);
  const time = event.timestamp;

  return (
    <Item
      timestamp={isRenderDate ? event.timestamp : undefined}
      time={time}
      avatar={avatar}
      name={initiatorName}
      thumbnail={event.thumbnail}
      assetID={assetId}
      goToUrl={goToUrl}
      icon={() => <Inbox />}
    >
      {text}
    </Item>
  );
}
