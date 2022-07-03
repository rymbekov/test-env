import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import InputWithStripTags from './InputWithStripTags';
import ua from '../ua';
import Icon from '../components/Icon';

export default function Input({
	name = '',
	value,
	label,
	placeholder = '',
	type = 'text',
	className = '',
	onChange = Function.prototype,
	onFocus = Function.prototype,
	onBlur = Function.prototype,
	onKeyDown = Function.prototype,
	onPaste = Function.prototype,
	defaultValue,
	error,
	disabled = false,
	customRef = React.createRef(),
	autoFocus = false,
	description,
	autoComplete = 'false',
	isDefault = false,
	stripTagsEnable = true,
	dataName,
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

	const [isPasswordShow, setPasswordShow] = useState(false);

	const togglePasswordShow = () => {
		setPasswordShow(!isPasswordShow);
	};

	useEffect(() => {
		if (autoFocus === true) {
			customRef.current && customRef.current.focus()
		};
	}, [autoFocus]);

	let passwordType = 'password';
	if (type === 'password') {
		passwordType = isPasswordShow ? 'text' : 'password';
	}

	if (isDefault === true) {
		return (
			<InputWithStripTags
				type={type === 'password' ? passwordType : type}
				name={name}
				placeholder={placeholder}
				defaultValue={defaultValue}
				value={value}
				disabled={disabled}
				customRef={customRef}
				onChange={onChange}
				onFocus={onFocus}
				onBlur={onBlur}
				onPaste={onPaste}
				onKeyDown={onKeyDown}
				autoFocus={autoFocus}
				autoComplete={autoComplete}
				stripTagsEnable={stripTagsEnable}
				dataName={dataName}
				dataTestId={dataTestId}
			/>
		);
	}

	return (
		<div className={`UIInput ${className} ${error ? 'UIInput--error' : ''}`}>
			{label && <div className="UIInput__label">{label}</div>}
			<div className="UIInput__input">
				<InputWithStripTags
					type={type === 'password' ? passwordType : type}
					name={name}
					placeholder={placeholder}
					defaultValue={defaultValue}
					value={value}
					disabled={disabled}
					customRef={customRef}
					onChange={onChange}
					onFocus={onFocus}
					onBlur={onBlur}
					onKeyDown={onKeyDown}
					autoFocus={autoFocus}
					autoComplete={autoComplete}
					stripTagsEnable={stripTagsEnable}
					dataName={dataName}
					onPaste={onPaste}
					dataTestId={dataTestId}
				/>
				{type === 'password' && (
					<div className="UIInput__input__button" role="button" onClick={togglePasswordShow}>
						<Icon name="clearEye" />
					</div>
				)}
			</div>
			<If condition={error && typeof error === 'string'}>
				<div className="UIInput__error">{error}</div>
			</If>
			{description && <div className="UIInputDescription">{description}</div>}
		</div>
	);
}
