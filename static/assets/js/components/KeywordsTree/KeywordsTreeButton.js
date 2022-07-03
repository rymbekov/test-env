import React, { memo } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { IconButton } from '@picsio/ui';
import Tooltip from '../Tooltip';

const TreeButton = (props) => {
  const {
    onClick,
    tooltip,
    className,
    icon: ControlIcon,
  } = props;

  return (
    <Tooltip
      className={cn('treeButtonSmall', { [className]: className })}
      content={tooltip}
      placement="top"
    >
      <IconButton
        size="md"
        className="btnCollection"
        color="inherit"
        onClick={onClick}
      >
        <ControlIcon />
      </IconButton>
    </Tooltip>
  );
};

TreeButton.defaultProps = {
  className: '',
};

TreeButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  tooltip: PropTypes.string.isRequired,
  className: PropTypes.string,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
};

export default memo(TreeButton);
