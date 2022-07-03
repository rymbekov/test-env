import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  arrayOf, bool, shape, string,
} from 'prop-types';
import {
  addCustomField, removeCustomField, changeField, changeCustomField,
} from '../../../store/inboxes/actions';
import FieldItem from './FieldItem';
import CustomFieldsSelector from '../../CustomFieldsSelector';

const FieldsSettings = ({ inbox }) => {
  const dispatch = useDispatch();

  const handleChangeField = useCallback(
    ({ fieldName, propName, value }) => {
      dispatch(changeField({
        inboxId: inbox._id, fieldName, propName, value,
      }));
    },
    [dispatch, inbox._id],
  );

  const handleChangeCustomField = useCallback(
    ({ fieldName, propName, value }) => {
      dispatch(changeCustomField({
        inboxId: inbox._id, fieldTitle: fieldName, propName, value,
      }));
    },
    [dispatch, inbox._id],
  );

  const handleAddCustomField = useCallback((customField) => {
    dispatch(addCustomField({ inboxId: inbox._id, customField }));
  }, [dispatch, inbox._id]);

  const handleRemoveField = useCallback(({ title }) => {
    dispatch(removeCustomField({ inboxId: inbox._id, title }));
  }, [dispatch, inbox._id]);

  const renderSetting = useCallback(
    (setting, fieldName) => {
      /** in the custom fields "propName" will be number (index in the array) */
      const isBaseField = typeof fieldName === 'string';
      const key = isBaseField ? fieldName : setting.title;
      return (
        <FieldItem
          key={key}
          fieldName={key}
          field={setting}
          onChange={isBaseField ? handleChangeField : handleChangeCustomField}
          onRemove={handleRemoveField}
        />
      );
    },
    [handleRemoveField, handleChangeCustomField, handleChangeField],
  );

  return (
    <div className="sharingSettingsBlock">
      <div className="sharingSettingsHeading">Required fields for upload</div>
      <div className="settingsCheckboxes">
        <div className="settingsCheckboxesRow settingsCheckboxesHead">
          <div className="settingsCheckboxesChange">Required</div>
          <div className="settingsCheckboxesShow">Show</div>
        </div>
        {Object.keys(inbox.fields || {}).map((key) => {
          const setting = inbox.fields[key];
          if (Array.isArray(setting)) return setting.map(renderSetting);

          return renderSetting(setting, key);
        })}
      </div>

      <If condition={inbox.fields?.customFields}>
        <CustomFieldsSelector
          className="settingsCustomFields"
          title="Select custom fields"
          label="Select custom fields"
          selectedFields={inbox.fields.customFields}
          addField={handleAddCustomField}
          removeField={handleRemoveField}
          autoFocus
          disablePortal
          eventName="InboxSettingsRequiredFieldsSelectCustomFieldsClicked"
        />
      </If>
    </div>
  );
};

const fieldShape = shape({
  show: bool.isRequired,
  required: bool.isRequired,
  title: string.isRequired,
});

const customFieldShape = shape({
  _id: string,
  type: string,
  show: bool,
  required: bool,
  title: string,
});

FieldsSettings.propTypes = {
  inbox: shape({
    _id: string,
    fields: shape({
      comment: fieldShape,
      titleAndDescription: fieldShape,
      flag: fieldShape,
      rating: fieldShape,
      color: fieldShape,
      customFields: arrayOf(customFieldShape),
    }),
  }).isRequired,
};

export default FieldsSettings;
