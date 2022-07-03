import React, { memo } from 'react';
import PropTypes from 'prop-types';

function Number(props) {
  const {
    number, width, name, fileExtension, isListViewMode,
  } = props;
  const style = {};
  if (!isListViewMode) {
    style.fontSize = `${width < 200 ? 63 : width < 300 ? 93 : 144}px`;
  }

  return [
    <i className="catalogItem__number" key={number} style={style}>
      {number}
    </i>,
    <If condition={!isListViewMode}>
      <div className="catalogItem__placeholder" key={name + (fileExtension || number)}>
        <span>
          {name}
        </span>
      </div>
    </If>,
  ];
}

Number.defaultProps = {
  fileExtension: null,
};

Number.propTypes = {
  fileExtension: PropTypes.string,
  isListViewMode: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  number: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
};

export default memo(Number);
