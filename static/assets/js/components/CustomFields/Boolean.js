import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from '../../UIComponents';

const InputCheckbox = ({ onChange, disabled, title, value }) => (
	<div data-qa={`custom-field-${title}`} className="customFieldValue">
		<Checkbox label={title} disabled={disabled} value={value} onChange={onChange} />
	</div>
);

InputCheckbox.propTypes = {
	title: PropTypes.string,
	value: PropTypes.bool,
	onChange: PropTypes.func,
	disabled: PropTypes.bool,
};

export default InputCheckbox;
