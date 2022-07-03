import React from 'react';
import cn from 'classnames';
import { oneOf, object } from 'prop-types';

import { Tooltip } from '@picsio/ui';

export const LOCAL_STORAGE_FIELD_NAME = 'pdfViewerSpread';

const SPREAD_OPTIONS = [
  {
    value: 0,
    text: 'No spreads',
    Component: () => <span>1</span>,
  },
  {
    value: 1,
    text: 'Odd spreads',
    Component: () => <><span>1</span><span>2</span></>,
  },
  {
    value: 2,
    text: 'Even spreads',
    Component: () => <><span>2</span><span>3</span></>,
  },
];

const SpreadSelect = ({ spreadMode, eventBus }) => {
  const handleChange = (value) => {
    if (value === spreadMode) return;
    eventBus.dispatch('changespread', {
      source: SpreadSelect,
      spread: value,
    });
  };

  return (
    <div className="pdfViewerSpreadItems">
      {SPREAD_OPTIONS.map(({ value, text, Component }) => (
        <Tooltip content={text} key={value}>
          <span
            className={cn('pdfViewerSpreadItem', { active: value === spreadMode })}
            onClick={() => handleChange(value)}
            onKeyDown={() => handleChange(value)}
            role="button"
            tabIndex={0}
          >
            <Component />
          </span>
        </Tooltip>
      ))}
    </div>
  );
};

SpreadSelect.propTypes = {
  spreadMode: oneOf([0, 1, 2]),
  // eslint-disable-next-line react/forbid-prop-types
  eventBus: object.isRequired, // pdf.js EventBus
};

SpreadSelect.defaultProps = { spreadMode: 0 };

export default SpreadSelect;
