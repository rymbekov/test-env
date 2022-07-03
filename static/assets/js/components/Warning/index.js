import React from 'react';
import cn from 'classnames';
import Icon from '../Icon';
import './styles.scss';

const classnamesTypes = {
  warning: 'warningComponentWarning',
  error: 'warningComponentError',
};

const classnamesSizes = {
  default: 'warningComponent',
  large: 'warningComponentLarge',
};

export default function Warning({
  icon = 'error',
  title,
  text,
  type = 'warning',
  size = 'default',
  className,
}) {
  const sizeClass = classnamesSizes[size];
  const typeClass = classnamesTypes[type];

  return (
    <div className={cn({
      [className]: Boolean(className),
      [sizeClass]: Boolean(sizeClass),
      [typeClass]: Boolean(typeClass),
    })}
    >
      <div className="warningIcon"><Icon name={icon} /></div>
      <div className="warningContent">
        {title && <div className="warningTitle">{title}</div>}
        {text && <div className="warningText">{text}</div>}
      </div>
    </div>
  );
}
