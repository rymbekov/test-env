import React from 'react';
import PropTypes from 'prop-types';
import ReactSlider from 'react-slider'; // eslint-disable-line

import InputIncremental from './inputIncremental'; // eslint-disable-line

export default class InputRange extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      activePresetIndex: this.findActivePreset(props.value),
    };

    this.onChange = this.onChange.bind(this);
    this.findActivePreset = this.findActivePreset.bind(this);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.state.value) {
      this.onChange(nextProps.value);
    }
  }

  /**
	 * Change value
	 * @param {number} value
	 */
  onChange(value) {
    this.setState(
      {
        value,
        activePresetIndex: this.findActivePreset(value),
      },
      () => this.props.onChange(value),
    );
  }

  /**
	 * Find active preset by value
	 * @param {number} value
	 */
  findActivePreset(value) {
    const { presets } = this.props;
    if (!presets) return null;
    let presetIndex = 0;

    presets.forEach((preset, index, arr) => {
      if (index === 0 && value <= preset.value) {
        return (presetIndex = index);
      }
      if (index === arr.length - 1 && value >= preset.value) {
        return (presetIndex = index);
      }
      if (index !== 0 && (value > arr[index - 1].value && value <= preset.value)) {
        presetIndex = index;
      }
    });

    return presetIndex;
  }

  render() {
    const {
      disabled, min, max, label, presets,
    } = this.props;
    const { value, activePresetIndex } = this.state;

    return (
      <div className={`UIInputRange ${disabled ? 'UIInputRange__disabled' : ''}`}>
        <InputIncremental
          value={value}
          onChange={(e, value) => this.onChange(value)}
          disableSubmitButtons
          min={min}
          max={max}
          disabled={disabled}
        />
        {label != null && <div className="UIInputRangeLabel">{label}</div>}
        <ReactSlider
          withBars
          min={min}
          max={max}
          value={value}
          disabled={disabled}
          className="UIInputRange__slider"
          handleClassName="UIInputRange__dot"
          barClassName="UIInputRange__line"
          onChange={this.onChange}
          onAfterChange={this.props.onAfterChange}
          onSliderClick={this.props.onSliderClick}
        />
        {presets && (
          <ul className="UIInputRangePresets">
            {presets.map((preset, index) => (
              <li
                key={index}
                onClick={() => !disabled && this.onChange(preset.value)}
                className={activePresetIndex === index ? 'UIInputRangeActive' : ''}
              >
                {preset.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
}

/** Prop types */
InputRange.propTypes = {
  disabled: PropTypes.bool,
  value: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  label: PropTypes.string,
  presets: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.number,
    }),
  ),
  onChange: PropTypes.func,
  onAfterChange: PropTypes.func,
  onSliderClick: PropTypes.func,
};

/** Default props */
InputRange.defaultProps = {
  disabled: false,
  value: 0,
  min: 0,
  max: 100,
  onChange: Function.prototype,
  onAfterChange: Function.prototype,
  onSliderClick: Function.prototype,
};
