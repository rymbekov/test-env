import React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash.isequal';

import Icon from '../Icon';
import { Input } from '../../UIComponents';
import Tooltip from '../Tooltip';

class Int extends React.Component {
  // Using props in an initial state it's an anti-pattern
  // https://medium.com/@justintulk/react-anti-patterns-props-in-initial-state-28687846cc2e
  state = {
    value: '',
  };

  componentDidMount() {
    const { value } = this.props;

    if (value) {
      this.setValue(value);
    }
  }

  componentDidUpdate(prevProps) {
    const { value } = this.props;

    if (!isEqual(prevProps.value, value)) {
      this.setValue(value);
    }
  }

  setValue = (value) => {
    this.setState({ value });
  };

  handleKeyDown = (event) => {
    const ctrlDown = event.ctrlKey || event.metaKey;
    const vKey = 86;
    const cKey = 67;

    if (
      (event.keyCode < 48 || event.keyCode > 57) &&
      (event.keyCode < 37 || event.keyCode > 40) && // arrows
      event.keyCode !== 8 && // backspace
      event.keyCode !== 9 && // tab
      event.keyCode !== 46 && // delete
      event.key !== 'e' &&
      (ctrlDown && (event.keyCode === cKey)) && // Ctrl+C
      (ctrlDown && (event.keyCode === vKey))    // Ctrl+V
    ) {
      event.preventDefault();
    }
  };

  handleChange = (event) => {
    const { value } = event.target;
    const { customField } = this.props;
    const { min, max } = customField;
    let nextValue = value;

    if ('max' in customField && Number(value) > max) {
      nextValue = max;
    }
    if ('min' in customField && Number(value) < min) {
      nextValue = min;
    }
    this.setValue(nextValue);
  };

  handleBlur = () => {
    const { value } = this.state;
    const { value: prevValue, customField, onChange } = this.props;

    if (!isEqual(prevValue, value)) {
      onChange(value, customField, () => this.setValue(prevValue));
    }
  };

  render() {
    const { value } = this.state;
    const { pattern, patternDescription, textPlaceholder, customField, disabled } = this.props;
    const { title } = customField;
    const validValue = typeof value === 'string' && value.length ? +value : value;

    return (
      <div
        data-qa={`custom-field-${title}`}
        key={title}
        className="picsioInputText customFieldValue"
      >
        <span className="labelInputText">{title}</span>
        {patternDescription && (
          <Tooltip content={patternDescription} placement="top">
            <span className="iconHolder">
              <Icon name="question" />
            </span>
          </Tooltip>
        )}
        <Input
          type="number"
          placeholder={textPlaceholder}
          disabled={disabled}
          value={validValue}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          onBlur={this.handleBlur}
          pattern={pattern}
          isDefault
        />
      </div>
    );
  }
}

Int.defaultProps = {
  value: '',
  pattern: '',
  patternDescription: '',
  textPlaceholder: '',
  disabled: false,
};
Int.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  pattern: PropTypes.string,
  patternDescription: PropTypes.string,
  textPlaceholder: PropTypes.string,
  customField: PropTypes.shape({
    title: PropTypes.string,
    min: PropTypes.number,
    max: PropTypes.number,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default Int;
