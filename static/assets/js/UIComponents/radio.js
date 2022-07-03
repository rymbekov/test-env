import React from 'react';
import Icon from '../components/Icon';
import sanitizeXSS from '../shared/sanitizeXSS';

export default class Radio extends React.Component {
	render() {
		let { label, value = false, disabled = false, onChange = Function.prototype, icon } = this.props;
		let className = `UIRadio ${value ? 'UIRadio--checked' : ''} ${disabled ? 'UIRadio--disabled' : ''}`;

		return (
			<div
				className={`${className}`}
				onClick={e => {
					!disabled && onChange(e, !value);
				}}
			>
				<span className="UIRadio__input" />
				{label && (
					<React.Fragment>
						{icon && (
							<span className="UIRadio__icon">
								<Icon name={icon} />
							</span>
						)}
						<span className="UIRadio__label" dangerouslySetInnerHTML={{ __html: sanitizeXSS(label) }} />
					</React.Fragment>
				)}
			</div>
		);
	}
}
