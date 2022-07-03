import React from 'react';
import { Folder } from '@picsio/ui/dist/icons';
import eventsFormater from '../../../shared/eventsFormater';

import Item from '../Item';
import EventLink from './EventLink';

const CollectionUnarchived = ({ event, isRenderDate, goToUrl }) => {
  const { data: { collection }, initiator, timestamp } = event;
  const { _id, name } = collection;
  const link = (<EventLink goToUrl={goToUrl} url={`/search?tagId=${_id}`}>{name}</EventLink>);
  const text = eventsFormater.CollectionUnarchived(link);
  const avatar = initiator && initiator.avatar;
  const icon = () => <Folder />;

  return (
    <Item
      timestamp={isRenderDate ? timestamp : undefined}
      icon={icon}
      time={timestamp}
      avatar={avatar}
      name={initiator.displayName}
    >
      {text}
    </Item>
  );
};

export default CollectionUnarchived;
