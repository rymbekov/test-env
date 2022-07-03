import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { withFormik } from 'formik';
import clsx from 'classnames';

import EditFormField from './EditFormField';
import schema from './schema';
import './styles.scss';

const getDefaultValue = (fieldType, placeholder, defaultAsPlaceholder) => {
	if (defaultAsPlaceholder) {
		return placeholder;
	}

	switch (fieldType) {
		case 'textfield':
			return '';
		case 'control':
			return false;
		default:
			return null;
	}
};

const mapPropsToValues = props => {
	const { data, fields, mapPropsToInitialValues } = props;

	if (mapPropsToInitialValues) {
		return mapPropsToInitialValues(fields, data, props);
	}
	return fields.reduce((acc, { fieldType, id, placeholder, defaultAsPlaceholder }) => {
		const value = data[id] || getDefaultValue(fieldType, placeholder, defaultAsPlaceholder);

		return {
			...acc,
			[id]: value,
		};
	}, {});
};

const EditForm = props => {
	const {
		className,
		fields,
		title,
		formId,
		schemaId,
		updateField,
		// formik props
		initialValues,
		handleChange: onChange,
		validateField,
		setFieldError,
	} = props;
	const validationSchema = schema[schemaId];
	const validate = useCallback(
		name => async value => {
			try {
				await validationSchema.validateSyncAt(name, { [name]: value });
			} catch (e) {
				throw e;
			}
		},
		[validationSchema]
	);

	const onSubmit = e => {
		e.preventDefault(e);
	};

	const handleChange = useCallback(
		async e => {
			const {
				target: { name, type, checked },
			} = e;

			if (type === 'checkbox' || type === 'radio') {
				onChange(e);

				try {
					if (validationSchema) {
						await validateField(name);
					}

					updateField(name, checked);
				} catch (e) {
					const { message } = e;

					setFieldError(name, message);
				}
			} else {
				onChange(e);
			}
		},
		[onChange, validationSchema, validateField, updateField, setFieldError]
	);

	const handleBlur = useCallback(
		async e => {
			const {
				target: { name, type, value },
			} = e;
			const initialValue = initialValues[name];

			if (type !== 'checkbox' && type !== 'radio') {
				
				try {
					if (validationSchema) {
						await validateField(name);
					}

					if (initialValue !== value) {
						updateField(name, value);
					}
				} catch (e) {
					const { message } = e;

					setFieldError(name, message);
				}
			}
		},
		[initialValues, validationSchema, validateField, updateField, setFieldError]
	);

	return (
		<div className={clsx('editForm', className)}>
			<If condition={title}>
				<div className="editForm__title">{title}</div>
			</If>
			<form id={formId} onSubmit={onSubmit}>
				{fields.map(field => {
					const { id, defaultAsPlaceholder, ...rest } = field; //eslint-disable-line

					return (
						<EditFormField key={id} id={id} onChange={handleChange} onBlur={handleBlur} validate={validate} {...rest} />
					);
				})}
			</form>
		</div>
	);
};

EditForm.defaultProps = {
	className: '',
	title: '',
	formId: undefined,
};
EditForm.propTypes = {
	className: PropTypes.string,
	fields: PropTypes.arrayOf(PropTypes.object).isRequired,
	title: PropTypes.string,
	formId: PropTypes.string,
	schemaId: PropTypes.string.isRequired,
	updateField: PropTypes.func.isRequired,
	handleChange: PropTypes.func.isRequired,
	validateField: PropTypes.func.isRequired,
	setFieldError: PropTypes.func.isRequired,
};

export default withFormik({
	mapPropsToValues,
	enableReinitialize: true,
	validateOnBlur: false,
	validateOnChange: false,
})(EditForm);
