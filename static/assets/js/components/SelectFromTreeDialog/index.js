import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import localization from '../../shared/strings';
import { DropdownTreeWithStore } from '../DropdownTree';
import Icon from '../Icon';

const KEY_ENTER = 13;
const KEY_ESC = 27;

class SelectFromTreeDialog extends React.Component {
  state = {
    checkedItems: [],
  };

  componentDidMount() {
    document.addEventListener('keydown', this.keyListener);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.keyListener);
  }

  /** @param {KeyboardEvent} event */
  keyListener = (event) => {
    switch (event.keyCode) {
    case KEY_ENTER:
      return this.handleOk();
    case KEY_ESC:
      return this.handleClose();
    }
  };

  handleClose = () => {
    this.props.onClose();
    this.props.destroy();
  };

  handleOk = () => {
    if (this.state.checkedItems.length == 0) return;

    this.props.onOk(this.state.checkedItems);
    this.props.destroy();
  };

  handleClick = (item) => {
    this.setState({ checkedItems: [item._id] });
  };

  render() {
    const { props, state } = this;

    return (
      <div className="simpleDialog moveCollectionDialog">
        <div className="simpleDialogUnderlayer" />
        <div className="simpleDialogBox" style={props.style}>
          <div className="simpleDialogHeader">
            <span className="simpleDialogTitle">
              <Choose>
                <When condition={typeof props.title === 'function'}>
                  {props.title(props.collectionToMove.name)}
                </When>
                <Otherwise>{props.title}</Otherwise>
              </Choose>
            </span>
            <span className="simpleDialogBtnCross" onClick={this.handleClose}>
              <Icon name="close" />
            </span>
          </div>
          <div className="simpleDialogContent">
            <div className="simpleDialogContentInner">
              <DropdownTreeWithStore
                checkedItems={this.state.checkedItems}
                openedItems={props.openedItems}
                treeListItems={props.treeListItems || []}
                onClick={this.handleClick}
                onLoadChildren={this.props.onLoadChildren}
                iconSpecial={props.iconSpecial}
                collectionToMove={props.collectionToMove}
                type={this.props.type}
                disabledItems={props.disabledItems}
              />
            </div>
          </div>
          <div className="simpleDialogFooter">
            <If condition={props.textBtnCancel !== null}>
              <span className="simpleDialogFooterBtn simpleDialogFooterBtnCancel" onClick={this.handleClose}>
                {props.textBtnCancel}
              </span>
            </If>
            <If condition={props.textBtnOk !== null}>
              <span
                className={cn('simpleDialogFooterBtn', { disabled: state.checkedItems.length === 0 })}
                onClick={this.handleOk}
              >
                {props.textBtnOk}
              </span>
            </If>
          </div>
        </div>
      </div>
    );
  }
}

/** Prop types */
SelectFromTreeDialog.propTypes = {
  treeListItems: PropTypes.array,
  onLoadChildren: PropTypes.func,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  style: PropTypes.object,
  textBtnOk: PropTypes.string,
  textBtnCancel: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  collectionToMove: PropTypes.object,
  iconSpecial: PropTypes.string,
  disabledItems: PropTypes.arrayOf(PropTypes.string),
};

/** Default props */
SelectFromTreeDialog.defaultProps = {
  title: '',
  style: {},
  onClose: () => {},
  textBtnOk: localization.DIALOGS.btnOk,
  textBtnCancel: localization.DIALOGS.btnCancel,
  collectionToMove: {},
  iconSpecial: 'folder',
  disabledItems: null,
};

export default SelectFromTreeDialog;
