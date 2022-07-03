import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { InputControlLabel } from '@picsio/ui';
import _isEqual from 'lodash/isEqual';

import ToolbarScreenTop from '../../toolbars/ToolbarScreenTop';
import {
  Input, Select, Textarea, Radio,
} from '../../../UIComponents';

import localization from '../../../shared/strings';
import Logger from '../../../services/Logger';
import * as utils from '../../../shared/utils';

/** Store */
import * as customFieldsActions from '../../../store/actions/customFields';

import Sort, { ORDERS } from './Sort';
import Options from './Options';
import { back } from '../../../helpers/history';

const iconClassByType = {
  separator: 'folderFull',
  input: 'text',
  date: 'date',
  boolean: 'checkboxChecked',
  int: 'hash',
  enum: 'markedList',
};

const iconClassByVisibility = {
  hidden: 'eyeClosed',
  visible: 'eyeOpen',
  hidden_while_empty: 'eyeCrossed',
};

const typesNames = {
  input: localization.CUSTOMFIELDSSCHEMA.configTypesString,
  int: localization.CUSTOMFIELDSSCHEMA.configTypesInt,
  enum: localization.CUSTOMFIELDSSCHEMA.configTypesEnum,
  boolean: localization.CUSTOMFIELDSSCHEMA.configTypesBoolean,
  date: localization.CUSTOMFIELDSSCHEMA.configTypesDate,
  separator: localization.CUSTOMFIELDSSCHEMA.configTypesSeparator,
};

class CustomFieldsSchemaEdit extends React.Component {
  itemTitle = window.location.pathname.split('/').pop();

  type = null;

  order = null;

  /** State */
  state = {
    item: {},
    listOptionName: '',
    errors: {},
    multiple: false,
    optionsOrder: ORDERS.custom,
  };

  componentDidMount() {
    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(url.search);
    this.type = searchParams.get('type');
    this.order = searchParams.get('order');
    const { props } = this;
    const { items } = props.store;
    let item = items.find((i) => i.title === decodeURI(this.itemTitle));

    const newState = {};

    if (item) {
      item.defautlTitle = item.title;

      if (item.options) newState.optionsOrder = this.detectSort(item.options);
      newState.item = item;
      newState.multiple = item.multiple;
    } else {
      item = {
        title: '',
        order: this.order,
        type: this.type === 'group' ? 'separator' : 'input',
        writable: true,
        visibility: 'visible',
      };
      newState.item = item;
    }

    this.setState(newState);
  }

  componentDidUpdate(prevProps, prevState) {
    const { item } = this.state;

    if (!_isEqual(prevState.item.type, item.type) && item.multiple) {
      this.setState({ multiple: true });
    }
  }

  changeSettings = (key, value) => {
    const item = { ...this.state.item };
    item[key] = value;

    return this.setState({ item });
  };

  addError = (component, errorText) => {
    this.setState({
      errors: { ...this.state.errors, [component]: errorText },
    });
  };

  removeError = (component) => {
    this.setState({
      errors: { ...this.state.errors, [component]: '' },
    });
  };

  handleNameChange = (event) => {
    let { value } = event.currentTarget;
    const { type } = this.state.item;
    let filteredValue;
    let errorMessage;

    if (type === 'separator') {
      filteredValue = utils.replaceAlphabeticalAnd(value, '\\d\\s-_'); // letters, numbers, underscore, dash, and space
      errorMessage = localization.CUSTOMFIELDSSCHEMA.textErrorTitleNameSpace;
    } else {
      filteredValue = utils.replaceAlphabeticalAnd(value, '\\d-_'); // letters, numbers, underscore, and dash
      errorMessage = localization.CUSTOMFIELDSSCHEMA.textErrorTitleName;
    }

    if (value !== filteredValue) {
      value = filteredValue;
      return this.addError('title', errorMessage);
    }
    this.removeError('title');
    return this.changeSettings('title', value);
  };

