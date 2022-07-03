import React from 'react'; // eslint-disable-line
import dayjs from 'dayjs';
import Icon from '../../Icon';

/**
 * Event item
 * @param {Object} props
 * @param {string} props.icon
 * @param {string} props.time
 * @param {string} props.avatar
 * @param {JSX} props.children
 * @param {string?} props.timestamp
 * @returns {JSX}
 */
export default function ({
  icon, time, children, timestamp, isLastDayEvent,
}) {
  return (
    <div className={`datedPack ${isLastDayEvent ? 'datedPackWithLastEvent' : ''}`}>
      {timestamp && <div className="pageAudit__list__date">{dayjs(timestamp).format('ll')}</div>}
      <div className="pageAudit__list__item">
        <div className="pageAudit__list__item__icon">{icon ? <Icon name={icon} /> : <span>A</span>}</div>
        <div className="pageAudit__list__item__dot" />
        <div className="pageAudit__list__item__time">{dayjs(time).format('LT')}</div>
        <div className="pageAudit__list__item__text">{children}</div>
      </div>
    </div>
  );
}
