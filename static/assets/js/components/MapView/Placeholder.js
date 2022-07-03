import React from 'react'; // eslint-disable-line
import cn from 'classnames';
import Icon from '../Icon';

/**
 * Class Placeholder
 * @param {Object} props
 * @param {string?} props.icon
 * @param {string} props.title
 * @param {string} props.text
 */
const Placeholder = ({ icon = 'globeEmpty', title, text }) => (
  <div className="geoPlaceholder">
    <div className="geoPlaceholderInner">
      <div className={cn('geoPlaceholderIcon')}>
        <Icon name={cn({ [icon]: icon })} />
      </div>
      {title && <div className="geoPlaceholderTitle">{title}</div>}
      {text && <div className="geoPlaceholderText">{text}</div>}
    </div>
  </div>
);

export default Placeholder;
