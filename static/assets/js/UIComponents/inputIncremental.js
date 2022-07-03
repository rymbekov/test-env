import React from 'react';
import PropTypes from 'prop-types';

export default class InputIncremental extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			focus: false,
		};

		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.onChange = this.onChange.bind(this);
		this.handleKeyDown = this.handleKeyDown.bind(this);
	}

	/**
	 * Handle keydown on input
	 * @param {KeyboardEvent} event
	 */
	handleKeyDown(event) {
		const { value, min, max } = this.props;
		const keyCode = event.keyCode;

		const isBackspace = keyCode === 8;
		const isNumber = keyCode >= 48 && keyCode <= 57;
		const isLeftArr = keyCode === 37;
		const isRightArr = keyCode === 39;
		const isArrowUp = keyCode === 38;
		const isArrowDown = keyCode === 40;

		if (isArrowUp) {
			const newValue = +value + 1;
			if (newValue <= max) {
				this.onChange(event, newValue);
			}
		}
		if (isArrowDown) {
			const newValue = +value - 1;
			if (newValue >= min) {
				this.onChange(event, newValue);
			}
		}

		if (!isBackspace && !isNumber && !isLeftArr && !isRightArr) {
			event.preventDefault();
		}
	}

	/**
	 * On input focus
	 * @param {Event} event
	 */
	onFocus(event) {
		this.setState({ focus: true });
		this.props.onFocus(event);
	}

	/**
	 * On input blur
	 * @param {Event} event
	 */
	onBlur(event) {
		const { min, max } = this.props;
		let value = Number(this.props.value);

		if (isNaN(value)) value = min;

		if (value < min) value = min;
		if (value > max) value = max;

		this.setState({ focus: false });
		this.props.onChange(event, value);
		this.props.onBlur(event);
	}

	/**
	 * On value change
	 * @param {Event} event
	 * @param {number} newValue
	 */
	onChange(event, newValue) {
		this.props.onChange(event, newValue);
	}

	render() {
		let { label, className, value, disableSubmitButtons, disabled } = this.props;

		return (
			<div
				className={`UIInputIncremental ${className} ${this.state.focus ? 'UIInputIncremental--focus' : ''} ${
					disabled ? 'UIInputIncremental__disabled' : ''
				}`}
			>
				<div className="UIInputIncremental__input">
					<input
						type="text"
						value={value}
						onBlur={this.onBlur}
						onFocus={this.onFocus}
						onKeyDown={this.handleKeyDown}
						onChange={e => this.onChange(e, +e.currentTarget.value)}
						disabled={disabled}
					/>
					{!disableSubmitButtons && (
						<div className="UIInputIncremental__buttons">
							<span className="UIInputIncremental__inc" onClick={e => this.onChange(e, +value + 1)}>
								+
							</span>
							<span className="UIInputIncremental__dec" onClick={e => this.onChange(e, +value - 1)}>
								-
							</span>
						</div>
					)}
				</div>
				{label && <div className="UIInputIncremental__label">{label}</div>}
			</div>
		);
	}
}

/** Prop types */
InputIncremental.propTypes = {
	label: PropTypes.string,
	className: PropTypes.string,
	onChange: PropTypes.func,
	value: PropTypes.number,
	disableSubmitButtons: PropTypes.bool,
	onFocus: PropTypes.func,
	onBlur: PropTypes.func,
	min: PropTypes.number,
	max: PropTypes.number,
	disabled: PropTypes.bool,
};

/** Default props */
InputIncremental.defaultProps = {
	className: '',
	onChange: Function.prototype,
	value: 0,
	disableSubmitButtons: false,
	onFocus: Function.prototype,
	onBlur: Function.prototype,
	min: Number.NEGATIVE_INFINITY,
	max: Number.POSITIVE_INFINITY,
	disabled: false,
};
