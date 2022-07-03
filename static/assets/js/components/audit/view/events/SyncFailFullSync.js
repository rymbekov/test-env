import React from 'react'; // eslint-disable-line
import eventsFormater from '../../../../shared/eventsFormater';
import PropTypes from 'prop-types';
import Tag from '../../../Tag';
import Item from '../Item';

function SyncFailFullSync({ event, isRenderDate, isLastDayEvent }) {
  const initiatorName = event.initiator.displayName;
  const avatar = event.initiator && event.initiator.avatar;
  const icon = 'syncBold';
  const time = event.timestamp;
  const initiator = <Tag type="user" avatar={avatar} text={initiatorName} />;
  const text = eventsFormater.SyncFailFullSync(initiator);

  return (
    <Item
      timestamp={isRenderDate ? event.timestamp : undefined}
      icon={icon}
      time={time}
      isLastDayEvent={isLastDayEvent}
    >
      {text}
    </Item>
  );
}

SyncFailFullSync.defaultProps = {
  isRenderDate: false,
  isLastDayEvent: false,
};

SyncFailFullSync.propTypes = {
  event: PropTypes.object.isRequired,
  isRenderDate: PropTypes.bool,
  isLastDayEvent: PropTypes.bool,
};

export default SyncFailFullSync;
