import React, { useState, useEffect } from 'react';
import sanitizeXSS from '../shared/sanitizeXSS';

export default function TextareaWithStriptags({
	name = '',
	value,
	placeholder = '',
	className = '',
	onChange = Function.prototype,
	onFocus = Function.prototype,
	onBlur = Function.prototype,
	onKeyDown = Function.prototype,
	defaultValue,
	disabled = false,
	customRef,
	autoFocus = false,
	autoComplete = 'false',
	style,
	stripTagsEnable = true,
}) {
	const [textareaValue, setTextareaValue] = useState(value || null);

	useEffect(() => {
		if (value !== textareaValue) {
			setTextareaValue(value);
		}
	}, [value, textareaValue]);

	const handleOnChange = e => {
		const value = stripTagsEnable ? sanitizeXSS(e.currentTarget.value, null, true) : e.currentTarget.value;
		setTextareaValue(value);
		onChange(e, value);
	};

	const handleOnBlur = e => {
		const value = stripTagsEnable ? sanitizeXSS(e.currentTarget.value, null, true) : e.currentTarget.value;
		setTextareaValue(value);
		onBlur(e, value);
	};

	return (
		<textarea
			name={name}
			className={className}
			placeholder={placeholder}
			defaultValue={defaultValue}
			value={textareaValue || value}
			disabled={disabled}
			ref={customRef}
			onChange={handleOnChange}
			onFocus={e => onFocus(e, e.currentTarget.value)}
			onBlur={handleOnBlur}
			onKeyDown={e => onKeyDown(e, e.currentTarget.value)}
			autoFocus={autoFocus}
			autoComplete={autoComplete}
			style={style}
		></textarea>
	);
}
