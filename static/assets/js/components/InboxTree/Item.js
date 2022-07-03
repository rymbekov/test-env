import React from 'react';
import ReactDOM from 'react-dom';
import {
  object, objectOf, func, string, arrayOf,
} from 'prop-types';
import cn from 'classnames';

import { CSSTransition } from 'react-transition-group';

import outy from 'outy';
import {
  Popper, Hidden, IconButton, Icon as UiIcon,
} from '@picsio/ui';
import {
  DotsVertical,
  CopyToClipboard,
  Delete,
  Edit,
  Web,
  Inbox,
} from '@picsio/ui/dist/icons';
import localization from '../../shared/strings';
import picsioConfig from '../../../../../config';
import ua from '../../ua';
import Icon from '../Icon';
import Logger from '../../services/Logger';
import Swipeable from '../Swipeable';
import { navigate } from '../../helpers/history';
import TreeButton from '../TreeButton';
import TreeMenuItem from '../TreeMenuItem';
import copyTextToClipboard from '../../helpers/copyTextToClipboard';

const holdTime = 500; // ms
const holdDistance = 3 ** 2; // pixels squared

export default class Item extends React.Component {
  isMobile = ua.browser.isNotDesktop();

  btnCLicked = false;

  liStyle = { paddingLeft: 38 };

  $item = React.createRef();

  $dropItem = React.createRef();

  $target = React.createRef();

  state = {
    isRenaming: false,
    isValid: true,
    isMenuOpen: false,
    isNotUploading: true,
    clickPosition: [0, 0],
  };

  componentWillUnmount() {
    this.outsideTap && this.outsideTap.remove();
  }

  setOutsideTap = () => {
    const elements = [this.$target.current];

    if (this.outsideTap) {
      this.outsideTap.remove();
    }

    this.outsideTap = outy(elements, ['click'], this.handleOutsideTap);
  };

  handleOutsideTap = () => {
    const popperWrapper = document.querySelector('.popperWrapper');
    this.setState({ isMenuOpen: false });
    popperWrapper.classList.remove('active');
    this.outsideTap && this.outsideTap.remove();
  };

  handleTargetClick = (event) => {
    const popperWrapper = document.querySelector('.popperWrapper');
    event.stopPropagation();
    this.setOutsideTap();
    this.setState((prevState) => ({
      isMenuOpen: !prevState.isMenuOpen,
    }));
    popperWrapper.classList.toggle('active');
  };

  handleSwipeDown = (eventData) => {
    const { dir, velocity } = eventData;
    if (dir === 'Down' && velocity > 0.7) {
      this.handleOutsideTap();
    }
  };

  /**
   * Copy inbox url to clipboard
   * @param {MouseEvent} event
   */
  copyToClipboard = (event) => {
    event.stopPropagation();
    const { node } = this.props;
    const inboxURL = node.alias;
    const toastText = localization.DETAILS.inboxUrlCopied;
    copyTextToClipboard(inboxURL, toastText);
  };

  handleOpenInboxSettings = (event) => {
    const { node } = this.props;
    event.stopPropagation();
    Logger.log('User', 'InboxSettings', { collectionId: node._id });
    navigate(`/inbox/${node._id}?tab=main`);
  };

  refTextareaRename = (textarea) => (this.textareaRename = textarea);

