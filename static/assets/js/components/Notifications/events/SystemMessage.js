import React from 'react'; // eslint-disable-line
import { Mail } from '@picsio/ui/dist/icons';
import Item from '../Item';
import * as utils from '../../../shared/utils';

/**
 * Event component
 * @param {Object} props
 * @param {Object} props.event
 * @param {boolean} props.isRenderDate
 * @param {Function} props.goToUrl
 * @returns {JSX}
 */
export default function ({ event, isRenderDate }) {
  const text = (
    <span
      dangerouslySetInnerHTML={{
        __html: utils.sanitizeXSS(event.data.text, {
          ALLOWED_TAGS: ['a', 'span', 'b', 'i', 'strong', 'em', 'p', 'br'],
          ALLOWED_ATTR: ['target', 'style', 'class', 'href'],
        }),
      }}
    />
  );

  const initiator = 'Pics.io';
  const icon = () => <Mail />;
  const time = event.timestamp;

  return (
    <Item
      timestamp={isRenderDate ? event.timestamp : undefined}
      icon={icon}
      time={time}
      avatarPicsio
      name={initiator}
    >
      {text}
    </Item>
  );
}
