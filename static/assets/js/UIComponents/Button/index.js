import React from 'react';
import cn from 'classnames';
import Icon from '../../components/Icon';
import './styles.scss';

/**
 * Button
 * @param {Object} props
 * @param {String} props.id
 * @param {JSX} props.children
 * @param {String} props.className
 * @param {String} props.icon
 * @param {Boolean} props.disabled
 * @param {Function} props.onClick
 * @param {String} props.type
 * @returns {JSX}
 */
export default function Button({ id, children, className, icon, disabled, onClick, type = 'button' }) {
	return (
		<button
			id={id}
			className={cn('button', { [className]: className })}
			type={type}
			disabled={disabled}
			onClick={onClick}
		>
			{icon && <Icon name={icon} />}
			{children && <span className="buttonText">{children}</span>}
		</button>
	);
}
