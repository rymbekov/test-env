import React from 'react'; // eslint-disable-line
import {
  oneOfType, object, string, bool, func,
} from 'prop-types';
import cn from 'classnames';
import Icon from '../components/Icon';

const Checkbox = React.forwardRef(
  (
    {
      label = null,
      value = false,
      onChange = () => {},
      disabled = false,
      slide = false,
      inProgress = false,
      icon = null,
      error = false,
    },
    ref,
  ) => {
    if (!slide) {
      return (
        <div
          className={cn('UICheckbox', {
            'UICheckbox--checked': value && value !== 'indeterminate',
            'UICheckbox--partial': value === null || value === 'indeterminate',
            'UICheckbox--disabled': disabled,
            'UICheckbox--error': error,
          })}
          ref={ref}
          onClick={() => !disabled && onChange(!value)}
        >
          <div
            className={cn('UICheckbox__checkbox', {
              ok: value,
            })}
          >
            <Icon name="ok" />
          </div>
          {label && <div className="UICheckbox__label">{label}</div>}
        </div>
      );
    }
    return (
      <div className={cn('slideCheckboxWrapper', { inProgress })} ref={ref}>
        {label && (
          <div className="slideCheckboxLabel" onClick={() => !disabled && onChange(!value)}>
            {label}
          </div>
        )}
        <div
          className={cn('slideCheckbox', {
            slideCheckboxChecked: value,
            slideCheckboxDisabled: disabled,
          })}
          onClick={() => !disabled && onChange(!value)}
        >
          <div className="slideCheckboxSlider">
            {icon && (icon === 'share' ? <Icon name="share" /> : <i className={icon} />)}
            <i className="slideCheckboxSyncIcon">
              <Icon name="sync" />
            </i>
          </div>
        </div>
      </div>
    );
  },
);

Checkbox.propTypes = {
  label: oneOfType([string, object]),
  value: oneOfType([string, bool]), // string needs for 'partial' checkbox
  disabled: bool,
  onChange: func,
  slide: bool,
  inProgress: bool,
  icon: string,
};

export default Checkbox;
