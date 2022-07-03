import React from 'react';
import PropTypes from 'prop-types';
import { useField } from 'formik';

import EditFormFieldView from './EditFormFieldView';

const EditFormField = props => {
	const { fieldType, id, label, type, helperText, onChange, onBlur, validate, ...rest } = props;
	const [field, meta] = useField({
		name: id,
		validate: validate(id),
		type,
	});
	const { name, value } = field;
	const { error } = meta;
	const text = error || helperText;
	const isError = !!error;
	return (
		<EditFormFieldView
			fieldType={fieldType}
			type={type}
			id={id}
			name={name}
			label={label}
			value={value}
			error={isError}
			helperText={text}
			onChange={onChange}
			onBlur={onBlur}
			{...rest}
		/>
	);
};

EditFormField.defaultProps = {
	type: 'text',
	helperText: null,
};
EditFormField.propTypes = {
	fieldType: PropTypes.oneOf(['textfield', 'control']).isRequired,
	type: PropTypes.string,
	id: PropTypes.string.isRequired,
	helperText: PropTypes.string,
	onChange: PropTypes.func.isRequired,
	onBlur: PropTypes.func.isRequired,
	validate: PropTypes.func.isRequired,
};

export default EditFormField;
