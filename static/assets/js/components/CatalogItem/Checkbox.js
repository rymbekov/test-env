import React, { memo } from 'react';
import { Checkbox } from '../../UIComponents';
import PropTypes from 'prop-types';

function CheckboxCatalogItem(props) {
  const { onClick, hasAccess, isSelected } = props;

  return (
    <div
      className="catalogItem__checkbox"
      style={{ zIndex: !hasAccess ? 7 : null }}
      onClick={onClick}
      onKeyPress={onClick}
      role="checkbox"
      aria-checked={isSelected}
      tabIndex="0"
    >
      {/* <span /> */}
      <Checkbox
        value={isSelected}
        onChange={() => {}}
      />
    </div>
  );
}

CheckboxCatalogItem.propTypes = {
  hasAccess: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default memo(CheckboxCatalogItem);
