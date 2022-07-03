import React from 'react'; // eslint-disable-line
import { Web } from '@picsio/ui/dist/icons';
import Item from '../Item';
import * as utils from '../../../shared/utils';
import localization from '../../../shared/strings';
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
  const websiteLink = (
    <span className="picsioLink" onClick={() => goToUrl(`websites/${event.data.collection._id}?tab=main`)}>
      {localization.AUDIT.linkWebsite}
    </span>
  );
  const collection = (
    <span className="picsioLink" onClick={() => goToUrl(`search?tagId=${event.data.collection._id}`)}>
      {utils.decodeSlash(event.data.collection.name)}
    </span>
  );
  const text = eventsFormater.WebsiteCreated(websiteLink, collection);

  const avatar = event.initiator && event.initiator.avatar;
  const icon = () => <Web />;
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