  handleDescriptionChange = (event) => {
    const { value } = event.currentTarget;
    this.changeSettings('description', value);
  };

  handleTypeChange = (type) => {
    if (this.state.errors.global) {
      this.removeError('global');
    }
    this.changeSettings('type', type);
  };

  changeVisibility = (event, value) => {
    this.changeSettings('visibility', value);
  };

  handleSubmit = async () => {
    Logger.log('User', 'SettingsCustomFieldsSubmit');
    const { state, props } = this;
    const item = { ...state.item };

    if (item.type === 'enum') {
      item.multiple = state.multiple;

      if (!item.options.length) {
        this.addError('global', 'List options can not be empty');
        return;
      }
    } else {
      delete item.options;
      delete item.multiple;
    }

    if (this.type) {
      const config = { ...item, order: +this.order };
      await props.customFieldsActions.add(config);
      if (this.props.store.addError) return;
    } else {
      props.customFieldsActions.updateCustomField(item);
    }

    this.destroy();
  };

  handleListOptionNameChange = (event) => {
    const { value } = event.currentTarget;
    if (this.state.errors.option) {
      this.removeError('option');
    }
    if (value.includes(',')) {
      this.setState({ errors: { option: localization.CUSTOMFIELDSSCHEMA.textErrorComma } });
    }
    this.setState({ listOptionName: value });
  };

  handleListOptionsNameKeyDown = (event) => {
    const keyCodes = {
      ENTER: 13,
      ESC: 27,
    };

    if (event.keyCode === keyCodes.ESC) {
      event.stopPropagation();
      event.preventDefault();
      this.setState({ listOptionName: '' });
    }

    if (event.keyCode === keyCodes.ENTER) {
      event.preventDefault();
      this.handleAddOption();
    }
  };

  handleAddOption = () => {
    const item = { ...this.state.item };
    const options = this.state.item.options || [];
    const option = this.state.listOptionName.trim();
    const commaError = this.state.errors.option;
    Logger.log('User', 'SettingsCustomFieldsListOptionAdd');

    if (!option.length) {
      this.addError('option', 'The field is empty');
      return;
    }

    if (options.includes(option)) {
      this.addError('option', 'This name is already added. Please, enter another one');
      return;
    }

    if (commaError) return;

    if (this.state.errors.global) {
      this.removeError('global');
    }

    if (options.indexOf(option) === -1) {
      options.push(option);

      item.options = options;
      this.setState({ item, listOptionName: '', optionsOrder: this.detectSort(options) });
    }
  };

  handleRemoveOption = (name) => {
    Logger.log('User', 'SettingsCustomFieldsListOptionRemove');
    const item = { ...this.state.item };
    item.options = item.options.filter((i) => i !== name);
    this.setState({ item });
  };

  /**
   * Get options for visibility select
   * @param {string} type
   * @returns {Array}
   */
  getVisibilityOptions = (type) => {
    const list = [
      {
        text: localization.CUSTOMFIELDSSCHEMA.configVisibilityVisible,
        value: 'visible',
      },
      {
        text: localization.CUSTOMFIELDSSCHEMA.configVisibilityHidden,
        value: 'hidden',
      },
      {
        text: localization.CUSTOMFIELDSSCHEMA.configVisibilityHiddenWhileEmpty,
        value: 'hidden_while_empty',
      },
    ];

    if (type === 'separator' || type === 'boolean') {
      return list.filter((n) => n.value !== 'hidden_while_empty');
    }
    return list;
  };

  destroy = () => {
    Logger.log('User', 'SettingsCustomFieldsHide');
    back();
    this.props.customFieldsActions.removeErrorMessage();
  };

  isSubmitDisabled = () => {
    const { state } = this;

    if (
      state.item.default
      || !state.item.title
      || (state.item.type === 'enum'
        && (!state.item.options || (state.item.options && !state.item.options.length)))
    ) {
      return true;
    }
    return false;
  };

