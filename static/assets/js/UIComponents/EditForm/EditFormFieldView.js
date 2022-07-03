import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { TextField, InputControlLabel } from '@picsio/ui';

const EditFormFieldView = props => {
	const { fieldType, id, name, value, label, type, error, helperText, onChange, onBlur, ...rest } = props;
	return (
		<div className="editForm__field">
			<Choose>
				<When condition={fieldType === 'textfield'}>
					<TextField
						key={id}
						type={type}
						id={id}
						name={name}
						label={label}
						value={value}
						error={error}
						helperText={helperText}
						onChange={onChange}
						onBlur={onBlur}
						{...rest}
					/>
				</When>
				<When condition={fieldType === 'control'}>
					<InputControlLabel
						key={id}
						name={name}
						label={label}
						value={value}
						error={error}
						helperText={helperText}
						onChange={onChange}
						onBlur={onBlur}
						{...rest}
					/>
				</When>
				<Otherwise>{null}</Otherwise>
			</Choose>
		</div>
	);
};

EditFormFieldView.defaultProps = {
	type: 'text',
	helperText: null,
};
EditFormFieldView.propTypes = {
	fieldType: PropTypes.oneOf(['textfield', 'control']).isRequired,
	id: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	type: PropTypes.string,
	error: PropTypes.bool.isRequired,
	helperText: PropTypes.string,
	onChange: PropTypes.func.isRequired,
	onBlur: PropTypes.func.isRequired,
};

export default memo(EditFormFieldView);
