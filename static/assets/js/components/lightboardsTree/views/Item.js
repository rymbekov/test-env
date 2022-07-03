import React from 'react';
import {
  object, objectOf, func, string, arrayOf,
} from 'prop-types';
import cn from 'classnames';
import {
  Delete,
  Edit,
  Upload,
} from '@picsio/ui/dist/icons';
import Logger from '../../../services/Logger';
import * as utils from '../../../shared/utils';
import DialogRadios from '../../dialogRadios';

import picsioConfig from '../../../../../../config';
import showDropAssetsOnlyDialog from '../../../helpers/showDropAssetsOnlyDialog';

import localization from '../../../shared/strings';
import { Textarea } from '../../../UIComponents';
import TreeButton from '../../TreeButton';

export default class Item extends React.Component {
  btnCLicked = false;

  liStyle = { paddingLeft: 53 };

  $item = React.createRef();

  state = {
    isRenaming: false,
    newName: null,
    isValid: true,
  };

  refTextareaRename = (textarea) => (this.textareaRename = textarea);

  generateTitleAndBtns = () => {
    const { handlers, node } = this.props;
    let title = node.path.split('→').pop();
    let buttons = null;

    if (!this.state.isRenaming) {
      const btns = [];

      /** Remove */
      if (handlers.remove) {
        btns.push({
          icon: () => <Delete />,
          additionalClassName: 'btnRemoveFolder',
          tooltip: localization.LIGHTBOARDSTREE.textDeleteLightboard,
          onClick: this.handleRemove,
        });
      }

      /** Rename */
      if (handlers.rename) {
        btns.push({
          icon: () => <Edit />,
          additionalClassName: 'btnRenameFolder',
          tooltip: localization.LIGHTBOARDSTREE.textRenameLightboard,
          onClick: this.setRenaming,
        });
      }

      /** Upload */
      if (handlers.inputUpload) {
        btns.push(
          {
            icon: () => <Upload />,
            additionalClassName: 'btnRenameFolder',
            tooltip: localization.LIGHTBOARDSTREE.textUploadFiles,
            onClick: this.handleClickUpload,
            upload: true,
          },
        );
      }

      title = (
        <span className="collectionTextValue" onDoubleClick={this.onDoubleClickName}>
          {decodeURIComponent(title)}
        </span>
      );
      buttons = (
        <div className="btnsManageCollection leftShadow">
          {btns.map((btn) => (
            <TreeButton
              key={btn.icon}
              icon={btn.icon}
              className={btn.className}
              additionalClassName={btn.additionalClassName}
              tooltip={btn.tooltip}
              onClick={btn.onClick}
            >
              <If condition={btn.upload}>
                <input
                  type="file"
                  multiple
                  className="btnCollectionUpload"
                  onChange={handlers.inputUpload}
                />
              </If>
            </TreeButton>
          ))}
        </div>
      );
      return { title, buttons };
    }

    title = (
      <Textarea
        isDefault
        className={cn('collectionTextValue', { error: !this.state.isValid })}
        defaultValue={decodeURIComponent(title)}
        onClick={this.stopPropagation}
        onKeyDown={this.onKeyDownTextarea}
        onBlur={this.onBlurRename}
        onChange={this.onChangeTextarea}
        customRef={this.refTextareaRename}
      />
    );
    buttons = (
      <div className="btnsEditCollection leftShadow">
        <TreeButton
          key="ok"
          icon="ok"
          additionalClassName={cn('btnOkFolder', { disabled: !this.state.isValid })}
          tooltip={localization.LIGHTBOARDSTREE.textSave}
          onClick={this.doRename}
        />
        <TreeButton
          key="cancel"
          icon="close"
          additionalClassName="btnCancelFolder"
          tooltip={localization.LIGHTBOARDSTREE.textCancel}
          onClick={this.handleClickCancel}
        />
      </div>
    );
    return { title, buttons };
  };

  handleRemove = (event) => {
    Logger.log('User', 'LightboardsPanelDeleteLB');
    const { _id, path } = this.props.node;
    event.stopPropagation();
    this.props.handlers.remove(_id, path.split('→').pop());
  };

