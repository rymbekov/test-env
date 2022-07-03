import React, { memo } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import ColorsHelper from '../../helpers/colorsHelper';

const colors = ColorsHelper.colors.list;

function Color(props) {
  const { color, highlight, highlightAnimationReset } = props;

  const selectedColor = colors.find((colorItem) => colorItem.value === color) || {};

  return (
    <div
      className={cn('catalogItem__color', {
        showColorCatalogItem: color !== 'nocolor',
        highlightBlink: highlight,
      })}
      style={{ background: selectedColor.background }}
      onAnimationEnd={() => highlightAnimationReset('color')}
    />
  );
}

Color.defaultProps = {
  color: null,
};

Color.propTypes = {
  color: PropTypes.string,
  highlight: PropTypes.bool.isRequired,
  highlightAnimationReset: PropTypes.func.isRequired,
};

export default memo(Color);