  generateTitleAndBtns = () => {
    const { handlers, node } = this.props;
    let title = node.name;
    let buttons = null;

    if (!this.state.isRenaming) {
      const btns = [];
      let btnShare = null;

      /** Share */
      if (picsioConfig.isMainApp()) {
        btnShare = {
          icon: () => <Web />,
          additionalClassName: 'treeMenuItemRemoveCopy',
          tooltip: localization.INBOXESTREE.textInboxSettings,
          menuName: localization.INBOXESTREE.textInboxSettings,
          onClick: (event) => {
            this.handleOpenInboxSettings(event);
            Logger.log('User', 'InboxesPanelPublishToWeb', { collectionId: this.props.node._id });
          },
        };

        if (ua.browser.isNotDesktop()) {
          btns.push(btnShare);
        }
      }

      /** Remove */
      if (handlers.remove) {
        btns.push(
          {
            icon: () => <Delete />,
            additionalClassName: 'treeMenuItemRemove',
            tooltip: localization.INBOXESTREE.textDelete,
            menuName: localization.INBOXESTREE.textDelete,
            onClick: (event) => {
              this.handleRemove(event);
              Logger.log('User', 'InboxesPanelDeleteInbox', { inboxId: this.props.node._id });
            },
          },
        );
      }

      /** Rename */
      if (handlers.rename) {
        btns.push(
          {
            icon: () => <Edit />,
            additionalClassName: 'treeMenuItemRename',
            tooltip: localization.INBOXESTREE.textRename,
            menuName: localization.INBOXESTREE.textRename,
            onClick: (event) => {
              this.setRenaming(event);
              Logger.log('User', 'InboxesPanelRenameInbox', { inboxId: this.props.node._id });
            },
          },
        );
      }

      /** Copy to clipboard */
      if (picsioConfig.isMainApp()) {
        btns.push(
          {
            icon: () => <UiIcon size="sm" color="inherit"><CopyToClipboard /></UiIcon>,
            additionalClassName: 'treeMenuItemRemoveCopy',
            tooltip: localization.INBOXESTREE.textCopyInboxLink,
            menuName: localization.INBOXESTREE.textCopyInboxLink,
            onClick: this.copyToClipboard,
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
            />
          ))}
          {!ua.browser.isNotDesktop() && (
            <TreeButton
              key={btnShare.icon}
              icon={btnShare.icon}
              className={btnShare.className}
              additionalClassName={btnShare.additionalClassName}
              tooltip={btnShare.tooltip}
              onClick={btnShare.onClick}
            />
          )}
        </div>
      );

      const moreBtns = (
        <>
          <Hidden implementation="js" desktopUp>
            <div className="moreBtns" ref={this.$target}>
              <IconButton
                buttonSize="default"
                className={cn('btnCollection btnCollectionOpener', { act: this.state.isMenuOpen })}
                color="default"
                component="button"
                onClick={this.handleTargetClick}
                size="lg"
              >
                <DotsVertical />
              </IconButton>
              <CSSTransition
                unmountOnExit={this.state.isNotUploading}
                in={this.state.isMenuOpen}
                timeout={1000}
                classNames="bottomPanelSlide"
              >
                <>
                  {ReactDOM.createPortal(
                    <Swipeable className="SwipeableDialog" onSwipedDown={this.handleSwipeDown}>
                      <div className="treeMenu" role="navigation" aria-label="Collection settings">
                        <header
                          className="treeMenuHeader"
                          onClick={this.handleTargetClick}
                          role="button"
                        >
                          <div className="treeMenuName">Operations</div>
                          <span className="treeMenuClose">
                            <Icon name="close" />
                          </span>
                        </header>
                        {/* {btns} */}
                        {btns.map((btn) => (
                          <TreeMenuItem
                            key={btn.icon}
                            icon={btn.icon}
                            className={btn.className}
                            additionalClassName={btn.additionalClassName}
                            tooltip={btn.tooltip}
                            menuName={btn.menuName}
                            onClick={btn.onClick}
                          />
                        ))}
                      </div>
                    </Swipeable>,
                    document.querySelector('.popperWrapper'),
                  )}
                </>
              </CSSTransition>
            </div>
          </Hidden>
          <Hidden implementation="js" desktopDown>
            <div className="moreBtns" ref={this.$target}>
              <IconButton
                buttonSize="default"
                className={cn('btnCollection btnCollectionOpener', { act: this.state.isMenuOpen })}
                color="default"
                component="button"
                onClick={this.handleTargetClick}
                size="lg"
              >
                <DotsVertical />
              </IconButton>
              <Popper
                target={this.$target}
                isOpen={this.state.isMenuOpen}
                onClose={() => this.setState((prevState) => ({
                  isMenuOpen: !prevState.isMenuOpen,
                }))}
                placement="right-start"
                disablePortal={false}
                offset={[0, 10]}
                hide={false}
                arrow
                autoWidth
                outsideClickListener
                portalContainer={document.querySelector('.popperWrapper')}
              >
                <div className="treeMenu" role="navigation" aria-label="Collection settings">
                  <header className="treeMenuHeader" onClick={this.handleTargetClick} role="button">
                    <div className="treeMenuName">Operations</div>
                    <span className="treeMenuClose">
                      <Icon name="close" />
                    </span>
                  </header>
                  {btns.map((btn) => (
                    <TreeMenuItem
                      key={btn.icon}
                      icon={btn.icon}
                      className={btn.className}
                      additionalClassName={btn.additionalClassName}
                      menuName={btn.menuName}
                      onClick={btn.onClick}
                    />
                  ))}
                </div>
              </Popper>
            </div>
          </Hidden>
        </>
      );

      buttons = (
        <div className="btnsManageCollection leftShadow">
          {moreBtns}
          {!ua.browser.isNotDesktop() && (
            <TreeButton
              key={btnShare.icon}
              icon={btnShare.icon}
              className={btnShare.className}
              tooltip={btnShare.tooltip}
              onClick={btnShare.onClick}
            />
          )}
        </div>
      );
      return { title, buttons };
    }

