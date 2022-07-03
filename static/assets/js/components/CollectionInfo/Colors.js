import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Collapse } from '@picsio/ui';
import { CirclePicker } from 'react-color';
import cn from 'classnames';
import googleColorPalette from './configs/googleColorPalette';

const Colors = (props) => {
  const { isOpen, toggleCollapseVisibility, setColor, color, isBusy } = props;

  return (
    <Collapse
      fontSize="md"
      isOpen={isOpen}
      onClick={() => {
        toggleCollapseVisibility('color');
      }}
      title="Color"
      transition
    >
      <div className="PicsioCollapse__content--inner">
        <CirclePicker
          colors={googleColorPalette}
          onChange={setColor}
          className={cn({ isBusy })}
          color={{ source: 'hex', hex: color }}
        />
      </div>
    </Collapse>
  );
};

Colors.defaultProps = {
  isOpen: true,
  isBusy: false,
  color: 'nocolor'
};

Colors.propTypes = {
	color: PropTypes.string,
  isOpen: PropTypes.bool,
  isBusy: PropTypes.bool,
  toggleCollapseVisibility: PropTypes.func.isRequired,
	setColor: PropTypes.func.isRequired,
};

export default memo(Colors);
