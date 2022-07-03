import React from 'react';
import PropTypes from 'prop-types';
import Input from './input';
import cn from 'classnames';

class Autocomplete extends React.Component {
	state = {
		isDropVisible: false,
		filteredItems: [],
		value: this.props.value || '',
		activeDropIndex: -1,
		items: [],
	};

	tempValue = '';

	UNSAFE_componentWillReceiveProps(props) {
		if (this.props.value !== props.value) {
			this.setState({ value: props.value });
		}
	}

	onFocus = () => {
		const items = this.props.getItems();
		this.setState({ items });

		this.showDropdown();
	};

	onBlur = () => {
		this.hideDropdown();
		this.setState({ items: [] });
		this.props.onChange(this.state.value);
	};

	showDropdown = (newState = {}) => {
		const value = newState.value || this.state.value;

		const { items } = this.state;
		const filteredItems = [];

		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			item.toLowerCase().includes(value.toLowerCase()) && filteredItems.push(item);
			if (filteredItems.length >= 50) {
				break;
			}
		}

		filteredItems.sort((a, b) => {
			return a.toLowerCase().indexOf(value.toLowerCase()) - b.toLowerCase().indexOf(value.toLowerCase());
		});

		this.setState({
			isDropVisible: true,
			activeDropIndex: -1,
			filteredItems,
			...newState,
		});
	};

	hideDropdown = (newState = {}) => {
		this.setState({
			...{ isDropVisible: false, activeDropIndex: -1 },
			...newState,
		});
		this.$drop.scrollTop = 0;
	};

	onKeyDown = event => {
		const { keyCode } = event;
		const { value, activeDropIndex, filteredItems } = this.state;
		switch (keyCode) {
			case 13: {
				// Enter
				if (activeDropIndex === -1) {
					this.props.onSubmit(value);
				} else {
					this.tempValue = value;
					this.props.onChange(value);
				}
				this.hideDropdown();
				break;
			}
			case 27: {
				// Esc
				this.hideDropdown({ value: this.tempValue });
				break;
			}
			case 32: {
				// Space
				if (event.ctrlKey) {
					event.preventDefault();
					this.showDropdown();
				}
				break;
			}
			case 40: {
				// arrow down
				event.preventDefault();
				if (activeDropIndex + 1 < filteredItems.length) {
					const newIndex = activeDropIndex + 1;
					this.setState({
						activeDropIndex: newIndex,
						value: filteredItems[newIndex] ? `keywords:"${filteredItems[newIndex]}"` : this.tempValue,
					});

					// scroll to item
					const dropRect = this.$drop.getBoundingClientRect();
					const dropBottom = dropRect.top + dropRect.height;
					const dropScrollTop = this.$drop.scrollTop;

					const itemRect = this.$drop.querySelectorAll('li')[newIndex].getBoundingClientRect();
					const itemBottom = itemRect.top + itemRect.height;

					if (itemBottom > dropBottom - dropScrollTop) {
						this.$drop.scrollTop = dropScrollTop + itemRect.height;
					}
				}
				break;
			}
			case 38: {
				// arrow up
				event.preventDefault();
				if (activeDropIndex > -1) {
					const newIndex = activeDropIndex - 1;
					this.setState({
						activeDropIndex: newIndex,
						value: filteredItems[newIndex] ? `keywords:"${filteredItems[newIndex]}"` : this.tempValue,
					});

					// scroll to item
					if (newIndex > -1) {
						const dropRect = this.$drop.getBoundingClientRect();
						const dropScrollTop = this.$drop.scrollTop;

						const itemRect = this.$drop.querySelectorAll('li')[newIndex].getBoundingClientRect();

						if (itemRect.top < dropRect.top) {
							this.$drop.scrollTop = dropScrollTop - itemRect.height;
						}
					}
				}
				break;
			}
		}
	};

	handleInputChange = event => {
		const { value } = event.target;
		this.tempValue = value;
		this.setState({ value }, this.showDropdown);
	};

	/**
	 * Select suggestion
	 * @param {string} _value - suggestion text
	 */
	onClickDropItem = _value => {
		const value = `keywords:"${_value}"`;
		this.tempValue = value;
		this.props.onChange(value);
		this.hideDropdown({ value });
	};

	bindDrop = node => (this.$drop = node);

	render() {
		const { className, error, label, placeholder, defaultValue, disabled, customRef, onKeyUp } = this.props;

		const { isDropVisible, filteredItems, value, activeDropIndex } = this.state;

		return (
			<div
				className={cn('UIInput UIAutocomplete', className, {
					'UIInput--error': error,
				})}
			>
				{label && <div className="UIInput__label">{label}</div>}
				<Input
					isDefault={true}
					type="text"
					placeholder={placeholder}
					defaultValue={defaultValue}
					autoComplete="off"
					value={value}
					disabled={disabled}
					customRef={customRef}
					onChange={this.handleInputChange}
					onFocus={this.onFocus}
					onBlur={this.onBlur}
					onKeyDown={this.onKeyDown}
					onKeyUp={e => onKeyUp(e, e.currentTarget.value)}
				/>
				{error && <div className="UIInput__error">{error}</div>}
				<ul
					ref={this.bindDrop}
					className={cn('UIAutocomplete__dropdown', {
						active: isDropVisible && filteredItems.length > 0 && value.length > 0,
					})}
				>
					{filteredItems.map((item, index) => (
						<li
							key={item}
							className={cn({ active: activeDropIndex === index })}
							onClick={() => this.onClickDropItem(item)}
						>
							<span
								dangerouslySetInnerHTML={{
									__html: item.replace(
										new RegExp(this.tempValue.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'ig'),
										'<mark>$&</mark>'
									),
								}}
							/>
						</li>
					))}
				</ul>
			</div>
		);
	}
}

Autocomplete.propTypes = {
	value: PropTypes.string,
	getItems: PropTypes.func,
	className: PropTypes.string,
	error: PropTypes.string,
	label: PropTypes.string,
	placeholder: PropTypes.string,
	defaultValue: PropTypes.string,
	disabled: PropTypes.bool,
	customRef: PropTypes.func,
	onChange: PropTypes.func,
	onFocus: PropTypes.func,
	onBlur: PropTypes.func,
	onKeyDown: PropTypes.func,
	onKeyUp: PropTypes.func,
	onSubmit: PropTypes.func,
};

Autocomplete.defaultProps = {
	value: '',
	getItems: Function.prototype,
	placeholder: '',
	label: null,
	error: '',
	disabled: false,
	customRef: null,
	onChange: Function.prototype,
	onFocus: Function.prototype,
	onBlur: Function.prototype,
	onKeyDown: Function.prototype,
	onKeyUp: Function.prototype,
	onSubmit: Function.prototype,
};

export default Autocomplete;
