import React from 'react';
import _get from 'lodash/get';
import debounce from 'lodash.debounce';
import cn from 'classnames';

import { bindActionCreators } from 'redux';
import { Provider, connect } from 'react-redux';
import localization from '../../../shared/strings';
import ToolbarScreenTop from '../../toolbars/ToolbarScreenTop';
import Logger from '../../../services/Logger';

/** Store */
import store from '../../../store';
import * as actions from '../../../store/actions/customFields';

/** Components */
import Icon from '../../Icon';
import ua from '../../../ua';
import Field from './Field';
import Creator from './Creator';
import CreatorInline from './CreatorInline';
import Import from './Import';
import SearchBar from '../../SearchBar';

import ToolbarButton from '../../toolbars/Button';
import { back } from '../../../helpers/history';
import { showDialog } from '../../dialog';

class CustomFieldsSchemaView extends React.Component {
  constructor(props) {
    super(props);
    this.templateTmpItem = document.createElement('div');
    this.templateTmpItem.classList.add('temporaryCustomFieldItem');

    this.titleFieldToMove = null;

    this.titleFieldToMoveAfter = null;

    this.draggableElement = null;

    this.tmpPosition = null;

    this.itemsHolder = React.createRef(); // needs to calculate AddForm width

    /** State */
    this.state = {
      hiddenFieldsTitles: [],
      hiddenGroupsTitles: [],
      innerContentWidth: 0,
      dragged: null,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.setContainerWidth);
    this.setContainerWidth();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setContainerWidth);
  }

  setContainerWidth = () => {
    this.setState({ innerContentWidth: this.itemsHolder.current.clientWidth });
  };

  /**
   * @param {FormData} data
   */
  submitImport = (data) => {
    Logger.log('User', 'SettingsCustomFieldsImport');
    this.props.actions.importSchema(data);
    this.setState({ hiddenFieldsTitles: [], hiddenGroupsTitles: [] });
  };

  changeVisibility = (customField, value) => {
    Logger.log('User', 'SettingsCustomFieldsChange', 'Visibility');
    let titles = [customField.title];

    if (customField.type === 'separator') {
      titles = titles.concat(this.getFieldsTitlesInGroup(customField.title));
    }
    this.props.actions.update(titles, 'visibility', value);
  };

  destroy = () => {
    window.removeEventListener('resize', this.setContainerWidth);
    Logger.log('User', 'SettingsCustomFieldsHide');
    back('/search');
  };

  /**
   * Create custom field
   * @param {Object} data
   * @param {string} data.title
   * @param {string} data.type
   * @param {string} data.visibility
   * @param {boolean} data.writable
   */
  create = (data, order) => {
    Logger.log('User', 'SettingsCustomFieldsChange', 'Create');
    const config = { ...data, order: order + 1 };

    this.props.actions.add(config);
  };

  removeCustomField = (field, quiet, isRequired) => {
    Logger.log('User', 'SettingsCustomFieldsChange', 'Remove');

    const { title } = field;
    let changes = null;

    /** if field is GROUP and field is collapsed */
    if (field.type === 'separator' && this.state.hiddenGroupsTitles.includes(title)) {
      const titles = this.getFieldsTitlesInGroup(title);
      changes = {
        /** remove title from hidden group titles */
        hiddenGroupsTitles: this.state.hiddenGroupsTitles.filter(
          (groupTitle) => groupTitle !== title,
        ),
        /** show fields below separator */
        hiddenFieldsTitles: this.state.hiddenFieldsTitles.filter(
          (fieldTitle) => !titles.includes(fieldTitle),
        ),
      };
    }

    this.props.actions.remove(title, quiet, isRequired);
    if (changes) this.setState(changes);
  };

  /**
   * Remove field
   * @param {Object} field
   */
  remove = (field) => {
    const { title } = field;
    const { requiredCustomFields } = this.props;
    const isRequired = requiredCustomFields[title];

    if (isRequired) {
      showDialog({
        icon: 'warning',
        title: localization.CUSTOMFIELDSSCHEMA.deleteWarning.title,
        text: localization.CUSTOMFIELDSSCHEMA.deleteWarning.text,
        onCancel: () => {
          this.removeCustomField(field, false, isRequired);
        },
        textBtnOk: 'Discard',
        textBtnCancel: 'Continue',
      });
    } else {
      this.removeCustomField(field);
    }
  };

  preventDefault(event) {
    event.preventDefault();
  }

  dragstart = (event) => {
    document.body.addEventListener('dragover', this.preventDefault);
    document.body.addEventListener('drop', this.preventDefault);
    Logger.log('User', 'SettingsCustomFieldsChange', 'Drag');
    event.stopPropagation();

    const el = (this.originalEl = event.currentTarget);
    this.draggableElement = event.currentTarget;
    this.dragged = this.draggableElement.dataset.type === 'group' ? 'group' : 'field';
    this.setState({ dragged: this.draggableElement.dataset.type === 'group' ? 'group' : 'field' });

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', 'Data to Drag');

    this.tmpItem = this.templateTmpItem;

    this.tmpPosition = this.titleFieldToMove = this.titleFieldToMoveAfter = event.currentTarget.dataset.title;

    setTimeout(() => {
      el.parentNode.insertBefore(this.tmpItem, el);
      el.style.display = 'none';
    }, 0);
  };

  dragenter = (event) => {
    event.stopPropagation();
    const { currentTarget } = event;
    const { title, type } = currentTarget.dataset;
    const el = currentTarget;

    /** if move before first custom field */
    if (title === 'first') {
      const wrapper = document.querySelector('.pageCustomFields .wrapperItems');
      if (wrapper.length) wrapper.prepend(this.tmpItem);
    } else {
      el.after(this.tmpItem);
    }
    this.tmpPosition = this.titleFieldToMoveAfter = title;
  };

  dragend = () => {
    document.body.removeEventListener('dragover', this.preventDefault);
    document.body.removeEventListener('drop', this.preventDefault);
    this.tmpItem.remove();
    this.originalEl.style.display = 'block';
    if (this.titleFieldToMoveAfter === 'first') {
      this.titleFieldToMoveAfter = null;
    }

    const fieldToMove = this.props.store.items.find((item) => item.title === this.titleFieldToMove);
    const fieldToMoveAfter = this.props.store.items.find(
      (item) => item.title === this.titleFieldToMoveAfter,
    );
    if (!fieldToMove || fieldToMove === fieldToMoveAfter) return;

    /** @type {string[]} */
    let titlesToMove = [fieldToMove.title];
    if (fieldToMove.type === 'separator') {
      titlesToMove = [...titlesToMove, ...this.getFieldsTitlesInGroup(fieldToMove.title)];
    }

    /** @type {string} */
    let titleToMoveAfter = this.titleFieldToMoveAfter;
    if (
      fieldToMoveAfter
      && fieldToMoveAfter.type === 'separator'
      && this.state.dragged !== 'field'
    ) {
      /** @type {string[]} */
      const titlesInGroup = this.getFieldsTitlesInGroup(fieldToMoveAfter.title);
      titleToMoveAfter = titlesInGroup[titlesInGroup.length - 1];
    }
    this.setState({ dragged: null });
    this.props.actions.move(titlesToMove, titleToMoveAfter);
  };

  /**
   * Get array of titles fields in group
   * @param {string} separatorTitle
   * @returns {string[]}
   */
  getFieldsTitlesInGroup = (separatorTitle) => {
    const { items } = this.props.store;
    let pushAllowed = true;
    return items
      .slice(items.findIndex((item) => item.title === separatorTitle) + 1)
      .reduce((acc, item) => {
        pushAllowed && item.type === 'separator' && (pushAllowed = false);
        pushAllowed && acc.push(item.title);
        return acc;
      }, []);
  };

  /**
   * Collapse group by title
   * @param {string} separatorTitle
   */
  collapseGroup = (separatorTitle) => {
    const { hiddenGroupsTitles, hiddenFieldsTitles } = this.state;
    /** @type {boolean} */
    const close = !hiddenGroupsTitles.includes(separatorTitle);
    /** @type {string[]} */
    const fieldsTitlesInGroup = this.getFieldsTitlesInGroup(separatorTitle);

    if (close) {
      this.setState({
        hiddenFieldsTitles: [...hiddenFieldsTitles, ...fieldsTitlesInGroup],
        hiddenGroupsTitles: [...hiddenGroupsTitles, separatorTitle],
      });
    } else {
      this.setState({
        hiddenFieldsTitles: hiddenFieldsTitles.filter(
          (title) => !fieldsTitlesInGroup.includes(title),
        ),
        hiddenGroupsTitles: hiddenGroupsTitles.filter((title) => title !== separatorTitle),
      });
    }
  };

  /**
   * Get options for visibility select
   * @param {string} type
   * @returns {Array}
   */
  getVisibilityOptions(type) {
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
  }

  exportCustomFields = () => {
    Logger.log('User', 'SettingsCustomFieldsExport');
    window.open(`${window.location.origin}/customFields/export`, '_blank');
  };

  showGroup = (group) => {
    const { store } = this.props;
    return (
      (store.searchQuery !== '' && group.length > 1)
      || (store.searchQuery === '' && group.length > 0)
    );
  };

  render() {
    const { state } = this;
    const { store, subscriptionFeatures } = this.props;
    const groups = store.filtredGroups === null ? store.groups : store.filtredGroups;
    const { customFields: customFieldsAllowed } = subscriptionFeatures;

    const toolbarSchemaTools = (
      <>
        <If condition={customFieldsAllowed && !ua.isMobileApp()}>
          <Import submit={this.submitImport} />
          <ToolbarButton
            id="button-exportSchema"
            onClick={this.exportCustomFields}
            tooltip={localization.CUSTOMFIELDSSCHEMA.btnExport}
            tooltipPosition="bottom"
          >
            <Icon name="export" />
          </ToolbarButton>
        </If>
      </>
    );

    return (
      <div className="page pageCustomFields">
        <ToolbarScreenTop
          title={[localization.CUSTOMFIELDSSCHEMA.title]}
          onClose={this.destroy}
          helpLink="customFieldsSchema"
          extra={customFieldsAllowed ? toolbarSchemaTools : null}
        />
        <div className="pageContent">
          <div
            className={cn('pageInnerContent', { isDragged: state.dragged })}
            ref={this.itemsHolder}
          >
            <div className="schemaHeader" style={{ width: state.innerContentWidth }}>
              <div className="schemaWrapper">
                {store.items.length > 1 && (
                  <div className="titleWrapperItems">
                    <SearchBar
                      applySearch={debounce(this.props.actions.applySearch, 300)}
                      placeholder="Search Custom Fields"
                      defaultValue={store.searchQuery}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="schemaWrapper">
              <div className="wrapperItems">
                <Creator
                  type="group"
                  dragenter={this.dragenter}
                  data-title="first"
                  order={0}
                  disabled={!customFieldsAllowed}
                />
                {!!groups.length
                  && groups.map((group, index) => (
                    <React.Fragment key={index}>
                      {/* TODO: remove showGroup(), make search action better with this issue */}
                      {this.showGroup(group) ? (
                        <>
                          <div
                            data-type="group"
                            data-title={group[0] && group[0].title}
                            className="customFieldsGroup"
                            draggable={!!customFieldsAllowed}
                            onDragStart={this.dragstart}
                            onDragEnter={state.dragged === 'group' ? this.dragenter : null}
                            onDragEnd={state.dragged === 'group' ? this.dragend : null}
                          >
                            {group.map((item) => {
                              if (item.type === 'separator') {
                                return (
                                  <React.Fragment key={item.title}>
                                    <Field
                                      data={item}
                                      draggable={false}
                                      collapsed={
                                        item.type === 'separator'
                                          && state.hiddenGroupsTitles.includes(item.title)
                                      }
                                      collapseGroup={this.collapseGroup}
                                      changeVisibility={this.changeVisibility}
                                      remove={this.remove}
                                      getVisibilityOptions={this.getVisibilityOptions}
                                      disabled={!customFieldsAllowed}
                                    />
                                    {!state.hiddenGroupsTitles.includes(item.title) && (
                                      <Creator
                                        title={item.title}
                                        dragenter={
                                          state.dragged !== 'group' ? this.dragenter : null
                                        }
                                        dragend={state.dragged !== 'group' ? this.dragend : null}
                                        type="field"
                                        order={+group[0].order + 1}
                                        disabled={!customFieldsAllowed}
                                      />
                                    )}
                                  </React.Fragment>
                                );
                              }
                              /** if custom field is hidden - don't show it */
                              if (state.hiddenFieldsTitles.includes(item.title)) return null;
                              /** else */
                              return (
                                <Field
                                  key={item.title}
                                  data={item}
                                  dragstart={this.dragstart}
                                  dragenter={state.dragged !== 'group' ? this.dragenter : null}
                                  dragend={state.dragged !== 'group' ? this.dragend : null}
                                  collapsed={
                                    item.type === 'separator'
                                      && state.hiddenGroupsTitles.includes(item.title)
                                  }
                                  collapseGroup={this.collapseGroup}
                                  changeVisibility={this.changeVisibility}
                                  remove={this.remove}
                                  getVisibilityOptions={this.getVisibilityOptions}
                                  disabled={!customFieldsAllowed}
                                />
                              );
                            })}
                          </div>
                          {customFieldsAllowed && (
                            <CreatorInline
                              type="group"
                              order={+group[group.length - 1].order + 1}
                            />
                          )}
                        </>
                      ) : null}
                    </React.Fragment>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const ConnectedView = connect(
  (store) => ({
    store: store.customFields,
    subscriptionFeatures: store.user.subscriptionFeatures || {},
    requiredCustomFields: _get(store, 'user.team.policies.customFieldsRequired', {}),
  }),
  (dispatch) => ({ actions: bindActionCreators(actions, dispatch) }),
)(CustomFieldsSchemaView);

export default (props) => (
  <Provider store={store}>
    <ConnectedView {...props} />
  </Provider>
);
