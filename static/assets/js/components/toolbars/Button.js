import React, { memo, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Icon as UiIcon } from '@picsio/ui';
import Icon from '../Icon';
import Tooltip from '../Tooltip';

const Button = forwardRef((props, ref) => {
  const {
    additionalClass,
    backlight,
    children,
    counter,
    icon,
    icon: ControlIcon,
    iconSize,
    id,
    isActive,
    isDisabled,
    onClick,
    onDragEnter,
    onDragLeave,
    onDragOver,
    style,
    tooltip,
    tooltipPosition,
  } = props;
  let className = 'toolbarButton';

  if (additionalClass) className += ` ${additionalClass}`;
  if (isActive) className += ' active';
  if (isDisabled) className += ' disabled';
  if (backlight) className += ' backlight';
  if (icon && typeof icon === 'string') className += ` ${icon}`; // for old icons

  let counterText = null;
  if (counter) {
    counterText = counter > 99 ? '99+' : counter;
  }

  const handleClick = () => {
    if (!isDisabled && onClick) onClick();
  };

  return (
    <Tooltip content={tooltip} placement={tooltipPosition}>
      <div
        ref={ref}
        id={id}
        className={className}
        onClick={handleClick}
        onKeyPress={handleClick}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDragEnter={onDragEnter}
        style={style}
        role="button"
        tabIndex={0}
      >
        {children}
        <If condition={icon}>
          <Choose>
            <When condition={typeof icon === 'function'}>
              <UiIcon size={iconSize} color="inherit">
                <ControlIcon />
              </UiIcon>
            </When>
            <Otherwise>
              {/* @TODO: remove old Icon */}
              <Icon name={icon} />
            </Otherwise>
          </Choose>
        </If>
        <If condition={counterText}>
          <span className="toolbarCounter">{counterText}</span>
        </If>
      </div>
    </Tooltip>
  );
});

Button.defaultProps = {
  additionalClass: null,
  backlight: false,
  children: null,
  counter: null,
  icon: null,
  iconSize: 'lg',
  id: null,
  isActive: false,
  isDisabled: false,
  onClick: null,
  onDragEnter: null,
  onDragLeave: null,
  onDragOver: null,
  style: null,
  tooltip: null,
  tooltipPosition: 'right',
};

Button.propTypes = {
  additionalClass: PropTypes.string,
  backlight: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.node]),
  counter: PropTypes.number,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  iconSize: PropTypes.string,
  id: PropTypes.string,
  isActive: PropTypes.bool,
  isDisabled: PropTypes.bool,
  onClick: PropTypes.func,
  onDragEnter: PropTypes.func,
  onDragLeave: PropTypes.func,
  onDragOver: PropTypes.func,
  style: PropTypes.shape(PropTypes.object),
  tooltip: PropTypes.string,
  tooltipPosition: PropTypes.string,
};

export default memo(Button);
