import React from 'react'; // eslint-disable-line
import * as utils from '../../../shared/utils';
import eventsFormater from '../../../shared/eventsFormater';
import * as UtilsCollections from '../../../store/utils/collections';
import Store from '../../../store';
import formatAssets from '../helpers/formatAssets';
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
  let collectionName;
  let collectionId;
  const { asset, collection } = event.data;

  if (collection) {
    collectionName = collection.path.split('/').pop();
    collectionId = collection._id;
  } else {
    collectionName = Store.getState().collections.collections.my.name;
    collectionId = UtilsCollections.getRootId();
  }

  const formatedAsset = formatAssets([asset], { goToUrl });
  const assetId = asset._id;
  const formatedCollection = (
    <span className="picsioLink" onClick={() => goToUrl(`search?tagId=${collectionId}`)}>
      {utils.decodeSlash(collectionName)}
    </span>
  );

  const text = eventsFormater.AssetCopied(formatedAsset, formatedCollection);

  const avatar = event.initiator && event.initiator.avatar;
  const time = event.timestamp;

  return (
    <Item
      timestamp={isRenderDate ? event.timestamp : undefined}
      time={time}
      avatar={avatar}
      name={event.initiator.displayName}
      thumbnail={event.thumbnail}
      assetID={assetId}
      goToUrl={goToUrl}
    >
      {text}
    </Item>
  );
}
