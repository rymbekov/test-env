import React from 'react';
import cn from 'classnames';
import Icon from '../components/Icon';

class Select extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isOpen: false,
		};

		this.toggleVisibility = this.toggleVisibility.bind(this);
		this.onChoose = this.onChoose.bind(this);
		this.onBodyClick = this.onBodyClick.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(event) {
		this.props.onChange(event, event.target.value);
	}

	render() {
		let { value, options, className, icon, disabled } = this.props;

		// if no options => return
		if (options.length === 0) return null;

		value = value && options.some(n => n.value === value) ? value : options[0].value;
		return (
			<div className={cn('customSelect', { [className]: className, disabled: disabled, customSelectWithIcon: icon })}>
				{this.props.label && <div className="customSelect__label">{this.props.label}</div>}
				{icon && (
					<span className="customSelectIcon">
						<Icon name={cn({ [icon]: icon })} />
					</span>
				)}
				<select className="customSelect__select" value={value} onChange={this.handleChange}>
					{options.map((option, index) => (
						<option value={option.value} key={index} disabled={option.disabled}>
							{option.text}
						</option>
					))}
				</select>
			</div>
		);
	}

	onBodyClick() {
		this.setState({
			isOpen: false,
		});

		document.removeEventListener('click', this.onBodyClick);
	}

	toggleVisibility(e) {
		e.stopPropagation();

		this.setState({ isOpen: !this.state.isOpen }, () => {
			if (this.state.isOpen) {
				document.addEventListener('click', this.onBodyClick);
			} else {
				document.removeEventListener('click', this.onBodyClick);
			}
		});
	}

	onChoose(e, value) {
		e.stopPropagation();

		this.setState({
			isOpen: false,
		});

		document.removeEventListener('click', this.onBodyClick);

		this.props.onChange(e, value);
	}
}

export default Select;
