import React from 'react';
import { Archive } from '@picsio/ui/dist/icons';
import eventsFormater from '../../../shared/eventsFormater';
import { checkUserAccess } from '../../../store/helpers/user';

import Item from '../Item';
import EventLink from './EventLink';

const CollectionArchived = ({ event, isRenderDate, goToUrl }) => {
  const { data: { collection }, initiator, timestamp } = event;
  const { avatar, displayName } = initiator;
  const { _id, name } = collection;
  const isArchiveAllowed = checkUserAccess('subscriptions', 'archive') && checkUserAccess('permissions', 'viewArchive');
  const link = (
    <Choose>
      <When condition={isArchiveAllowed}>
        <EventLink goToUrl={goToUrl} url={`/search?tagId=${_id}&archived=true`}>{name}</EventLink>
      </When>
      <Otherwise>{name}</Otherwise>
    </Choose>
  );
  const text = eventsFormater.CollectionArchived(link);
  const icon = () => <Archive />;

  return (
    <Item
      timestamp={isRenderDate ? timestamp : undefined}
      icon={icon}
      time={timestamp}
      avatar={avatar}
      name={displayName}
    >
      {text}
    </Item>
  );
};

export default CollectionArchived;
