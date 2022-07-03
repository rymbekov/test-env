import React from 'react';
import { object, func, array, bool, string, arrayOf } from 'prop-types';
import cn from 'classnames';
import isEqual from 'lodash.isequal';
import sortBy from 'lodash.sortby';
import uniq from 'lodash.uniq';

/** Store */
import { Provider, connect } from 'react-redux';
import store from '../../../../store';
import { LocalStorage } from '../../../../shared/utils';

/** Components */
import { Date, Input, Int, Boolean, Enum, MultiSelect } from '../../../CustomFields';
import Logger from '../../../../services/Logger';
import Separator from './Separator';
import ModifiedField from '../ModifiedField';

class CustomFields extends React.Component {
  /** prop types */
  static propTypes = {
    detailsPanelVisibility: object,
    allCustomFields: array,
    selectedAssetsIds: arrayOf(string),
    customFieldsEditable: bool,
    collection: array,
    isMainApp: bool,
    inProgress: bool,
    toggleVisibility: func,
    onChange: func,
    disabled: bool,
    inProgressItems: arrayOf(string),
  };

  constructor(props) {
    super(props);
    this.state = { customFieldGroups: this.makeGroups(props) };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { props } = this;
    const changes = {};
    if (
      !isEqual(nextProps.selectedAssetsIds, props.selectedAssetsIds) ||
      nextProps.allCustomFields !== props.allCustomFields ||
      // (!nextProps.inProgress && props.inProgress) ||
      nextProps.metadating !== props.metadating ||
      nextProps.collection !== props.collection
    ) {
      changes.customFieldGroups = this.makeGroups(nextProps);
    }

    this.setState(changes);
  }

  makeGroups = (props) => {
    const customFieldsMap = {};
    /** fill customFieldsMap */
    props.allCustomFields.forEach(
      // customField => (customFieldsMap[customField.title] = Object.clone(customField, true))
      (customField) => (customFieldsMap[customField.title] = { ...customField })
    );

    /** add values and count for customFieldsMap items */
    props.collection.forEach((model) => {
      const { meta } = model;

      for (const key in meta) {
        if (!customFieldsMap[key]) continue;
        /** increase count */
        customFieldsMap[key].count = customFieldsMap[key].count
          ? customFieldsMap[key].count + 1
          : 1;
        /** update values */
        customFieldsMap[key].values
          ? customFieldsMap[key].values.push(meta[key])
          : (customFieldsMap[key].values = [meta[key]]);
      }
    });

    const customFields = sortBy(props.allCustomFields, ['order']).map(
      (customField) => customFieldsMap[customField.title],
      );

    /** create groups */
    const groups = customFields.reduce((acc, value) => {
      if (value.type === 'separator') {
        acc.push([value]);
      } else {
        // if first customField is not of type 'separator' - we are creating fake group with title "Custom fields"
        if (!acc.length) {
          acc.push([{ type: 'separator', title: 'Custom fields', visibility: 'visible' }]);
        }
        acc[acc.length - 1].push(value);
      }
      return acc;
    }, []);

    return groups;
  };

  handleChange = (value, customField, onCancel = Function.prototype, config) => {
    const { props } = this;
    Logger.log('User', 'InfoPanelChangeField', customField.title);
    let focusedInput = null;
    /** save next focused input to variable */
    setTimeout(() => (focusedInput = document.querySelector('input:focus')), 0);

    props.onChange({
      ids: props.selectedAssetsIds,
      title: customField.title,
      type: customField.type,
      visibility: customField.visibility || 'visible',
      value,
      onCancel,
      multiple: customField.multiple,
      isAttach: config?.isAttach,
    });
    /** return focus to input */
    if (focusedInput) focusedInput.focus();
  };

  saveInputSize = (name, height) => {
    const { userId } = this.props;
    const sizes = LocalStorage.get('picsioCustomFieldsSize') || {};
    const userSizes = sizes[userId] || {};
    const updatedSizes = {
      ...sizes,
      [userId]: {
        ...userSizes,
        [name]: height,
      },
    };

    LocalStorage.set('picsioCustomFieldsSize', updatedSizes);
  };

  getInputSize = (name) => {
    const { userId } = this.props;
    const sizes = LocalStorage.get('picsioCustomFieldsSize') || {};
    const userSizes = sizes[userId] || {};

    return userSizes[name] || null;
  };

