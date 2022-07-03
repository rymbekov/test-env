import React, { memo } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash.isequal';

import Icon from '../Icon';
import { Textarea } from '../../UIComponents';
import Tooltip from '../Tooltip';

class InputText extends React.Component {
  // Using props in the initial state it's an anti-pattern
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

  componentDidUpdate(prevProps, prevState) {
    const { value: inputValue } = this.state;
    const { value } = this.props;
    const isPropValueChanged = !isEqual(prevProps.value, value);
    const isInputValueChanged = !isEqual(prevState.value, inputValue);
    const isDifferent = !isEqual(value, inputValue);

    if (isPropValueChanged) {
      this.setValue(value);
    } else if (!isInputValueChanged && isDifferent) {
      // it's a trick, don't use something like that. should be better solution, but not here
      this.setValue(value);
    }
  }

  setValue = (value) => {
    this.setState({ value });
  };

  handleChange = (event) => {
    const { value } = event.target;

    this.setValue(value);
  };

  handleBlur = () => {
    const { value } = this.state;
    const { value: prevValue, customField, onChange } = this.props;

    if (!isEqual(value, prevValue)) {
      onChange(value, customField, () => this.setValue(prevValue));
    }
  };

  render() {
    const { value } = this.state;
    const {
      customField,
      pattern,
      patternDescription,
      textPlaceholder,
      disabled,
      onResize,
      height,
    } = this.props;
    const { title } = customField;

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
        <Textarea
          type="text"
          placeholder={textPlaceholder}
          disabled={disabled}
          value={value}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          onFocus={this.handleFocus}
          onResize={onResize}
          pattern={pattern}
          height={height}
          defaultHeight={0}
        />
      </div>
    );
  }
}

InputText.defaultProps = {
  value: '',
  pattern: '',
  patternDescription: '',
  textPlaceholder: '',
  disabled: false,
  height: 0,
};
InputText.propTypes = {
  value: PropTypes.string,
  pattern: PropTypes.string,
  patternDescription: PropTypes.string,
  textPlaceholder: PropTypes.string,
  customField: PropTypes.shape({
    title: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  onResize: PropTypes.func.isRequired,
  height: PropTypes.number,
};

export default memo(InputText);
