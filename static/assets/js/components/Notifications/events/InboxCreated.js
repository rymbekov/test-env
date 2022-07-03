import React from 'react'; // eslint-disable-line
import { Inbox } from '@picsio/ui/dist/icons';
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
  const inbox = (
    <span className="picsioLink" onClick={() => goToUrl(`search?inboxId=${event.data.inbox._id}`)}>
      {utils.decodeSlash(event.data.inbox.name)}
    </span>
  );
  const text = eventsFormater.InboxCreated(inbox);

  const avatar = event.initiator && event.initiator.avatar;
  const icon = () => <Inbox />;
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
