import React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash.isequal';

import { ReactSelect } from '../../UIComponents';

class Enum extends React.Component {
  // Using props in an initial state it's an anti-pattern
  // https://medium.com/@justintulk/react-anti-patterns-props-in-initial-state-28687846cc2e
  state = {
    value: { label: 'Select', value: 'select' },
    options: [],
  };

  componentDidMount() {
    const { customField } = this.props;

    if (customField) {
      this.setOptions();
    }
  }

  componentDidUpdate(prevProps) {
    const { selectedAssetsIds } = this.props;

    if (!isEqual(prevProps.selectedAssetsIds, selectedAssetsIds)) {
      this.setOptions();
    }
  }

  setOptions = () => {
    const { value, customField, selectedAssetsIds } = this.props;
    const validValue = typeof value === 'number' ? value.toString() : value;
    let options = [];

    if (customField.options) {
      if (selectedAssetsIds.length > 1) {
        options.push({ label: 'Multiple selection', value: 'select' });
      } else {
        options.push({ label: 'Select value', value: 'select' });
      }
      options = options.concat(customField.options.map((key) => ({ label: key, value: key })));
    }
    this.setState({ value: { label: validValue, value: validValue }, options });
  };

  handleChange = ({ value }) => {
    const { customField, onChange } = this.props;
    const validValue = value === 'select' ? '' : value;
    this.setState({
      value: { label: validValue, value: validValue },
    });
    onChange(validValue, customField);
  };

  render() {
    const { value, options } = this.state;
    const {
      customField: { title },
      disabled,
    } = this.props;
    return (
      <div data-qa={`custom-field-${title}`} className="picsioInputText customFieldValue">
        <span className="labelInputText">{title}</span>
        <ReactSelect
          options={options}
          value={value}
          disabled={disabled}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

Enum.defaultProps = {
  selectedAssetsIds: [],
  value: '',
  customField: {
    title: '',
    options: [],
  },
  disabled: false,
};
Enum.propTypes = {
  selectedAssetsIds: PropTypes.arrayOf(PropTypes.string),
  value: PropTypes.string,
  customField: PropTypes.shape({
    title: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.string),
  }),
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default Enum;
