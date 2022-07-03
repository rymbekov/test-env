import React, {
  memo, useEffect, useState, useRef,
} from 'react';
import cn from 'classnames';
import useHover from '@react-hook/hover';
import { isMobile } from 'react-device-detect';
import { CSSTransition } from 'react-transition-group';
import PropTypes from 'prop-types';
import { MenuItem, MenuItemText } from '@picsio/ui';
import Tooltip from '../Tooltip';
import './MenuOnHover.scss';

const MenuOnHover = (props) => {
  const {
    activeItem,
    additionalClass,
    alignListLeft,
    alignListRight,
    handleItemClick,
    hideOnClick,
    list = [],
    opener,
    tooltip,
  } = props;
  const openerRef = useRef();
  const isHovering = useHover(openerRef, { enterDelay: 10, leaveDelay: 0 });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(isHovering);
  }, [isHovering, setOpen]);

  const handleClick = (value) => {
    handleItemClick(value);
    if (hideOnClick) {
      if (isMobile) {
        setOpen(false);
        return;
      }

      const event = new MouseEvent('mouseleave', {
        view: window,
        bubbles: true,
        cancelable: true,
      });

      openerRef.current.dispatchEvent(event);
    }
  };

  const handleOpenerClick = () => {
    if (isMobile) setOpen(!open);
  };

  const Opener = (
    <div
      className="MenuOnHoverOpener"
      onClick={handleOpenerClick}
      onKeyPress={handleOpenerClick}
      role="button"
      tabIndex={0}
    >
      <Choose>
        <When condition={typeof opener === 'function'}>
          {opener()}
        </When>
        <Otherwise>
          {opener}
        </Otherwise>
      </Choose>
    </div>
  );

  return (
    <div
      ref={openerRef}
      className={cn('MenuOnHover', { [additionalClass]: additionalClass })}
      data-testid={additionalClass}
    >
      <Choose>
        <When condition={tooltip && list.length <= 1}>
          <Tooltip placement="top" content={tooltip}>
            {Opener}
          </Tooltip>
        </When>
        <Otherwise>
          {Opener}
        </Otherwise>
      </Choose>
      <If condition={list.length > 1}>
        <CSSTransition
          unmountOnExit
          in={open}
          timeout={300}
          classNames="fade"
        >
          <div className={cn('MenuOnHoverList', {
            'MenuOnHoverList-Right': alignListRight,
            'MenuOnHoverList-Left': alignListLeft,
            'MenuOnHoverList-Center': !alignListRight && !alignListLeft,
          })}
          >
            <ul role="menu" tabIndex="-1" focusable="true">
              {list.map((item) => (
                <MenuItem
                  key={item.value}
                  id={item.value}
                  onClick={() => handleClick(item.value)}
                  className="menuItemDefault"
                  selected={activeItem === item.value}
                >
                  <MenuItemText primary={item.text.toString()} />
                </MenuItem>
              ))}
            </ul>
          </div>
        </CSSTransition>
      </If>
    </div>
  );
};

MenuOnHover.defaultProps = {
  activeItem: '',
  alignListLeft: false,
  alignListRight: false,
  hideOnClick: false,
  tooltip: '',
};

MenuOnHover.propTypes = {
  activeItem: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  additionalClass: PropTypes.string.isRequired,
  alignListLeft: PropTypes.bool,
  alignListRight: PropTypes.bool,
  handleItemClick: PropTypes.func.isRequired,
  hideOnClick: PropTypes.bool,
  list: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  })).isRequired,
  opener: PropTypes.oneOfType([PropTypes.node, PropTypes.string]).isRequired,
  tooltip: PropTypes.string,
};

export default memo(MenuOnHover);
