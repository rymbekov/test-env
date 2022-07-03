import React, { useCallback } from 'react';
import { Checkbox, IconButton } from '@picsio/ui';
import { Close } from '@picsio/ui/dist/icons';
import {
  bool, func, shape, string,
} from 'prop-types';

const FieldItem = ({
  field, fieldName, onChange, onRemove,
}) => {
  const handleChangeRequired = useCallback(() => {
    onChange({ fieldName, propName: 'required', value: !field.required });
  }, [field, onChange, fieldName]);

  const handleChangeShow = useCallback(() => {
    onChange({ fieldName, propName: 'show', value: !field.show });
  }, [field, onChange, fieldName]);

  const handleRemove = useCallback(() => onRemove(field), [field, onRemove]);

  return (
    <div className="settingsCheckboxesRow">
      <div className="settingsCheckboxesTitle">
        {field.title}
        {/* only for custom fields */}
        <If condition={field.type}>
          <IconButton size="xs" onClick={handleRemove}>
            <Close />
          </IconButton>
        </If>
      </div>
      <div className="settingsCheckboxesChange">
        <Checkbox
          checked={field.required}
          onChange={handleChangeRequired}
          disabled={!field.show}
        />
      </div>
      <div className="settingsCheckboxesShow">
        <Checkbox
          checked={field.show}
          onChange={handleChangeShow}
        />
      </div>
    </div>
  );
};

FieldItem.propTypes = {
  field: shape({
    title: string,
    show: bool,
    required: bool,
    type: string,
  }).isRequired,
  fieldName: string.isRequired,
  onChange: func.isRequired,
  onRemove: func.isRequired,
};

export default FieldItem;