  onDoubleClickName = (event) => {
    event.stopPropagation();
    if (event.target.classList.contains('collectionTextValue')) {
      this.setRenaming(event);
    }
  };

  setRenaming = (event) => {
    event.stopPropagation();
    Logger.log('User', 'LightboardsPanelRenameLB');
    this.setState({ isRenaming: true }, () => this.textareaRename && this.textareaRename.select());
  };

  doRename = (event) => {
    Logger.log('User', 'LightboardsPanelRenameLBOK');
    event.stopPropagation();
    this.btnCLicked = true;
    if (this.state.isValid && this.textareaRename) {
      this.rename(this.textareaRename.value, event);
    } else if (this.textareaRename) {
      this.textareaRename.select();
    } else {
      this.cancelRenaming(event);
    }
  };

  /**
   * @param {string} _value
   */
  rename = (_value, event) => {
    const value = _value.trim();
    if (value === this.props.node.path.split('→').pop()) return this.cancelRenaming(event);

    this.props.handlers.rename(this.props.node, value);
    this.cancelRenaming(event);
  };

  stopPropagation = (event) => event.stopPropagation();

  /**
   * Handle keydown on textarea
   * @param {KeyboardEvent} event
   */
  onKeyDownTextarea = (event) => {
    const { isRenaming } = this.state;
    const ENTER = 13;
    const ESC = 27;
    switch (event.keyCode) {
    case ENTER: {
      event.stopPropagation();
      if (isRenaming) this.doRename(event);
      break;
    }
    case ESC: {
      event.stopPropagation();
      Logger.log('User', 'LightboardsPanelRenameLBCancel');
      if (isRenaming) this.cancelRenaming(event);
      break;
    }
    default:
      return true;
    }
  };

  onBlurRename = (event) => {
    this.btnCLicked = false;
    const { value } = event.target;

    setTimeout(() => {
      if (!this.btnCLicked && this.state.isRenaming) {
        if (this.state.isValid) {
          Logger.log('User', 'LightboardsPanelRenameLBOK');
          this.rename(value);
        } else {
          Logger.log('User', 'LightboardsPanelRenameLBCancel');
          this.cancelRenaming(event);
        }
      }
    }, 200);
  };

  onChangeTextarea = (event) => this.validate(event.target.value);

  validate = (_value) => {
    const value = _value.trim().toLowerCase();
    const nodes = this.props.allLightboards;
    let isValid = true;
    const checkName = (item) => decodeURIComponent(item.path.split('→').pop().toLowerCase()) === decodeURIComponent(value);

    if (value.startsWith('.')) isValid = false; // check if the first symbol is .(dot)
    if (RegExp(/[%/\\(){}[\]]/, 'g').test(_value)) isValid = false;
    if (value === '' || nodes.some(checkName)) {
      isValid = false;
    }

    this.setState({ isValid });
  };

  cancelRenaming = (event) => {
    this.btnCLicked = true;
    event && event.stopPropagation();
    this.setState({ isValid: true, isRenaming: false });
  };

  handleClickCancel = (event) => {
    Logger.log('User', 'LightboardsPanelRenameLBCancel');
    event.stopPropagation();
    this.cancelRenaming(event);
  };

  isDenyDND = () => ['favorites', 'websites', 'root'].includes(this.props.node.path);

  onDragOver = (event) => {
    if (this.isDenyDND()) return;

    this.$item.current.classList.add('onDragenterHighlight');

    event.preventDefault(); // neccessary
    event.stopPropagation(); // neccessary
    event.dataTransfer.dropEffect = 'copy'; // neccessary
  };

  onDragLeave = () => {
    if (this.isDenyDND()) return;
    this.$item.current.classList.remove('onDragenterHighlight');
  };

