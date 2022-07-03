import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import '../styles/sort.scss';

export const ORDERS = {
  az: 'A-z',
  za: 'Z-a',
  custom: 'Custom',
};

const Sort = ({ order, onChange }) => {
  const handleSerOrder = (newOrder) => {
    if (newOrder !== order) onChange(newOrder);
  };

  return (
    <ul className="customFieldsSchemaSort customFieldsSchemaRow customFieldsOptions checkboxOption">
      <li className="label">Sort: </li>
      {Object.values(ORDERS).map((value) => (
        <li key={value}>
          <button
            className={cn({ active: order === value, disabled: value === ORDERS.custom })}
            onClick={() => handleSerOrder(value)}
            type="button"
          >
            {value}
          </button>
        </li>
      ))}
    </ul>
  );
};

Sort.propTypes = {
  order: PropTypes.oneOf([ORDERS.az, ORDERS.za, ORDERS.custom]).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Sort;
