import React from 'react';
import PropTypes from 'prop-types';

import { DatePicker } from '@picsio/ui';
import Select from './select';
import localization from '../shared/strings';

import ua from '../ua';
import { datePickerDateFormat } from '../shared/dateLocale';

const { INPUT_DATE_RANGE } = localization;

const defaultOptions = [
  {
    text: INPUT_DATE_RANGE.any,
    value: 'any',
  },
  {
    text: INPUT_DATE_RANGE.today,
    value: 'today',
  },
  {
    text: INPUT_DATE_RANGE.yesterday,
    value: 'yesterday',
  },
  {
    text: INPUT_DATE_RANGE.lastweek,
    value: 'lastweek',
  },
  {
    text: INPUT_DATE_RANGE.lastmonth,
    value: 'lastmonth',
  },
  {
    text: INPUT_DATE_RANGE.last90days,
    value: 'last90days',
  },
  {
    text: INPUT_DATE_RANGE.custom,
    value: 'custom',
  },
];

class InputDateRange extends React.Component {
	isMobile = ua.browser.isNotDesktop();

	constructor(props) {
	  super(props);

	  const isCustom = !defaultOptions.some((item) => item.value === props.value);
	  const valueArr = props.value.split('_');

	  this.state = {
	    isCustom,
	    startDate: isCustom && valueArr.length > 1 && valueArr[0] ? +valueArr[0] : this.isMobile ? '' : null,
	    endDate: isCustom && valueArr.length > 1 && valueArr[1] ? +valueArr[1] : this.isMobile ? '' : null,
	  };
	}

	static getDerivedStateFromProps(nextProps, prevState) {
	  if (nextProps.value !== prevState.value) {
	    const isCustom = !defaultOptions.some((item) => item.value === nextProps.value);
	    const valueArr = nextProps.value.split('_');
	    const isMobile = ua.browser.isNotDesktop();

	    return {
	      value: nextProps.value,
	      isCustom,
	      startDate: isCustom && valueArr.length > 1 && valueArr[0] ? +valueArr[0] : isMobile ? '' : null,
	      endDate: isCustom && valueArr.length > 1 && valueArr[1] ? +valueArr[1] : isMobile ? '' : null,
	    };
	  }

	  return null;
	}

	onChange = (e, value) => {
	  if (value === 'custom') {
	    this.onInputChange();
	  } else {
	    this.setState({ isCustom: false });
	    this.props.onChange(value);
	  }
	};

	onInputChange = (name, value) => {
	  let { startDate, endDate } = this.state;

	  if (name === 'startDate') {
	    startDate = value;
	  }
	  if (name === 'endDate') {
	    endDate = value;
	  }

	  const start = startDate ? new Date(startDate).getTime() : '';
	  let end = endDate ? new Date(endDate).getTime() : '';
	  if (name === 'endDate' && endDate) {
	    // to include endDate we add whole day milliseconds
	    end += 24 * 60 * 60 * 1000;
	  }
	  const newValue = `${start}_${end}`;
	  this.setState({ startDate, endDate });
	  this.props.onChange(newValue);
	};

	render() {
	  const { value, disabled } = this.props;
	  let { isCustom, startDate, endDate } = this.state;
	  startDate && (startDate = new Date(startDate));
	  endDate && (endDate = new Date(endDate));
	  // to show correct value in calendar we subtract 1 day that was added before
	  endDate && (endDate = new Date(endDate.setDate(endDate.getDate() - 1)));
	  return (
	    <div className="picsioInputDateRange">
	      <Select
	        value={isCustom ? 'custom' : value}
	        options={defaultOptions}
	        onChange={this.onChange}
	        disabled={disabled}
  			/>
    		{isCustom && <DatePicker startDate={startDate} endDate={endDate} onInputChange={this.onInputChange} datePickerDateFormat={datePickerDateFormat} /> }
  		</div>
	  );
	}
}

InputDateRange.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

InputDateRange.defaultProps = {
  disabled: false,
};

export default InputDateRange;
