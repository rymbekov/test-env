import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import Icon from '../Icon';
import Tooltip from '../Tooltip';

export default function ControlButton(props) {
  const {
    icon, children, disabled, onClick, isActive, tooltip, placement, count, testid,
  } = props;

  const handleClick = () => {
    if (!disabled && onClick) onClick();
  };

  return (
    <Tooltip content={tooltip} placement={placement}>
      <div
        className={cn('catalogItem__button', { isActive, disabled })}
        onClick={handleClick}
        onKeyPress={handleClick}
        tabIndex={0}
        role="button"
        testid={testid}
      >
        <If condition={count}>
          <div className="catalogItem__button-count">{count}</div>
        </If>
        <Icon name={icon} />
        <If condition={children}>{children}</If>
      </div>
    </Tooltip>
  );
}

ControlButton.defaultProps = {
  children: null,
  count: null,
  disabled: false,
  isActive: false,
  onClick: () => {},
  placement: 'left',
  tooltip: '',
  testid: '',
};

ControlButton.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  disabled: PropTypes.bool,
  icon: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
  placement: PropTypes.string,
  tooltip: PropTypes.string,
  testid: PropTypes.string,
};
