import React from 'react';
import cn from 'classnames';
import './alert.scss';

const Alert = (props) => {
  const { color, children } = props;
  return <div className={cn('alert', { alertSuccess: color === 'success' })}>{children}</div>;
};

export default Alert;
