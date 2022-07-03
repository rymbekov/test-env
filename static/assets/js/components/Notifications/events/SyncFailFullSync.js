import React from 'react'; // eslint-disable-line
import { Sync } from '@picsio/ui/dist/icons';
import PropTypes from 'prop-types';
import eventsFormater from '../../../shared/eventsFormater';
import Item from '../Item';

function SyncFailFullSync({ event, isRenderDate }) {
  const text = eventsFormater.SyncFailFullSync();

  const avatar = event.initiator && event.initiator.avatar;
  const icon = () => <Sync />;
  const time = event.timestamp;

  return (
    <Item
      timestamp={isRenderDate ? event.timestamp : undefined}
      icon={icon}
      time={time}
      avatar={avatar}
      name={event.initiator.displayName || 'Google Drive'}
    >
      {text}
    </Item>
  );
}

SyncFailFullSync.defaultProps = {
  isRenderDate: false,
};

SyncFailFullSync.propTypes = {
  event: PropTypes.object.isRequired,
  isRenderDate: PropTypes.bool,
};

export default SyncFailFullSync;
