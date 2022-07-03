import React from 'react';
import eventsFormater from '../../../../shared/eventsFormater';
import { object, bool, func } from 'prop-types';
import Tag from '../../../Tag';
import Item from '../Item';
import formatAssets from '../../helpers/formatAssets';

function AssetsKeywordingComplete({
  event, isRenderDate, goToUrl, isLastDayEvent,
}) {
  const assets = formatAssets(event.data.assets, {
    goToUrl,
    assetsTotalCount: event.data.assetsTotalCount,
  });
  const avatar = event.initiator && event.initiator.avatar;
  const initiatorName = event.initiator.displayName;
  const time = event.timestamp;
  const initiator = <Tag type="user" avatar={avatar} text={initiatorName} />;
  const text = eventsFormater.AssetsKeywordingComplete(assets, initiator);

  return (
    <Item
      timestamp={isRenderDate ? event.timestamp : undefined}
      time={time}
      avatar={avatar}
      isLastDayEvent={isLastDayEvent}
    >
      {text}
    </Item>
  );
}

AssetsKeywordingComplete.defaultProps = {
  isRenderDate: false,
  goToUrl: undefined,
  isLastDayEvent: false,
};

AssetsKeywordingComplete.propTypes = {
  event: object.isRequired,
  isRenderDate: bool,
  goToUrl: func,
  isLastDayEvent: bool,
};

export default AssetsKeywordingComplete;
