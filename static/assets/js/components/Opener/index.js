import React, { useState, useEffect, useRef } from 'react';
import { object, bool, string, func, oneOfType } from 'prop-types';
import outy from 'outy';
import cn from 'classnames';
import { CSSTransition } from 'react-transition-group';
import { Button } from '@picsio/ui';
import Logger from '../../services/Logger';
import Tooltip from '../Tooltip';

function Opener({
  openerText,
  hideOpenerWhenOpen,
  hideOnClickOutside,
  children,
  tooltip,
  parentHandler,
  eventName,
  disabled,
  additionalClassName,
}) {
  let outsideClickRef = null;
  const [showDrop, setShowDrop] = useState(false);
  const dropRef = useRef();

  useEffect(() => {
    if (!hideOnClickOutside) return;
    if (showDrop) {
      outsideClickRef = outy(dropRef.current, ['click'], handleOutsideClick);
    } else if (outsideClickRef) outsideClickRef.remove();
  }, [showDrop]);

  const handleButtonClick = () => {
    Logger.log('User', eventName || 'OpenerClick');
    setShowDrop(!showDrop);
    parentHandler(!showDrop);
  };

  const handleOutsideClick = () => {
    setShowDrop(!showDrop);
    parentHandler(!showDrop);
    if (outsideClickRef) outsideClickRef.remove();
  };

  const OpenerLink = (
    <Tooltip content={tooltip} placement="top">
      <Button
        variant="text"
        color="primary"
        onClick={handleButtonClick}
        disabled={disabled}
        className={cn({ [additionalClassName]: additionalClassName })}
      >
        {openerText}
      </Button>
    </Tooltip>
  );

  const ChildElementWithRef = () => {
    const childElement = React.Children.only(children);

    return React.cloneElement(childElement, { ref: dropRef });
  };

  return (
    <>
      <Choose>
        <When condition={hideOpenerWhenOpen}>
          <CSSTransition in={!showDrop} timeout={300} classNames="fade">
            <><If condition={!showDrop}>{OpenerLink}</If></>
          </CSSTransition>
        </When>
        <Otherwise>{OpenerLink}</Otherwise>
      </Choose>

      <CSSTransition in={showDrop} timeout={300} classNames="fade">
        <>{showDrop && ChildElementWithRef()}</>
      </CSSTransition>
    </>
  );
}

Opener.defaultProps = {
  hideOpenerWhenOpen: false,
  hideOnClickOutside: true,
  tooltip: false,
  eventName: '',
  additionalClassName: '',
  parentHandler: () => {},
};

Opener.propTypes = {
  openerText: string,
  children: object,
  hideOpenerWhenOpen: bool,
  hideOnClickOutside: bool,
  tooltip: oneOfType([string, bool]),
  parentHandler: func,
  eventName: string,
  additionalClassName: string,
};

export default Opener;