    title = (
      <textarea
        className={cn('collectionTextValue', { error: !this.state.isValid })}
        defaultValue={decodeURIComponent(title)}
        onClick={this.stopPropagation}
        onKeyDown={this.onKeyDownTextarea}
        onBlur={this.onBlurRename}
        onChange={this.onChangeTextarea}
        ref={this.refTextareaRename}
      />
    );
    buttons = (
      <div className="btnsEditCollection leftShadow">
        <TreeButton
          key="ok"
          icon="ok"
          additionalClassName={cn('btnOkFolder', { disabled: !this.state.isValid })}
          tooltip={localization.INBOXESTREE.textSave}
          onClick={this.doRename}
        />
        <TreeButton
          key="cancel"
          icon="close"
          additionalClassName="btnCancelFolder"
          tooltip={localization.INBOXESTREE.textCancel}
          onClick={this.handleClickCancel}
        />
      </div>
    );
    return { title, buttons };
  };

  handleRemove = (event) => {
    Logger.log('User', 'InboxesPanelDeleteInbox');
    const { _id, name } = this.props.node;
    event.stopPropagation();
    this.setState({ isMenuOpen: false });
    this.props.handlers.remove(_id, name);
  };

  onDoubleClickName = (event) => {
    event.stopPropagation();
    if (event.target.classList.contains('collectionTextValue')) {
      this.setRenaming(event);
    }
  };

  setRenaming = (event) => {
    event.stopPropagation();
    Logger.log('User', 'InboxesPanelRenameInbox', { inboxId: this.props.node._id });
    this.setState({ isRenaming: true }, () => this.textareaRename && this.textareaRename.select());
  };

  doRename = (event) => {
    Logger.log('User', 'InboxesPanelRenameInboxOK');
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
    if (value === this.props.name) return this.cancelRenaming(event);

    this.props.handlers.rename({ id: this.props.node._id, name: value });
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
      Logger.log('User', 'InboxesPanelRenameInboxCancel');
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
          Logger.log('User', 'InboxesPanelRenameInboxOK');
          this.rename(value);
        } else {
          Logger.log('User', 'InboxesPanelRenameInboxCancel');
          this.cancelRenaming(event);
        }
      }
    }, 200);
  };

  onChangeTextarea = (event) => this.validate(event.target.value);

  validate = (_value) => {
    const value = _value.trim().toLowerCase();
    const nodes = this.props.allInboxes;
    let isValid = true;
    const checkName = (item) => decodeURIComponent(item.name.toLowerCase()) === decodeURIComponent(value);

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
    this.setState({ isValid: true, isRenaming: false, isMenuOpen: false });
  };

  handleClickCancel = (event) => {
    Logger.log('User', 'InboxesPanelRenameInboxCancel');
    event.stopPropagation();
    this.cancelRenaming(event);
  };

  onMouseOver = () => {
    this.$item.current.classList.add('hover');
  };

  onMouseLeave = () => {
    this.$item.current.classList.remove('hover');
  };

  onTouchStart = (event) => {
    const { clientX, clientY } = event.touches[0];
    this.setState({ clickPosition: [clientX, clientY] });
    event.persist();
    this.buttonPressTimer = setTimeout(() => {
      this.handleTargetClick(event);
    }, holdTime);
  };

  onPointerMove = (event) => {
    // cancel hold operation if moved too much
    const { clientX, clientY } = event;
    const { clickPosition } = this.state;
    if (this.buttonPressTimer) {
      const d = (clientX - clickPosition[0]) ** 2 + (clientY - clickPosition[1]) ** 2;
      if (d > holdDistance) {
        window.clearTimeout(this.buttonPressTimer);
      }
    }
  };

  onTouchEnd = () => {
    clearTimeout(this.buttonPressTimer);
  };

  onClickItem = () => {
    this.props.handlers.item(this.props.node._id);
  };

  /**
   * Handle click on button upload
   * @param {MouseEvent|TouchEvent} event
   */
  handleClickUpload = (event) => {
    Logger.log('User', 'InboxesPanelUpload');
    event.stopPropagation();
    this.props.handlers.uploadClick(this.props.node._id);
  };

  render() {
    const { props, state } = this;
    const { title, buttons } = this.generateTitleAndBtns();
    const itemClassName = cn('nameFolder', {
      act: props.activeInbox === props.node._id,
      menuActive: state.isMenuOpen,
      editModeFolder: state.isRenaming,
      disabled: props.node.isRenaming || props.node.isBusy,
    });
    const { isShared } = props.node;

    return (
      <li
        className={cn({
          addedByTeammate: props.node.addedByTeammate,
          deletedByTeammate: props.node.deletedByTeammate,
        })}
      >
        <span
          className={itemClassName}
          onClick={this.onClickItem}
          onDoubleClick={this.onDoubleClickName}
          style={this.liStyle}
          onMouseOver={this.onMouseOver}
          onMouseLeave={this.onMouseLeave}
          onTouchStart={this.onTouchStart}
          onTouchEnd={this.onTouchEnd}
          onPointerMove={this.onPointerMove}
          ref={this.$item}
        >
          <span className="iconHolder">
            <UiIcon size="md" color="inherit">
              <Choose>
                <When condition={isShared}>
                  <Web />
                </When>
                <Otherwise>
                  <Inbox />
                </Otherwise>
              </Choose>
            </UiIcon>
          </span>
          {buttons}
          {title}
        </span>
      </li>
    );
  }
}

Item.propTypes = {
  handlers: objectOf(func).isRequired,
  node: object.isRequired,
  allInboxes: arrayOf(object).isRequired,
  activeInbox: string,
};
