import React from 'react';
import { bool, func, string, number, oneOfType } from 'prop-types';
import cn from 'classnames';
import outy from 'outy';
import { Icon } from '@picsio/ui';
import Button from '../toolbars/Button';
import Tooltip from '../Tooltip';

class DropOpenerSelect extends React.Component {
  state = {
    showDrop: false,
    isToolbarDropdownOpened: false,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.isToolbarDropdownOpened !== prevState.isToolbarDropdownOpened) {
      return {
        isToolbarDropdownOpened: nextProps.isToolbarDropdownOpened,
        showDrop: nextProps.isToolbarDropdownOpened,
      };
    }

    return null;
  }

  handleClick = () => {
    this.setState({ showDrop: !this.state.showDrop }, () => {
      if (this.state.showDrop) {
        this.outsideClick = outy(this.$drop, ['click'], this.handleOutsideClick);
      } else if (this.outsideClick) this.outsideClick.remove();
    });
  };

  handleOutsideClick = () => {
    this.setState({ showDrop: !this.state.showDrop });
    if (this.outsideClick) this.outsideClick.remove();
  };

  setRefButton = (el) => (this.$button = el);

  setRefDrop = (el) => (this.$drop = el);

  render() {
    const { showDrop } = this.state;
    const { children, icon, icon: ControlIcon, additionalClass, tooltip, id, sortName, sortOrder, name } = this.props;
    let className = 'dropOpenerSelect';
    let dropdownStyle;

    if (additionalClass) className += ` ${additionalClass}`;
    if (showDrop) className += ' drop-active';

    return (
      <Tooltip content={tooltip} placement="top">
        <span>
          <div className={className} id={id} onClick={this.handleClick} ref={this.setRefButton}>
            <i className="dropOpenerSelectIcon">
              <Icon size="md" color="inherit">
                <ControlIcon />
              </Icon>
            </i>
            {/* <i className={'dropOpenerSelectIcon ' + icon} /> */}
            <span className="toolbarDropdownItemText">
              {sortName} {sortOrder && ` - ${sortOrder}`}
            </span>
            <div className="toolbarDropdownWrapper" ref={this.setRefDrop} style={dropdownStyle}>
              <div
                className={cn('toolbarDropdown', {
                  [additionalClass]: additionalClass,
                })}
              >
                <header className="toolbarDropdownHeader">
                  <div className="toolbarName">{name || ''}</div>
                  <Button
                    id="button-close"
                    icon="close"
                    onClick={() => this.setState({ showDrop: false })}
                  />
                </header>
                {children}
              </div>
            </div>
          </div>
        </span>
      </Tooltip>
    );
  }
}

DropOpenerSelect.propTypes = {
  icon: oneOfType([string, func]),
  sortTypeOrder: string,
  isActive: bool,
  additionalClass: string,
  onClick: func,
  tooltip: string,
  id: string,
  badge: number,
};

export default DropOpenerSelect;
