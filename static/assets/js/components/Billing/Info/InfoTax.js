import React, {
  Fragment, useState, useEffect, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@picsio/ui';
import _sortBy from 'lodash/sortBy';
import _find from 'lodash/find';
import _upperCase from 'lodash/upperCase';

import TaxOption from './TaxOption';
import taxIds from '../configs/taxIds.json';
import FlagIcon from '../../FlagIcon';

const sortedTaxIds = _sortBy(taxIds, 'country');
const emptyOption = { id: 'empty' };
const options = [emptyOption, ...sortedTaxIds];

const getHelperText = (example, error) => {
  if (error) {
    return error;
  }
  if (example) {
    const fullExampleLabel = `Example: ${example}`;

    return fullExampleLabel;
  }
  return '';
};

const InfoTax = (props) => {
  const {
    tax, error, changeCustomerTax, setError,
  } = props;

  const inputRef = useRef();
  const [selectedTax, setSelectedTax] = useState(emptyOption);
  const [value, setValue] = useState('');

  const {
    id, image, abbreviation, type, example,
  } = selectedTax;
  const helperText = getHelperText(example, error);
  const isDisabled = !id || id === 'empty';

  useEffect(() => {
    if (tax.length) {
      const [firstTax] = tax;
      const currentTax = _find(taxIds, { type: firstTax.type, abbreviation: firstTax.country });

      if (currentTax) {
        setSelectedTax(currentTax);
        setValue(firstTax.value);
      }
    }
  }, [tax]);

  const selectTax = (nextTax) => {
    setSelectedTax(nextTax);

    if (error) {
      setError('tax', null);
    }
  };

  const clearAll = () => {
    selectTax(emptyOption);
    setValue('');
    changeCustomerTax(null, example);
  };

  const handleChange = ({ target: { name, value: targetValue } }) => {
    if (name === 'id') {
      if (targetValue === 'empty') {
        clearAll();
      } else {
        const currentTax = _find(options, { id: targetValue });

        selectTax(currentTax);
        setValue('');
        setTimeout(() => {
          inputRef.current.focus();
        }, 50);
      }
    } else {
      setValue(targetValue);
    }
  };

  const handleBlurValue = ({ target }) => {
    changeCustomerTax({ type, value: target.value }, example);
  };

  const renderValue = () => {
    if (id !== 'empty') {
      const title = _upperCase(type);

      return [
        <Fragment key="value">
          <FlagIcon abbreviation={abbreviation} image={image} />
          {title}
        </Fragment>,
      ];
    }
    return 'Not selected';
  };

  return (
    <div className="pageTabsContentInfo__item pageTabsContentInfo__item--group pageTabsContentInfo__item--tax">
      <div className="pageTabsContentInfo__item__row">
        <TextField
          label="VAT ID"
          name="id"
          value={id}
          onChange={handleChange}
          select
          LabelProps={{
            id: 'tax-id',
          }}
          SelectProps={{
            labelId: 'tax-id',
            dataId: 'id',
            dataValue: 'type',
            options,
            optionComponent: TaxOption,
            placeholder: 'Select ID Type',
            renderValue,
          }}
        />
      </div>
      <div className="pageTabsContentInfo__item__row pageTabsContentInfo__item__row--value">
        <TextField
          inputRef={inputRef}
          name="value"
          value={value}
          onChange={handleChange}
          onBlur={handleBlurValue}
          helperText={helperText}
          error={!!error}
          disabled={isDisabled}
        />
      </div>
    </div>
  );
};

InfoTax.defaultProps = {
  tax: [],
  error: '',
};
InfoTax.propTypes = {
  tax: PropTypes.arrayOf(PropTypes.shape({
    country: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.string,
  })),
  error: PropTypes.string,
  changeCustomerTax: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
};

export default InfoTax;
