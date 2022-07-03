import React from 'react'; // eslint-disable-line
import PropTypes from 'prop-types';
import eventsFormater from '../../../../shared/eventsFormater';
import Tag from '../../../Tag';
import Item from '../Item';

function SyncSucceedFullSync({ event, isRenderDate, isLastDayEvent }) {
  const initiatorName = event.initiator.displayName;
  const avatar = event.initiator && event.initiator.avatar;
  const icon = 'syncBold';
  const time = event.timestamp;
  const initiator = <Tag type="user" avatar={avatar} text={initiatorName} />;
  const text = eventsFormater.SyncSucceedFullSync(initiator);

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

SyncSucceedFullSync.defaultProps = {
  isRenderDate: false,
  isLastDayEvent: false,
};

SyncSucceedFullSync.propTypes = {
  event: PropTypes.object.isRequired,
  isRenderDate: PropTypes.bool,
  isLastDayEvent: PropTypes.bool,
};

export default SyncSucceedFullSync;