  handleChangeMultiple = ({ target: { checked } }) => {
    this.setState({ multiple: checked });
  };

  detectSort = (options) => {
    const sorted = {
      [ORDERS.az]: utils.alphaNumericSort(options),
      [ORDERS.za]: utils.alphaNumericSort(options).reverse(),
    };
    if (_isEqual(options, sorted[ORDERS.az])) return ORDERS.az;
    if (_isEqual(options, sorted[ORDERS.za])) return ORDERS.za;
    return ORDERS.custom;
  };

  handleChangeOptionsOrder = (order) => {
    const { item } = this.state;
    if (!item.options) return;
    if (order === ORDERS.az) {
      this.setState({
        item: { ...item, options: utils.alphaNumericSort(item.options) },
        optionsOrder: order,
      });
    }
    if (order === ORDERS.za) {
      this.setState({
        item: { ...item, options: utils.alphaNumericSort(item.options).reverse() },
        optionsOrder: order,
      });
    }
  };

  handleSort = (options) => {
    const { item } = this.state;
    this.setState({
      item: { ...item, options },
      optionsOrder: this.detectSort(options),
    });
  };

  render() {
    const { state, handleChangeOptionsOrder, type } = this;
    const { multiple, optionsOrder } = state;
    const isDefault = state.item.default;
    const visibilityIconClass = iconClassByVisibility[state.item.visibility] || 'eyeOpen';
    const breadcrumbs = type
      ? type === 'group'
        ? localization.CUSTOMFIELDSSCHEMA.createGroup
        : localization.CUSTOMFIELDSSCHEMA.createField
      : state.item.type === 'separator'
        ? localization.CUSTOMFIELDSSCHEMA.editGroup
        : localization.CUSTOMFIELDSSCHEMA.editField;

    return (
      <div className="page pageCustomFields">
        <ToolbarScreenTop
          title={[localization.CUSTOMFIELDSSCHEMA.title, breadcrumbs]}
          onClose={this.destroy}
          helpLink="customFieldsSchema"
        />
        <div className="pageContent">
          <div className="pageInnerContent" ref={this.itemsHolder}>
            <div className="schemaWrapper">
              <div className="customFieldsSchemaForm">
                <h1>
                  {type
                    ? type === 'group'
                      ? localization.CUSTOMFIELDSSCHEMA.createGroup
                      : localization.CUSTOMFIELDSSCHEMA.createField
                    : `${localization.CUSTOMFIELDSSCHEMA.edit} "${decodeURI(this.itemTitle)}"`}
                </h1>
                {type ? (
                  <div className="customFieldsSchemaRow">
                    <Input
                      label={localization.CUSTOMFIELDSSCHEMA.labelName}
                      placeholder={localization.CUSTOMFIELDSSCHEMA.placeholderName}
                      value={state.item.title || ''}
                      onChange={this.handleNameChange}
                      error={this.props.store.addError || state.errors.title}
                      disabled={isDefault}
                      autoFocus
                    />
                    <div className="inputCaption">
                      {localization.CUSTOMFIELDSSCHEMA.captionName}
                    </div>
                  </div>
                ) : null}

                {this.type !== 'group' && state.item.type !== 'separator' && (
                  <div className="customFieldsSchemaRow">
                    <div className="UIInput__label">{localization.CUSTOMFIELDSSCHEMA.type}</div>
                    <div className="radioList">
                      <div className="radioListItem">
                        <Radio
                          value={state.item.type === 'input'}
                          label={typesNames.input}
                          icon={iconClassByType.input}
                          onChange={() => this.handleTypeChange('input')}
                          disabled={isDefault}
                        />
                      </div>
                      <div className="radioListItem">
                        <Radio
                          value={state.item.type === 'int'}
                          label={typesNames.int}
                          icon={iconClassByType.int}
                          onChange={() => this.handleTypeChange('int')}
                          disabled={isDefault}
                        />
                      </div>
                      <div className="radioListItem">
                        <Radio
                          value={state.item.type === 'boolean'}
                          label={typesNames.boolean}
                          icon={iconClassByType.boolean}
                          onChange={() => this.handleTypeChange('boolean')}
                          disabled={isDefault}
                        />
                      </div>
                      <div className="radioListItem">
                        <Radio
                          value={state.item.type === 'date'}
                          label={typesNames.date}
                          icon={iconClassByType.date}
                          onChange={() => this.handleTypeChange('date')}
                          disabled={isDefault}
                        />
                      </div>
                      <div className="radioListItem">
                        <Radio
                          value={state.item.type === 'enum'}
                          label={typesNames.enum}
                          icon={iconClassByType.enum}
                          onChange={() => this.handleTypeChange('enum')}
                          disabled={isDefault}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <If condition={state.item.type === 'enum'}>
                  <div className="customFieldsSchemaRow customFieldsOptions checkboxOption">
                    <div className="customFieldsOptionsCheckbox">
                      <InputControlLabel
                        id="multiple-control"
                        name="multiple"
                        value={multiple}
                        onChange={this.handleChangeMultiple}
                        label="Allow multiple selection"
                        control="checkbox"
                      />
                    </div>
                  </div>
                </If>
                <If condition={state.item.options && state.item.options.length > 1}>
                  <Sort order={optionsOrder} onChange={handleChangeOptionsOrder} />
                </If>
                {state.item.type === 'enum' && (
                  <div className="customFieldsSchemaRow customFieldsOptions">
                    {state.item.options && state.item.options.length > 0 && (
                      <Options
                        isDefault={isDefault}
                        onSort={this.handleSort}
                        options={state.item.options}
                        onRemove={this.handleRemoveOption}
                      />
                    )}
                    {!isDefault && (
                      <>
                        <Input
                          placeholder={localization.CUSTOMFIELDSSCHEMA.addNewItem}
                          value={state.listOptionName}
                          onChange={this.handleListOptionNameChange}
                          onKeyDown={this.handleListOptionsNameKeyDown}
                          error={state.errors.option}
                          disabled={isDefault}
                        />
                        <div className="picsioDefBtn" onClick={this.handleAddOption}>
                          {localization.CUSTOMFIELDSSCHEMA.addNewItem}
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="customFieldsSchemaRow">
                  <Select
                    value={state.item.visibility}
                    options={this.getVisibilityOptions(state.item.type)}
                    onChange={this.changeVisibility}
                    icon={visibilityIconClass}
                    disabled={isDefault}
                  />
                </div>
                <div className="customFieldsSchemaRow">
                  <Textarea
                    label={localization.CUSTOMFIELDSSCHEMA.labelDescription}
                    placeholder={localization.CUSTOMFIELDSSCHEMA.placeholderDescription}
                    value={state.item.description}
                    onChange={this.handleDescriptionChange}
                    disabled={isDefault}
                  />
                </div>
                {state.errors.global && (
                  <div className="customFieldsSchemaRow customFieldsSchemaError">
                    {state.errors.global}
                  </div>
                )}
                <div className="customFieldsSchemaRow">
                  <div
                    className={cn('picsioDefBtn btnCallToAction', {
                      disable: this.isSubmitDisabled(),
                    })}
                    onClick={this.handleSubmit}
                  >
                    {localization.CUSTOMFIELDSSCHEMA.btnSave}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

CustomFieldsSchemaEdit.propTypes = {
  store: PropTypes.object.isRequired,
  customFieldsActions: PropTypes.objectOf(PropTypes.func).isRequired,
};

const ConnectedView = connect(
  (store) => ({ store: store.customFields }),
  (dispatch) => ({ customFieldsActions: bindActionCreators(customFieldsActions, dispatch) }),
)(CustomFieldsSchemaEdit);

export default ConnectedView;
