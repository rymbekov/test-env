import React from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { Icon } from '@picsio/ui';

export default function BottomNavigationButton(props) {
  const { icon: ControlIcon, label, badge, miniBadge, isActive, isDisabled, onClick } = props;

  return (
    <button
      className={cn('bottomNavigationButton', { isActive, isDisabled })}
      onClick={onClick}
      type="button"
    >
      <div className="bottomNavigationButton-icon">
        <Icon size="lg" color="inherit">
          <ControlIcon />
        </Icon>
        <If condition={badge}>
          <div className="badge">{badge}</div>
        </If>
        <If condition={miniBadge}>
          <div className="miniBadge" />
        </If>
      </div>
      <div className="bottomNavigationButton-label">{label}</div>
    </button>
  );
}

BottomNavigationButton.defaultProps = {
  badge: null,
  miniBadge: null,
  isDisabled: false,
};

BottomNavigationButton.propTypes = {
  icon: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  miniBadge: PropTypes.bool,
  isDisabled: PropTypes.bool,
};
