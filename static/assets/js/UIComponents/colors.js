import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import localization from '../shared/strings';
import Tooltip from '../components/Tooltip';

const colors = [
  {
    name: 'red',
    value: '#ff0000',
    tooltip: localization.DETAILS.textLabeledRed,
  },
  {
    name: 'yellow',
    value: '#ffcc00',
    tooltip: localization.DETAILS.textLabeledYellow,
  },
  {
    name: 'green',
    value: '#66cc00',
    tooltip: localization.DETAILS.textLabeledGreen,
  },
  {
    name: 'blue',
    value: '#3300ff',
    tooltip: localization.DETAILS.textLabeledBlue,
  },
  {
    name: 'purple',
    value: '#9900ff',
    tooltip: localization.DETAILS.textLabeledPurple,
  },
  {
    name: 'nocolor',
    value: null,
    tooltip: localization.DETAILS.textNoColorLabel,
  },
];

class Colors extends React.Component {
  render() {
    const {
      value, onChange, className, highlight, error, disabled,
    } = this.props;

    return (
      <div
        className={cn('defaultColorList', className, { isError: error, disabled })}
        onAnimationEnd={() => this.props.highlightAnimationReset('color')}
      >
        <ul
          className={cn({
            highlightBlink: highlight,
          })}
        >
          {colors.map((color) => (
            <Tooltip key={color.name} content={color.tooltip} placement="top">
              <li
                ref={(node) => (this[color.name] = node)}
                onClick={() => onChange(color.name)}
                className={
                  value.indexOf(color.name) !== -1 || value.indexOf(color.value) !== -1 ? 'act' : ''
                }
              >
                <span
                  className={`filterLabelColor ${!color.value ? 'filterUnlabeledColor' : ''}`}
                  style={{ background: color.value || '' }}
                />
              </li>
            </Tooltip>
          ))}
        </ul>
      </div>
    );
  }
}

Colors.propTypes = {
  className: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  onChange: PropTypes.func,
};

Colors.defaultProps = {
  className: '',
  value: [],
  onChange: () => null,
};

export default Colors;
