import React, { useCallback, useMemo, forwardRef } from 'react'; // eslint-disable-line
import cn from 'classnames';
import {
  object, string, func, element, bool, oneOfType, arrayOf,
} from 'prop-types';
import { CSSTransition } from 'react-transition-group';

import ErrorBoundary from '../ErrorBoundary';

const DEFAULT_BLOCK_TITLE = 'Unknown';

const DetailsBlock = forwardRef(({
  detailsPanelVisibility,
  blockName,
  blockTitle,
  children,
  toggleVisibility,
  indicator, // async statuses spinner or some info element
  additionalClass,
  error,
  errorHighlight,
  dataQa,
  openByDefault,
}, ref) => {
  const toggleOpen = useCallback(
    () => toggleVisibility(blockName),
    [blockName, toggleVisibility],
  );
  const qaIdentifier = useMemo(
    () => (dataQa ? ({ 'data-qa': `details-component-${dataQa}` }) : ({})),
    [dataQa],
  );
  const isOpened = useMemo(
    () => openByDefault || !!detailsPanelVisibility[blockName] || error,
    [openByDefault, detailsPanelVisibility, error, blockName],
  );
  const isHighlighted = useMemo(
    () => errorHighlight && error,
    [errorHighlight, error],
  );

  return (
    <div
      {...qaIdentifier}
      ref={ref}
      className={cn('detailsPanel__item', {
        act: isOpened,
        [additionalClass]: additionalClass,
        highlightBlink__half: isHighlighted,
      })}
    >
      <div className="detailsPanel__title">
        <span
          className="detailsPanel__title_text"
          tabIndex={0}
          onKeyPress={toggleOpen}
          onClick={toggleOpen}
          role="button"
        >
          {blockTitle}
        </span>
        {indicator}
      </div>
      <CSSTransition
        in={isOpened}
        timeout={300}
        classNames="fade"
      >
        <>
          {(openByDefault || !!detailsPanelVisibility[blockName] || error) && (
            <ErrorBoundary>
              {children}
              {error && <div className="detailsPanel__item_error">{error}</div>}
            </ErrorBoundary>
          )}
        </>
      </CSSTransition>
    </div>
  );
});

DetailsBlock.defaultProps = {
  detailsPanelVisibility: {
    [DEFAULT_BLOCK_TITLE]: true,
  },
  blockName: DEFAULT_BLOCK_TITLE,
  blockTitle: DEFAULT_BLOCK_TITLE,
  toggleVisibility: Function.prototype,
  additionalClass: null,
  indicator: null,
  error: false,
  errorHighlight: false,
  dataQa: null,
  children: null,
  openByDefault: false,
};

DetailsBlock.propTypes = {
  detailsPanelVisibility: object,
  blockName: string,
  blockTitle: string,
  toggleVisibility: func,
  additionalClass: string,
  indicator: element,
  children: oneOfType([element, arrayOf(element)]),
  error: oneOfType([string, bool]),
  errorHighlight: bool,
  dataQa: string,
  openByDefault: bool,
};

export default DetailsBlock;
