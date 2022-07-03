import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import dayjs from 'dayjs';
import DatePicker from 'react-datepicker';
import ua from '../../ua';

import Icon from '../Icon';
import {
  Input, Textarea, Select, InputDateRange, Checkbox,
} from '../../UIComponents';
import { datePickerPlaceholder, datePickerDateFormat } from '../../shared/dateLocale';
import Tooltip from '../Tooltip';

import { MultiSelect } from '../CustomFields';
import useCustomFieldSize from '../../helpers/components/hooks/useCustomFieldSize';

const isMobile = ua.browser.isNotDesktop();

const CustomField = (props) => {
  const {
    order,
    title,
    type,
    options,
    value,
    onChange,
    onRemove,
    disabled,
    multiple,
    isInputDateRange,
    showInput,
    required,
    error,
    position,
  } = props;
  const { getInputSize, saveInputSize } = useCustomFieldSize(title);
  const isError = !!error;
  const iconClick = required ? null : () => onRemove({ title });
  const iconTooltip = required ? 'Required fields' : null;
  const iconRender = (
    <Tooltip content={iconTooltip} placement="top">
      <i
        className={cn('removeCustomField', {
          inline: type === 'boolean' || !showInput,
          required,
        })}
        onClick={iconClick}
        role="presentation"
      >
        <Choose>
          <When condition={required}>
            <span>
              *
            </span>
          </When>
          <Otherwise>
            <Icon name="close" />
          </Otherwise>
        </Choose>
      </i>
    </Tooltip>
  );

  return (
    <div className="itemSearchFilters">
      <div className="labelItemSearchFilters">{title}</div>
      <If condition={showInput}>
        <div className="contentItemSearchFilters">
          {type === 'input' && (
            <Textarea
              value={value || ''}
              onChange={(e, val) => onChange(order, val)}
              disabled={disabled}
              error={isError}
              height={getInputSize()}
              defaultHeight={0}
              onResize={saveInputSize}
            />
          )}
          {type === 'int' && (
            <Input
              value={value || ''}
              type="number"
              onChange={(e, val) => onChange(order, val)}
              disabled={disabled}
              error={isError}
            />
          )}
          {type === 'enum' && (
            <Choose>
              <When condition={multiple}>
                <MultiSelect
                  className="customSelect"
                  value={value}
                  options={options}
                  onChange={(selected, selectFunc, config) => onChange(order, selected, config)}
                  disabled={disabled}
                  placement="top"
                  error={isError}
                  multipleAttach
                  required={required}
                  position={position}
                />
              </When>
              <Otherwise>
                <Select
                  value={value}
                  options={options.map((option, index) => ({
                    value: index,
                    text: option,
                  }))}
                  onChange={(e, val) => onChange(order, Number(val))}
                  disabled={disabled}
                  error={isError}
                />
              </Otherwise>
            </Choose>
          )}
          {type === 'date'
            && (
              <Choose>
                <When condition={isInputDateRange}>
                  <InputDateRange value={value || 'any'} onChange={(val) => onChange(order, val)} disabled={disabled} />
                </When>
                <When condition={isMobile}>
                  <Input
                    isDefault
                    type="date"
                    placeholder="mm/dd/yyyy"
                    value={value}
                    onChange={(e, val) => onChange(order, dayjs(val).isValid() ? dayjs(val).format('YYYY-MM-DD') : val)}
                    error={isError}
                    disabled={disabled}
                  />
                </When>
                <Otherwise>
                  <DatePicker
                    className={cn({ error: isError })}
                    selected={value ? dayjs(value).toDate() : ''}
                    onChange={(val) => onChange(order, dayjs(val).isValid() ? dayjs(val).format('YYYY-MM-DD') : val)}
                    popperClassName="some-custom-class"
                    popperPlacement="top-start"
                    popperModifiers={{
                      offset: {
                        enabled: true,
                        offset: '5px, 10px',
                      },
                      preventOverflow: {
                        enabled: true,
                        escapeWithReference: false, // force popper to stay in viewport (even when input is scrolled out of view)
                        boundariesElement: 'scrollParent',
                      },
                    }}
                    placeholderText={datePickerPlaceholder}
                    dateFormat={datePickerDateFormat}
                    disabled={disabled}
                  />
                </Otherwise>
              </Choose>
            )}
          {type === 'boolean' && (
            <Checkbox
              onChange={() => onChange(order, !value)}
              value={value}
              error={isError}
              disabled={disabled}
            />
          )}
          {(required || onRemove) && iconRender}
        </div>
      </If>
      <If condition={!showInput}>
        {iconRender}
      </If>
    </div>
  );
};

CustomField.defaultProps = {
  order: null,
  type: null,
  value: '',
  onChange: null,
  options: [],
  isInputDateRange: false,
  showInput: true,
  required: false,
  onRemove: null,
  disabled: false,
  multiple: false,
  error: null,
};
CustomField.propTypes = {
  order: PropTypes.number,
  title: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.any,
  options: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
  isInputDateRange: PropTypes.bool,
  showInput: PropTypes.bool,
  required: PropTypes.bool,
  onRemove: PropTypes.func,
  disabled: PropTypes.bool,
  multiple: PropTypes.bool,
  error: PropTypes.string,
};

export default CustomField;
