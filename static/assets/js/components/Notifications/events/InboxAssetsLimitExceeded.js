import React from 'react'; // eslint-disable-line
import { Inbox } from '@picsio/ui/dist/icons';
import * as utils from '../../../shared/utils';
import eventsFormater from '../../../shared/eventsFormater';
import Store from '../../../store';
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
  const eventInbox = event.data.inbox;
  const { user } = store.getState();
  const { subscriptionFeatures = {}, team = {} } = user;
  const { planName } = subscriptionFeatures;
  const { trialEnds } = team;
  const isTrialUser = !(new Date() > new Date(trialEnds)) && !planName;

  const inbox = (
    <span className="picsioLink" onClick={() => goToUrl(`search?inboxId=${eventInbox._id}`)}>
      {utils.decodeSlash(eventInbox.name)}
    </span>
  );

  const initiatorName = event.initiator.displayName || null;
  const avatar = (event.initiator && event.initiator.avatar) || null;
  const text = eventsFormater.InboxAssetsLimitExceeded(inbox, isTrialUser);
  const icon = () => <Inbox />;
  const time = event.timestamp;

  return (
    <Item
      timestamp={isRenderDate ? event.timestamp : undefined}
      icon={icon}
      time={time}
      avatar={avatar}
      name={initiatorName}
      thumbnail={event.thumbnail}
      goToUrl={goToUrl}
    >
      {text}
    </Item>
  );
}
