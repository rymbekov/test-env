import React from 'react';
import {
  bool, string, object, func,
} from 'prop-types';
import dayjs from 'dayjs';
import { DatePicker } from '@picsio/ui';
import isEqual from 'lodash.isequal';

import ua from '../../ua';
import { datePickerPlaceholder, datePickerDateFormat } from '../../shared/dateLocale';

class InputDate extends React.Component {
	/** @type {boolean} */
	isMobile = ua.browser.isNotDesktop();

	/** PropTypes */
	static propTypes = {
	  disabled: bool,
	  customField: object,
	  onChange: func,
	  value: string,
	};

	state = {
	  value: '',
	};

	componentDidMount() {
	  const { value } = this.props;

	  if (value) {
	    this.setState({ value });
	  }
	}

	handleChange = (newDate) => {
	  this.setState({ value: newDate });
		const { value: prevValue, customField, onChange } = this.props;
		if (!isEqual(prevValue, newDate)) {
			let date = newDate || '';
			if (newDate instanceof Date) {
				date = newDate.toISOString();
			}
			onChange(date, customField, () => this.setState(prevValue));
		}
	};

	render() {
	  const { value } = this.state;
	  const { customField, disabled } = this.props;
	  const title = customField.displayTitle || customField.title;
		let expiresDate;
    if (!this.isMobile) {
      expiresDate = value && new Date(value);
    } else {
      expiresDate = value && dayjs(value).format('YYYY-MM-DD');
    }
	  return (
			<div data-qa={`custom-field-${title}`} key={title} className="picsioInputText customFieldValue">
				<span className="labelInputText">{title}</span>
					<DatePicker
						selected={expiresDate}
						placeholderText={datePickerPlaceholder}
						dateFormat={datePickerDateFormat}
						onChange={this.handleChange}
						disabledKeyboardNavigation
						disabled={disabled}
						popperPlacement="bottom-center"
						todayButton="Today"
					/>
			</div>
	  );
	}
}

export default InputDate;
