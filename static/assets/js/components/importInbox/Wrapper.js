import React, { forwardRef, useCallback, useMemo } from 'react';
import { usePrevious } from 'react-use';
import cn from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { CSSTransition } from 'react-transition-group';

import {
  arrayOf, bool, element, oneOfType, string,
} from 'prop-types';
import { changeVisibility } from '../../store/inboxApp/actions';

import Tooltip from '../Tooltip';
import ErrorBoundary from '../ErrorBoundary';

const Wrapper = forwardRef(({
  blockName, required, error, children, dataQa, title,
}, ref) => {
  const dispatch = useDispatch();
  const willBeOpened = useSelector((state) => state[blockName]);
  const hasErrors = useSelector((state) => state.hasErrors);
  const prevHasErrors = usePrevious(hasErrors);

  const toggleOpen = useCallback(() => {
    if (!error) dispatch(changeVisibility(blockName, !willBeOpened));
  }, [dispatch, willBeOpened, error, blockName]);

  const isOpened = willBeOpened || !!error;

  const requiredText = useMemo(
    () => {
      if (typeof required !== 'string') return null;
      return <sup>{required}</sup>;
    },
    [required],
  );

  return (
    <div
      ref={ref}
      data-qa={dataQa}
      className={cn('detailsPanel__item', {
        act: isOpened,
        highlightBlink__half: error && hasErrors && !prevHasErrors,
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
          {title}
        </span>
        <If condition={required}>
          <Tooltip content="Required field" placement="top">
            <span className="isRequiredIndicator">* {requiredText}</span>
          </Tooltip>
        </If>
      </div>
      <CSSTransition in={isOpened} timeout={300} classNames="fade">
        <div> {/** div just for transition */}
          {isOpened && (
            <ErrorBoundary>
              {children}
              {error && <div className="detailsPanel__item_error">{error}</div>}
            </ErrorBoundary>
          )}
        </div>
      </CSSTransition>
    </div>
  );
});

Wrapper.defaultProps = {
  title: 'Unknown',
  required: false,
  error: null,
  dataQa: '',
  children: null,
};

Wrapper.propTypes = {
  title: string,
  blockName: string.isRequired,
  required: oneOfType([bool, string]),
  error: string,
  dataQa: string,
  children: oneOfType([element, arrayOf(element), string]),
};

export default Wrapper;
