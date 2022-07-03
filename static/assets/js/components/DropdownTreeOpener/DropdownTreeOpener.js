import React, { useState, useEffect, useRef } from 'react';
import { bool, func, object, string } from 'prop-types';
import outy from 'outy';
import { CSSTransition } from 'react-transition-group';
import { IconButton } from '@picsio/ui';
import Logger from '../../services/Logger';
import Icon from '../Icon';
import Tooltip from '../Tooltip';

import './style.scss';

let outsideClickRef = null;

export function DropdownTreeOpener({
  hideOnClickOutside, children, tooltip, toggleDropdownTree, isPermission,
}) {
  const [showDrop, setShowDrop] = useState(false);
  const dropRef = useRef();
  useEffect(() => {
    if (!hideOnClickOutside) return;
    if (showDrop) {
      outsideClickRef = outy(dropRef.current, ['click'], handleOutsideClick);
    } else if (outsideClickRef) outsideClickRef.remove();
  }, [showDrop]);

  const handleButtonClick = () => {
    Logger.log('User', 'DropdownTreeOpenerClick');
    setShowDrop(!showDrop);
    toggleDropdownTree(!showDrop);
  };

  const handleOutsideClick = () => {
    setShowDrop(!showDrop);
    toggleDropdownTree(!showDrop);
    if (outsideClickRef) outsideClickRef.remove();
  };

  return (
    <>
      <Tooltip content={tooltip} placement="top">
        <>
          <If condition={isPermission}>
            <button
              onClick={handleButtonClick}
              className="addButtonCollection"
            >
              <span>+</span> Add collection
            </button>
          </If>
          <If condition={!isPermission}>
            <IconButton
              className="dropdownTreeOpener"
              buttonSize="default"
              color="default"
              component="button"
              onClick={handleButtonClick}
              size="md"
            >
              <Icon name="clip" />
            </IconButton>
          </If>
        </>
      </Tooltip>
      <span className="dropdownTreeHolder" ref={dropRef}>
        <CSSTransition in={showDrop} timeout={300} classNames="fade">
          <>{showDrop && children}</>
        </CSSTransition>
      </span>
    </>
  );
}

DropdownTreeOpener.defaultProps = {
  toggleDropdownTree: () => {},
  isPermission: false,
  tooltip: '',
  hideOnClickOutside: false,
};

DropdownTreeOpener.propTypes = {
  children: object,
  isPermission: bool,
  toggleDropdownTree: func,
  tooltip: string,
  hideOnClickOutside: bool,
};

export default DropdownTreeOpener;
