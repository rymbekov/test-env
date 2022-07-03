import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { useDispatch } from 'react-redux';
import ColorsHelper from '../../helpers/colorsHelper';
import Logger from '../../services/Logger';
import { changeColor } from '../../store/actions/assets';

const colors = ColorsHelper.colors.list;

function Colors(props) {
  const dispatch = useDispatch();
  const { color, assetId, disabled } = props;
  const [showDrop, setShowDrop] = useState(false);

  const handleChange = (value) => {
    if (!disabled) {
      dispatch(changeColor([assetId], value));
    }
    setShowDrop(false);
  };

  const colorText = color === 'nocolor' ? 'color' : color;

  return (
    <div className="catalogItem__colors">
      <span
        className={cn('catalogItem__colors-opener', { noColor: color === 'nocolor' })}
        onClick={() => {
          const loggerText = showDrop ? 'Close' : 'Open';
          Logger.log('User', `ThumbnailColors${loggerText}`);
          !disabled && setShowDrop(!showDrop);
        }}
        style={{
          background: colors.find((colorItem) => colorItem.value === color).background,
          color: ['yellow', 'green'].includes(color) ? '#000' : '#fff',
        }}
      >
        {colorText}
      </span>
      <If condition={showDrop}>
        <div className="catalogItem__colors-list">
          {colors.map((colorItem, index) => (
            <div
              className={cn('catalogItem__colors-color', { act: colorItem.value === color })}
              key={index}
              style={{ background: colorItem.background }}
              data-color={colorItem.value}
              onClick={() => handleChange(colorItem.value)}
            >
              <If condition={colorItem.value === 'nocolor'}>none</If>
            </div>
          ))}
        </div>
      </If>
    </div>
  );
}

Colors.propTypes = {
  assetId: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default memo(Colors);
