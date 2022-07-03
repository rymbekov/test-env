import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import ua from '../ua';
import sanitizeXSS from '../shared/sanitizeXSS';

export default function InputWithStriptags({
	name = '',
	value,
	placeholder = '',
	type = 'text',
	className = '',
	onChange = Function.prototype,
	onFocus = Function.prototype,
	onBlur = Function.prototype,
	onKeyDown = Function.prototype,
	onMouseDown = Function.prototype,
	onPaste = Function.prototype,
	dataName,
	defaultValue,
	disabled = false,
	customRef = React.createRef(),
	autoFocus = false,
	autoComplete = 'false',
	pattern,
	size,
	readOnly,
	stripTagsEnable = true,
	dataTestId
}) {
	if (!['number', 'string'].includes(typeof value)) value = undefined;

	if (type === 'date' && value) {
		// value = Date.create(value);
		if (!ua.browser.isNotDesktop()) {
			value = dayjs(value);
			const localTimezoneOffset = value.getTimezoneOffset() * 60 * 1000;
			value = new Date(value.getTime() + localTimezoneOffset).format('{yyyy}-{MM}-{dd}');
		}
	}

	const handleOnBlur = e => {
		const value = stripTagsEnable ? sanitizeXSS(e.currentTarget.value, null, true) : e.currentTarget.value;
		onBlur(e, value);
	};

	useEffect(() => {
		if (autoFocus === true) {
			customRef.current && customRef.current.focus();
		}
	}, [autoFocus]);

	return (
		<input
			name={name}
			type={type}
			className={className}
			placeholder={placeholder}
			defaultValue={defaultValue}
			value={value}
			disabled={disabled}
			ref={customRef}
			onChange={e => onChange(e, e.currentTarget.value)}
			onFocus={e => onFocus(e, e.currentTarget.value)}
			onBlur={e => handleOnBlur(e)}
			onKeyDown={e => onKeyDown(e, e.currentTarget.value)}
			onMouseDown={e => onMouseDown(e)}
			onPaste={e => onPaste(e, e.currentTarget.value)}
			autoFocus={autoFocus}
			autoComplete={autoComplete}
			data-name={dataName}
			pattern={pattern}
			size={size}
			readOnly={readOnly}
			data-testid={dataTestId}
		/>
	);
}