  renderField = (customField) => {
    const {
      visibility,
      title,
      type,
      values = [],
      pattern,
      patternDescription,
      options,
    } = customField;
    const isProofing = !this.props.isMainApp;
    const uniqueValues = uniq(values);
    const val = uniqueValues.length === 1 ? uniqueValues[0] : '';
    const valuePresent = uniqueValues.find((value) => value);
    const value = this.props.selectedAssetsIds.length ? val : '';
    const modifiedField = this.props.modifiedFields[title];
    /** visibility is `hidden` OR `hidden while empty` && value is empty */
    if (
      visibility === 'hidden' ||
      (!value && !valuePresent && customField.visibility === 'hidden_while_empty')
    ) {
      return null;
    }

    const disabled =
      isProofing ||
      this.props.disabled ||
      !this.props.customFieldsEditable ||
      (customField.default && !customField.writable);
    const textPlaceholder = isProofing
      ? ''
      : this.props.selectedAssetsIds.length > 1
      ? 'Multiple selection'
      : disabled
      ? ''
      : 'Input new value';

    switch (type) {
      case 'separator': {
        return (
          <Separator
            key={title}
            toggleVisibility={this.props.toggleVisibility}
            title={title}
            isMainApp={this.props.isMainApp}
            customFieldsAllowed={this.props.customFieldsAllowed}
          />
        );
      }

      case 'boolean': {
        return (
          <div
            key={title}
            className={cn('customFieldBooleanWithModifiedField', {
              customFieldWithIcon: modifiedField,
            })}
          >
            <Boolean
              value={!!value}
              title={title}
              disabled={disabled}
              onChange={(value) => this.handleChange(value, customField)}
            />
            {modifiedField && <ModifiedField field={modifiedField} />}
          </div>
        );
      }

      case 'date': {
        return (
          <div
            key={title}
            className={cn({
              customFieldWithIcon: modifiedField,
            })}
          >
            <Date
              value={value}
              customField={customField}
              disabled={disabled}
              onChange={this.handleChange}
            />
            {modifiedField && <ModifiedField field={modifiedField} />}
          </div>
        );
      }

      case 'int': {
        return (
          <div
            key={title}
            className={cn({
              customFieldWithIcon: modifiedField,
            })}
          >
            <Int
              customField={customField}
              onChange={this.handleChange}
              disabled={disabled}
              value={value}
              textPlaceholder={textPlaceholder}
              pattern={pattern}
              patternDescription={patternDescription}
            />
            {modifiedField && <ModifiedField field={modifiedField} />}
          </div>
        );
      }

      case 'input': {
        const inputHeight = this.getInputSize(title);

        return (
          <div
            key={title}
            className={cn('customInputField', {
              customFieldWithIcon: modifiedField,
            })}
          >
            <Input
              customField={customField}
              disabled={disabled}
              value={value}
              onChange={this.handleChange}
              textPlaceholder={textPlaceholder}
              pattern={pattern}
              patternDescription={patternDescription}
              onResize={(height) => this.saveInputSize(title, height)}
              height={inputHeight}
            />
            {modifiedField && <ModifiedField field={modifiedField} />}
          </div>
        );
      }

      case 'enum': {
        if (customField.multiple) {
          const mergedValues =
            values.length > 1 ? uniq(values.join(',').split(',')).join(',') : values[0];

          return (
            <MultiSelect
              key={title}
              title={title}
              value={mergedValues}
              options={options}
              onChange={(selected, onCancel, isAttach) =>
                this.handleChange(selected, customField, onCancel, isAttach)
              }
              modifiedField={modifiedField}
              disabled={disabled}
              inProgress={this.props.inProgressItems.includes(title)}
            />
          );
        }
        return (
          <div
            key={title}
            className={cn('customFieldSelectWithModifiedField', {
              customFieldWithIcon: modifiedField,
            })}
          >
            <Enum
              value={value}
              disabled={disabled}
              customField={customField}
              selectedAssetsIds={this.props.selectedAssetsIds}
              onChange={this.handleChange}
            />
            {modifiedField && <ModifiedField field={modifiedField} />}
          </div>
        );
      }

      default:
        return null;
    }
  };

  render() {
    const { props } = this;
    return (
      <div
        data-qa="details-component-customFields"
        className={cn('detailsPanel__item detailsPanel__customFields')}
        data-block="detailsCustomFields"
      >
        {this.state.customFieldGroups.map((group) => {
          const separator = group[0];
          const isVisibleGroup = separator.visibility !== 'hidden';
          const isVisible = props.detailsPanelVisibility[separator.title] && isVisibleGroup;
          const groupToRender = props.customFieldsAllowed && isVisible ? group : [separator];

          return (
            <div
              data-qa={`details-component-customFields-${separator.title}`}
              key={separator.title}
              className={cn('customFieldGroup', { act: isVisible })}
            >
              {groupToRender.map(this.renderField)}
            </div>
          );
        })}
      </div>
    );
  }
}

const ConnectedCustomFields = connect((store) => ({ allCustomFields: store.customFields.items }))(
  CustomFields
);

export default (props) => (
  <Provider store={store}>
    <ConnectedCustomFields {...props} />
  </Provider>
);
