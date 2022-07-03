import React from 'react'; // eslint-disable-line
import eventsFormater from '../../../shared/eventsFormater';
import Logger from '../../../services/Logger';
import Item from '../Item';

/**
 * Event component
 * @param {Object} props
 * @param {Object} props.event
 * @param {boolean} props.isRenderDate
 * @returns {JSX}
 */
export default function ({ event, isRenderDate }) {
  const url = 'https://exchange.adobe.com/creativecloud.details.101726.picsio-digital-asset-management.html';
  const handleClick = () => {
    Logger.log('User', 'NotificationsGoToAddons');
  };
  const text = eventsFormater.AdobeExtenstion(url, handleClick);
  const time = event.timestamp;
  const initiator = 'Pics.io';

  return (
    <Item
      timestamp={isRenderDate ? event.timestamp : undefined}
      time={time}
      thumbnail={{ url: 'https://assets.pics.io/img/psd-file.svg' }}
      avatarPicsio
      name={initiator}
    >
      {text}
    </Item>
  );
}
