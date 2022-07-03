import React from 'react';
import { Archive } from '@picsio/ui/dist/icons';

import eventsFormater from '../../../shared/eventsFormater';
import * as pathHelper from '../../../helpers/paths';

import Item from '../Item';

const CollectionArchivedDeleted = ({ event, isRenderDate }) => {
  const { data: { collection }, initiator, timestamp } = event;
  const { avatar, displayName } = initiator;
  const { _id, path } = collection;
  const name = pathHelper.getCollectionName(path);
  const text = eventsFormater.CollectionArchivedDeleted(name);
  const icon = () => <Archive />;

  return (
    <Item
      timestamp={isRenderDate ? timestamp : null}
      icon={icon}
      time={timestamp}
      avatar={avatar}
      name={displayName}
    >
      {text}
    </Item>
  );
};

export default CollectionArchivedDeleted;
