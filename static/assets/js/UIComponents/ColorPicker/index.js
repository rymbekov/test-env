import React, { useState } from 'react';
import { ChromePicker } from 'react-color';
import cn from 'classnames';
import Opener from '../../components/Opener';
import Input from '../input'; // eslint-disable-line
import './styles.scss';

/**
 * ColorPicker
 * @param {Object} props
 * @param {String} props.initialColor
 * @param {Function} props.onColorChangeComplete
 * @param {Boolean} props.disabled
 * @returns {JSX}
 */
export default function ColorPicker({ initialColor, onColorChangeComplete, disabled }) {
  const [color, setColor] = useState(initialColor || '#fff');
  const [isColorPickerOpen, setColorPickerOpen] = useState(false);

  const handleColorChange = (color) => {
    setColor(color.hex);
  };

  const handleColorBlur = () => {
    onColorChangeComplete(color);
  };

  const handleColorChangeComplete = (color) => {
    onColorChangeComplete(color.hex);
  };

  return (
    <div className={cn('colorPicker', { isColorPickerOpen, isDisabled: disabled })}>
      <Input value={color} onChange={(e, value) => handleColorChange({ hex: value })} onBlur={handleColorBlur} />
      <div className="colorPickerValue" style={{ backgroundColor: color }} />
      <Opener
        hideOnClickOutside
        openerText="Open colorPicker"
        hideOpenerWhenOpen={false}
        parentHandler={setColorPickerOpen}
        additionalClassName="openerLink"
      >
        <span>
          <ChromePicker
            color={color}
            onChange={handleColorChange}
            onChangeComplete={handleColorChangeComplete}
            disableAlpha
          />
        </span>
      </Opener>
    </div>
  );
}
