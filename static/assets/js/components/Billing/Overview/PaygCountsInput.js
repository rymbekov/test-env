import React from 'react';
import PropTypes from 'prop-types';
import { Input, InputLabel } from '@picsio/ui';
import Logger from '../../../services/Logger';

const PayGCountsInput = (props) => {
  const { label, name, value, onChange, min } = props;
  const id = `${name}Input`;

  const decrement = (e) => {
    e.stopPropagation();
    const nextValue = +value - 1;
    Logger.log('User', 'PaygCountsDecrement', { name, value: nextValue < min ? min : nextValue });

    onChange({ target: { name, value: nextValue < min ? min : nextValue, min } });
  };
  const increment = (e) => {
    e.stopPropagation();
    const nextValue = +value + 1;
    Logger.log('User', 'PaygCountsIncrement', { name, value: nextValue < min ? min : nextValue });

    onChange({ target: { name, value: nextValue < min ? min : nextValue, min } });
  };
  const handleBlur = ({ target }) => {
    Logger.log('User', 'PaygCountsInputBlur', { name, value: min });
    if (+target.value < min) {
      onChange({ target: { name, value: min, min } });
    }
  };

  return (
    <div className="paygCounts__input">
      <div className="paygCounts__input__wrapper">
        <button className="paygCounts__input__action decrement" onClick={decrement} type="button">-</button>
        <Input type="number" id={id} name={name} value={value} onChange={onChange} onBlur={handleBlur} inputProps={{ min }} />
        <button className="paygCounts__input__action increment" onClick={increment} type="button">+</button>
      </div>
      <div className="paygCounts__input__label">
        <InputLabel htmlFor={id}>{label}</InputLabel>
      </div>
    </div>
  );
}

PayGCountsInput.defaultProps = {
  value: '',
  min: 0,
};
PayGCountsInput.propTypes = {
  label: PropTypes.node.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
};

export default PayGCountsInput;