  onDrop = (event) => {
    event.stopPropagation();
    if (this.isDenyDND()) return;

    this.$item.current.classList.remove('onDragenterHighlight');

    if (event.dataTransfer.getData('text/plain') !== picsioConfig.DRAG_ASSETS_EVENT_CONTENT) {
      return showDropAssetsOnlyDialog();
    }

    const isMoveOrCopyPopupDisabledByUser = utils.getCookie('picsio.moveOrCopyDialogVisible');
    const { inboxId } = this.props.searchQuery;

    if (inboxId) {
      /** always MOVE from inbox into lightboard */
      this.props.handlers.drop(this.props.node, true);
      return;
    }

    if (!isMoveOrCopyPopupDisabledByUser) {
      /** "move or copy" dialog */
      new DialogRadios({
        title: localization.DIALOGS.MOVE_ASSETS_DIALOG.TITLE,
        items: [
          {
            label: localization.DIALOGS.MOVE_ASSETS_DIALOG.COPY_RADIO.LABEL.LIGHTBOARD,
            value: 'COPY',
            checked: !event.altKey,
            description: localization.DIALOGS.MOVE_ASSETS_DIALOG.COPY_RADIO.DESCRIPTION,
          },
          {
            label: localization.DIALOGS.MOVE_ASSETS_DIALOG.MOVE_RADIO.LABEL.LIGHTBOARD,
            value: 'MOVE',
            checked: event.altKey,
            description: localization.DIALOGS.MOVE_ASSETS_DIALOG.MOVE_RADIO.DESCRIPTION(),
          },
        ],
        checkbox: {
          value: false,
          label: localization.DIALOGS.MOVE_ASSETS_DIALOG.CHECKBOX_LABEL,
          onChange: () => {},
        },
        cancelName: localization.DIALOGS.MOVE_ASSETS_DIALOG.CANCEL_TEXT,
        okName: localization.DIALOGS.MOVE_ASSETS_DIALOG.OK_TEXT,
        onOk: (value, checkboxValue) => {
          utils.setCookie('picsio.moveOrCopyDialogVisible', checkboxValue);
          if (value === 'MOVE') {
            this.props.handlers.drop(this.props.node, true);
          } else {
            this.props.handlers.drop(this.props.node);
          }
        },
      });
    } else if (event.altKey) {
      /** Alt/Option pressed -> MOVE */
      this.props.handlers.drop(this.props.node, true);
    } else {
      /** without Alt/Option -> COPY */
      this.props.handlers.drop(this.props.node);
    }
  };

  onMouseOver = () => {
    this.$item.current.classList.add('hover');
  };

  onMouseLeave = () => {
    this.$item.current.classList.remove('hover');
  };

  onClickItem = () => {
    this.props.handlers.item(this.props.node._id);
  };

  /**
   * Handle click on button upload
   * @param {MouseEvent|TouchEvent} event
   */
  handleClickUpload = (event) => {
    Logger.log('User', 'LightboardsPanelUpload');
    event.stopPropagation();
    this.props.handlers.uploadClick(this.props.node._id);
  };

  render() {
    const { props, state } = this;
    const {
      node: { optimistic },
    } = props;
    const { title, buttons } = this.generateTitleAndBtns();
    const itemClassName = cn('nameFolder', {
      act: props.activeLightboard === props.node._id,
      editModeFolder: state.isRenaming,
      disabled: props.node.isRenaming || props.node.isBusy,
    });

    return (
      <li onDragOver={this.onDragOver} onDragLeave={this.onDragLeave} onDrop={this.onDrop}>
        {!optimistic && (
          <span
            className={itemClassName}
            onClick={this.onClickItem}
            onDoubleClick={this.onDoubleClickName}
            style={this.liStyle}
            onMouseOver={this.onMouseOver}
            onMouseLeave={this.onMouseLeave}
            ref={this.$item}
          >
            {buttons}
            {title}
          </span>
        )}
        {optimistic && (
          <span className={`${itemClassName} renaming`} style={this.liStyle}>
            <span className="collectionTextValue">{title}</span>
          </span>
        )}
      </li>
    );
  }
}

Item.propTypes = {
  handlers: objectOf(func).isRequired,
  node: object.isRequired,
  allLightboards: arrayOf(object).isRequired,
  activeLightboard: string,
};
