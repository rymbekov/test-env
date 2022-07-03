import React from 'react'; // eslint-disable-line
import dayjs from 'dayjs';
import localization from '../../../shared/strings';

/**
 * Format event fields
 * @param {Object[]} fields
 * @param {Object?} options
 * @param {Function?} options.goToUrl - make links for items
 * @return {JSX[]}
 */
export default function formatMetadataFields(fields, options = {}) {
  if (!fields || !fields.length) return [];

  options = { tipping: 10, fieldsTotalCount: 0, ...options };

  const first = fields.slice(0, options.tipping);
  /** @type {Array} */
  const result = first.map((field, index) => {
    let { value } = field;
    if (field.type === 'date') {
      value = dayjs(value).isValid() ? dayjs(value).format('YYYY-MM-DD') : value;
    }

    return (
      <React.Fragment key={`${field.title}+${index}`}>
        <div className="fieldRow">
          <span>{field.title}: </span>
          <span className="fieldRowValue">{value}</span>
        </div>
      </React.Fragment>
    );
  });

  const rest = (options.fieldsTotalCount || fields.length) - options.tipping;
  if (rest > 0) {
    const ending = ` field${rest > 1 ? 's' : ''}`;
    result.push(` ${localization.AUDIT.and} ${rest} ${localization.AUDIT.more}${ending}`);
  }

  return result;
}
