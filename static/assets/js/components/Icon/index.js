import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'classnames';
import Tooltip from '../Tooltip';

import Icons from './icons';

const Icon = ({ className, name, tooltipText, tooltipPositon, style, ...other }) => {
  const iconPath = Icons.path[name] || Icons.path.circle;
  const iconViewBox = Icons.viewBox[name] || '0 0 32 32';

  const attributes = { ...other };

  attributes.className = clsx(className, 'svg-icon', 'icon', `icon-${name}`);
  attributes.viewBox = iconViewBox;
  attributes.style = {
    ...style,
  };

  if (iconPath) {
    const paths = iconPath.map((path, index) =>
      React.createElement('path', {
        d: path,
        key: `${path}${index + 1}`,
      })
    );
    if (tooltipText) {
      return (
        <Tooltip content={tooltipText} placement={tooltipPositon || 'top'}>
          {React.createElement('svg', attributes, paths)}
        </Tooltip>
      );
    }
    return React.createElement('svg', attributes, paths);
  }
  return <svg>***</svg>;
};

Icon.defaultProps = {
  style: {},
  className: '',
  name: '',
  tooltipText: '',
  tooltipPositon: '',
};
Icon.propTypes = {
  style: PropTypes.objectOf(PropTypes.any),
  className: PropTypes.string,
  name: PropTypes.string,
  tooltipText: PropTypes.string,
  tooltipPositon: PropTypes.string,
};

export default Icon;
