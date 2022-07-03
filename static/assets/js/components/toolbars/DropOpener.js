import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import outy from 'outy';
import { Icon as UiIcon } from '@picsio/ui';
import ua from '../../ua';
import Avatar from '../Avatar';
import Icon from '../Icon';
import Button from './Button';

// @TODO: fix ipad
export default function DropOpener(props) {
  const { isToolbarDropdownOpened, resetDropdowns } = props;
  const [showDrop, setShowDrop] = useState(false);
  let outsideClickRef = null;

  const buttonRef = useRef();
  const dropRef = useRef();

  useEffect(() => {
    if (isToolbarDropdownOpened !== showDrop) {
      setShowDrop(isToolbarDropdownOpened);
    }
  }, [isToolbarDropdownOpened]);

  useEffect(() => {
    if (window.innerWidth < 1024) return;

    if (showDrop) {
      outsideClickRef = outy(dropRef.current, ['click'], handleOutsideClick);
    } else if (outsideClickRef) outsideClickRef.remove();
  }, [handleOutsideClick, showDrop]);

  const handleMobileClick = () => {
    if (window.innerWidth < 1024) return;

    if (!ua.browser.isNotDesktop()) return;
    if (isToolbarDropdownOpened === true) {
      if (resetDropdowns) resetDropdowns();
    }
    setShowDrop(!showDrop);
  };

  const handleOutsideClick = () => {
    if (!ua.browser.isNotDesktop()) return;
    setShowDrop(false);
    if (outsideClickRef) outsideClickRef.remove();
  };

  const handleCloseDrop = () => {
    if (resetDropdowns) resetDropdowns();
  };

  const {
    children,
    icon,
    icon: ControlIcon,
    additionalClass,
    id,
    sortTypeOrder,
    left,
    name,
    badge,
    avatarSrc,
  } = props;
  let className = 'toolbarButton';
  let dropdownStyle;

  if (additionalClass) className += ` ${additionalClass}`;
  if (showDrop) className += ' drop-active';
  if (avatarSrc) className += ' isAvatar';

  if (ua.browser.isNotDesktop()) {
    dropdownStyle = !showDrop ? { display: 'none' } : { display: 'flex' };
  }

  return (
    <div
      className={className}
      id={id}
      data-testid={id}
      onClick={handleMobileClick}
      onKeyPress={handleMobileClick}
      tabIndex={0}
      ref={buttonRef}
      role="menu"
    >
      {sortTypeOrder === 'asc' ? <span className="asc" /> : null}
      {sortTypeOrder === 'desc' ? <span className="desc" /> : null}
      {badge && <span className="badge">{badge < 100 ? badge : '99+'}</span>}
      {avatarSrc && <Avatar src={avatarSrc} size={25} enablePolling />}
      <If condition={icon && !avatarSrc}>
        <Choose>
          <When condition={typeof icon === 'function'}>
            <UiIcon size="lg" color="inherit">
              <ControlIcon />
            </UiIcon>
          </When>
          <Otherwise>
            {/* @TODO: remove old Icon */}
            <Icon name={icon} />
          </Otherwise>
        </Choose>
      </If>
      <div className="toolbarDropdownWrapper" ref={dropRef} style={dropdownStyle}>
        <div
          className={cn('toolbarDropdown', {
            'drop-active-left': left,
            [additionalClass]: additionalClass,
          })}
        >
          <header className="toolbarDropdownHeader">
            <Button id="button-close" icon="regularPrevArrow" onClick={handleCloseDrop} />
            <div className="toolbarName">{name || ''}</div>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}

DropOpener.defaultProps = {
  isToolbarDropdownOpened: false,
  resetDropdowns: null,
};

DropOpener.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  sortTypeOrder: PropTypes.string,
  isActive: PropTypes.bool,
  additionalClass: PropTypes.string,
  onClick: PropTypes.func,
  id: PropTypes.string,
  badge: PropTypes.number,
  isAvatar: PropTypes.bool,
  isToolbarDropdownOpened: PropTypes.bool,
  resetDropdowns: PropTypes.func,
};
