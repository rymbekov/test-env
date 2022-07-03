import React from 'react'; // eslint-disable-line
import { object, func, bool } from 'prop-types';
import cn from 'classnames';
import localization from '../../../shared/strings';
import Icon from '../../Icon';
import CreatorInline from './CreatorInline';
import { navigate } from '../../../helpers/history';

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

class Field extends React.Component {
  /** PropTypes */
  static propTypes = {
    data: object,
    collapsed: bool,
    dragstart: func,
    dragenter: func,
    dragend: func,
    collapseGroup: func,
    changeVisibility: func,
    remove: func,
    getVisibilityOptions: func,
    disabled: bool,
  };

  /** State */
  state = { isRemoving: false };

  collapseGroup = () => this.props.collapseGroup(this.props.data.title);

  changeVisibility = () => {
    let { visibility, type } = this.props.data;
    if (!visibility) {
      visibility = 'visible';
    }
    let toggle = { visible: 'hidden', hidden: 'hidden_while_empty', hidden_while_empty: 'visible' };
    if (type === 'separator' || type === 'boolean') {
      toggle = { visible: 'hidden', hidden: 'visible' };
    }
    this.props.changeVisibility(this.props.data, toggle[visibility]);
  };

  setRemoving = () => this.setState({ isRemoving: true });

  unsetRemoving = () => this.setState({ isRemoving: false });

  remove = () => this.props.remove(this.props.data);

  render() {
    const { isRemoving } = this.state;
    const {
      data, draggable = true, dragstart, dragenter, dragend, collapsed, disabled,
    } = this.props;
    const {
      title, type, visibility, isTmp, isUpdating, patternDescription, description,
    } = data;
    const isDefault = data.default || data.notRemovable;

    const isSeparator = type === 'separator';
    const visibilityIconClass = iconClassByVisibility[visibility] || 'eyeOpen';

    /** if is temp - render placeholder */
    if (isTmp) return <div className="itemCustomFields tmp" />;

    return (
      <div
        key={title}
        data-title={title}
        draggable={!disabled && draggable}
        onDragStart={dragstart}
        onDragEnter={dragenter}
        onDragEnd={dragend}
        className="itemCustomField"
      >
        <div
          className={cn('itemCustomFields', {
            itemCustomFieldsTitle: isSeparator,
            itemCustomFieldsCollapsed: collapsed,
            removingState: isRemoving,
            updating: isUpdating,
          })}
        >
          <div className="itemCustomFieldsMain">
            {isSeparator && (
              <span className={cn('btnCollapseGroup', { act: collapsed })} onClick={this.collapseGroup} />
            )}
            <span className="itemCustomFieldsIcon" onClick={isSeparator ? this.collapseGroup : null}>
              <Icon name={iconClassByType[type]} />
            </span>
            <span
              className={cn('fieldName', { separatorName: isSeparator })}
              onClick={isSeparator ? this.collapseGroup : null}
            >
              {title}
            </span>
            {!disabled && (
              <span className={cn('fieldVisibility')} onClick={this.changeVisibility}>
                <Icon name={visibilityIconClass} />
              </span>
            )}
          </div>
          {(patternDescription || description) && (
            <span className="fieldDescription">{patternDescription || description}</span>
          )}
          {!disabled && (
            <div className="fieldControls">
              {!isDefault && (
                <span
                  className="fieldControl"
                  onClick={() => {
                    navigate(`/customfields/${title}`);
                  }}
                >
                  <Icon name="pen" />
                </span>
              )}
              {!isDefault && (
                <span className="fieldControl" onClick={this.setRemoving}>
                  <Icon name="close" />
                </span>
              )}
            </div>
          )}
          {!disabled && (
            <div className="removeLine">
              <span className="btnApproveDeleting" onClick={this.remove}>
                {localization.CUSTOMFIELDSSCHEMA.textButtonDelete}
              </span>
              <span className="btnCancelDeleting" onClick={this.unsetRemoving}>
                {localization.CUSTOMFIELDSSCHEMA.textButtonCancel}
              </span>
            </div>
          )}
        </div>
        {!isSeparator && !disabled && <CreatorInline type="field" order={+data.order + 1} />}
      </div>
    );
  }
}

export default Field;
