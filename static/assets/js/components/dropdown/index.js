import React from 'react';
import PropTypes from 'prop-types';
import throttle from 'lodash.throttle';
import cn from 'classnames';
import uniq from 'lodash.uniq';
import { AutoSizer, List } from 'react-virtualized';
import styled from 'styled-components';
import { Popper } from '@picsio/ui';
import _orderBy from 'lodash/orderBy';
import localization from '../../shared/strings';
import Tag from '../Tag';
import Icon from '../Icon';
import * as utils from '../../shared/utils';
import ua from '../../ua';
import Logger from '../../services/Logger';
import Item from './view/item';
import Creator from './view/Creator';
import ModifiedField from '../details/view/ModifiedField';
import 'react-virtualized/styles.css';

class Dropdown extends React.Component {
  constructor(props) {
    super(props);
    this.lastFilter = null;
    this.creating = false;
    this.dropdownElement = React.createRef();
    this.dropdownBodyWrapper = React.createRef();
    this.dropdownInput = React.createRef();
    this.dropdownInputInner = React.createRef(); // @TODO: do we need it?
    this.dropdownList = React.createRef();

    this.state = {
      focusedIndex: null,
      filterValue: '',
      filter: [],
      isDropdownOpened: false,
      // createLinkVisible: false, // @TODO: temporary remove, because added 'Creator'. Will remove latter.
      filteredItems: [],
      newItems: [],
      rowHeight: 0,
    };

    this.throttledKeyDownHandler = throttle(this.throttledKeyDownHandler, 160);
  }

  componentDidMount() {
    this.setState({ rowHeight: this.props.type !== 'user' ? 39 : 48 });
    if (this.props.autoFocus && this.dropdownInput && this.dropdownInput.current) {
      this.dropdownInput.current.focus();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.handleWindowClick);
    window.removeEventListener('touchstart', this.handleWindowClick);
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps.checkedItems) !== JSON.stringify(this.props.checkedItems)) {
      this.updateView();
    }

    if (
      this.creating
      && this.lastFilter !== null
      && prevProps.items.length !== this.props.items.length
    ) {
      let filteredItems = this.lastFilter.split(',');
      filteredItems = filteredItems.map((item) => item.trim());
      const checkedItems = this.props.items.filter((item) => filteredItems.includes(item.title));
      if (checkedItems.length) {
        this.props.onCheckedHandler(checkedItems);
        this.lastFilter = null;
        this.creating = false;
      }
    }

    if (this.props.autoFocus && this.dropdownInput && this.dropdownInput.current) {
      this.dropdownInput.current.focus();
    }
  }

  updateView() {
    this.setFilter('');
  }

  handleWindowClick = (event) => {
    const dropdownElement = this.dropdownElement.current;
    if (
      event.target !== dropdownElement
      && !event.target.classList.contains('btnRemove')
      && !this.dropdownBodyWrapper.current.contains(event.target)
      && !dropdownElement.contains(event.target)
      && this.state.isDropdownOpened === true
      && !this.props.autoFocus
    ) {
      this.hideDropdown();
    }
  };

  openDropdown = () => {
    document.body.classList.add('dropdownIsActive');
    this.dropdownInput.current.focus();
    this.setState({ isDropdownOpened: true });

    window.addEventListener('click', this.handleWindowClick);
    window.addEventListener('touchstart', this.handleWindowClick);
  };

  hideDropdown = () => {
    document.body.classList.remove('dropdownIsActive');
    this.dropdownInput && this.dropdownInput.current && this.dropdownInput.current.blur();
    window.removeEventListener('click', this.handleWindowClick);
    window.removeEventListener('touchstart', this.handleWindowClick);
    if (this.props.onBlur) {
      this.props.onBlur();
    }
    this.setState({ focusedIndex: null, isDropdownOpened: false });
  };

  onChangeHandler = (event) => {
    this.setFilter(utils.sanitizeXSS(event.target.value));
  };

  filterItem = (item, filterValues) => {
    if (filterValues.length === 0) return true;
    const name = item.title.toLowerCase();
    return filterValues.some((item) => name.includes(item.toLowerCase()));
  };

  setFilter = (value) => {
    let { focusedIndex } = this.state;
    let newItems = [];

    const normalizedValue = value.replace(/,  +/g, ', ');
    let filter = normalizedValue.split(',').map((item) => item.trim());
    let words = normalizedValue.split(/[\s,]+/).map((item) => item.trim());
    filter = uniq(filter);
    words = uniq(words);
    words = words.filter((word) => word !== '');

    // remove Whitespace-only Array Elements
    filter = filter.filter((str) => /\S/.test(str));
    newItems = this.getItemsDifference(filter);

    let filteredItems = (this.props.items || []).filter((item) => this.filterItem(item, words));
    let relevanceItems = [];
    if (filteredItems.length && filter.length) {
      relevanceItems = filteredItems.map((entry) => {
        let points = 0;
        const titleNormalized = entry.title.toLowerCase();
        const searchValue = filter[0];
        const searchValueNormalized = searchValue.toLowerCase();

        if (titleNormalized.includes(searchValueNormalized)) {
          points += 1;
        }

        if (titleNormalized.startsWith(searchValueNormalized)) {
          points += 1;
        }

        if (titleNormalized === searchValueNormalized) {
          points += 1;
        }

        if (entry.title === searchValue) {
          points += 1;
        }

        if (words.every((item) => titleNormalized.includes(item.toLowerCase()))) {
          points += 1;
        }

        if (words.every((item) => entry.title.includes(item))) {
          points += 1;
        }

        return { ...entry, points };
      });

      relevanceItems = _orderBy(relevanceItems, ['points', 'title'], ['desc', 'asc']);

      filteredItems = relevanceItems;
    }

    if (
      filteredItems.length === 0
      || focusedIndex >= filteredItems.length
      || focusedIndex === null
    ) {
      focusedIndex = 0;
    }

    if (this.props.createHandler && this.showCreateLink(value, filteredItems)) {
      if (newItems.length) {
        const creator = {
          creator: true,
          type: this.props.type,
          onClick: this.props.createHandler ? this.createItems : this.attachItems,
          value,
          filter,
          newItems,
        };
        filteredItems = [creator, ...filteredItems];
        this.dropdownList
          && this.dropdownList.current
          && this.dropdownList.current.forceUpdateGrid();
      }
    }

    this.setState({
      filterValue: value,
      filter,
      newItems,
      filteredItems,
      focusedIndex,
    });
  };

  showCreateLink = (value, _filteredItems) => {
    const filteredItems = _filteredItems || this.state.filteredItems;

    const isItemsContainValue = filteredItems.some(
      (item) => item.title && item.title.toLowerCase() === value.toLowerCase(),
    );
    return value !== '' && !isItemsContainValue;
  };

  resetFilter = () => {
    this.setState({
      newItems: [],
      filterValue: '',
      filter: [],
      filteredItems: [],
    });
  };

  toggleCheck = (item) => {
    const { checkedItems, onCheckedHandler, onUncheckedHandler } = this.props;
    const { filteredItems } = this.state;

    if (!item) {
      return;
    }
    const itemIndex = checkedItems.findIndex((checkedItem) => checkedItem._id === item._id);
    const itemIndexInList = filteredItems.findIndex((checkedItem) => checkedItem._id === item._id);

    if (itemIndex === -1) {
      this.setState({ focusedIndex: itemIndexInList }, () => {
        onCheckedHandler(item);
        this.dropdownInput.current.focus();
      });
    } else {
      this.setState({ focusedIndex: itemIndexInList }, () => {
        onUncheckedHandler(item);
        this.dropdownInput.current.focus();
      });
    }
  };

  removeItem(event, item) {
    event.stopPropagation();
    if (!item) {
      return;
    }

    this.props.onUncheckedHandler(item);

    if (this.state.isDropdownOpened) {
      this.dropdownInput.current.focus();
    }
  }

  focusHandler = (event) => {
    const { isDropdownOpened } = this.state;
    if (!isDropdownOpened) {
      this.openDropdown();
    }
    let value = '';
    if (event.target && event.target.value) {
      value = event.target.value;
    }
    this.setFilter(value);
  };

  throttledKeyDownHandler = (event) => {
    const { keyCode, shiftKey, altKey } = event;
    let { focusedIndex } = this.state;
    const { filter, filteredItems, newItems } = this.state;
    const { isItemsLoaded, isOnlyCreate, createHandler } = this.props;

    // Up
    if (keyCode === 38) {
      event.preventDefault();
      focusedIndex = focusedIndex !== null ? focusedIndex - 1 : 0;
      if (focusedIndex < 0) return;
    }

    // Down
    if (keyCode === 40) {
      event.preventDefault();
      focusedIndex = focusedIndex !== null ? focusedIndex + 1 : 0;
      if (focusedIndex > filteredItems.length - 1) return;
    }

    // Enter
    if (keyCode === 13 && focusedIndex !== null) {
      if (!isItemsLoaded) return;

      // Alt + Enter
      if (altKey && filter.length === 1) {
        // Toogle 100% identical from filtered values
        const ideticalValueIndex = filteredItems.findIndex(
          (item) => item.title?.toLowerCase() === filter[0].toLowerCase(),
        );
        if (ideticalValueIndex !== -1) {
          Logger.log('User', 'DropdownPressedAltEnter');
          return this.toggleCheck(filteredItems[ideticalValueIndex]);
        }
      }

      // Shift + Enter
      if (shiftKey && filter.length === 1) {
        // Handle creator if it exists
        const creatorIndex = filteredItems.findIndex((item) => item.creator);
        if (creatorIndex !== -1) {
          Logger.log('User', 'DropdownPressedShiftEnter');
          return filteredItems[creatorIndex].onClick();
        }
      }

      if (filter.length > 1) {
        if (isOnlyCreate) {
          if (filteredItems.length === 0 && newItems.length) {
            this.createItems();
          } else {
            this.attachItems();
          }
        } else if (createHandler) {
          this.createItems();
        } else {
          this.attachItems();
        }
        return;
      }

      if (filter.length === 1 && filteredItems.length === 0 && createHandler) {
        this.createItems();
      }

      // Handle creator by Enter
      if (filteredItems.length && filteredItems[focusedIndex].creator) {
        return filteredItems[focusedIndex].onClick();
      }

      return this.toggleCheck(filteredItems[focusedIndex]);
    }

    // Esc
    if (keyCode === 27) {
      if (this.state.filter.length === 0) {
        this.hideDropdown();
        return;
      }
      this.setFilter('', 1);
      return;
    }

    // Backspace
    if (keyCode === 8) {
      this.removeLastItem();
    }

    // Tab
    if (event.keyCode === 9) {
      this.hideDropdown();
      return;
    }

    this.setState({ focusedIndex });
  };

  keyDownHandler = (event) => {
    event.persist();
    this.throttledKeyDownHandler(event);
  };

  getItemsDifference = (items) => {
    const newItems = [];

    items.forEach((item) => {
      if (!this.props.items.some((i) => i.title.toLowerCase() === item.toLowerCase())) {
        newItems.push(item);
      }
    });

    return newItems;
  };

  createItems = () => {
    const filteredItems = this.state.filter;
    this.lastFilter = filteredItems.length > 1 ? filteredItems.join(',') : filteredItems[0];
    if (this.props.createHandler) {
      if (this.props.isOnlyCreate) {
        if (filteredItems.length > 1) {
          this.props.createHandler(this.lastFilter, undefined, true);
        } else {
          this.props.createHandler(this.lastFilter.trim());
        }
        this.creating = true;
      } else {
        this.props.onCheckedHandler({ title: filteredItems.join(',') });
      }
    }
  };

  attachItems = () => {
    const { items } = this.props;
    const { filter } = this.state;
    const checkedItems = items.filter((item) => filter.includes(item.title));
    if (checkedItems.length) {
      this.props.onCheckedHandler(checkedItems);
    }
  };

  removeLastItem = () => {
    const { filter } = this.state;
    const { checkedItems } = this.props;

    if (filter.length === 0 || filter[0] === '' || filter === undefined) {
      if (checkedItems.length > 0) {
        this.toggleCheck(checkedItems[checkedItems.length - 1]);
      }
    }
  };

  handleBlur = () => {};

  renderPlaceholder = () => {
    const {
      placeholderIcon, placeholder, createHandler, createPlaceholderText,
    } = this.props;
    const iconClassName = placeholderIcon && `placeholder-icon ${placeholderIcon}`;

    return (
      <div className="dropdown-body">
        <div className="placeholder">
          {iconClassName && (
            <div className={iconClassName}>
              <Icon name={placeholderIcon} />
            </div>
          )}
          {placeholder && <div className="placeholder-text"> {placeholder} </div>}
          {createHandler && <div>{createPlaceholderText}</div>}
        </div>
      </div>
    );
  };

  renderTags = () => {
    const { items, checkedItems, onItemClickHandler } = this.props;
    const { props } = this;
    const selectedTags = [];

    checkedItems.forEach((checkedItem) => {
      const item = items.find((item) => item._id === checkedItem._id);
      if (item) {
        selectedTags.push({
          _id: item._id,
          title: item.title,
          url: item.url,
        });
      }
    });

    return selectedTags.map((item) => (
      <Tag
        type={props.type}
        key={item._id}
        text={item.title}
        avatar={item.url}
        isRole={props.isRole}
        onClick={() => onItemClickHandler(item._id)}
        onClose={!props.readOnly && !props.isClose ? (event) => this.removeItem(event, item) : null}
      />
    ));
  };

  renderCreateLink = () => {
    const { props, state } = this;
    const createText = props.createText || localization.DROPDOWN.create;

    return (
      <div className="dropdown-create-link">
        <span
          className="dropdown-create"
          onClick={props.createHandler ? this.createItems : this.attachItems}
        >
          {props.createHandler && state.newItems.length > 0 && (
            <>
              <Icon name="addCollection" /> {createText}
              {state.newItems.length > 0 && 's'} "
              {state.newItems.length > 0 ? state.newItems.join(', ') : state.filter.join(', ')}"
              <br />
            </>
          )}

          {props.createHandler && state.filter.length > 1 && state.filteredItems.length > 0 && (
            <>
              {props.createHandler && state.newItems.length > 0 && <>and</>} attach{' '}
              {state.filter.length} selected keywords
            </>
          )}
        </span>
      </div>
    );
  };

  rowRenderer = ({ key, index, style }) => {
    const items = this.state.filteredItems;
    const isChecked = Boolean(
      this.props.checkedItems.find((checkedItem) => checkedItem._id === items[index]._id),
    );
    return (
      <Choose>
        <When condition={items[index].creator}>
          <Creator
            key={key}
            item={items[index]}
            checked={isChecked}
            highlighted={index === this.state.focusedIndex}
            style={style}
          />
        </When>
        <Otherwise>
          <Item
            key={key}
            item={items[index]}
            checked={isChecked}
            highlighted={index === this.state.focusedIndex}
            toggleCheck={() => this.toggleCheck(items[index])}
            style={style}
          />
        </Otherwise>
      </Choose>
    );
  };

  render() {
    const {
      filterText,
      items,
      additionalClass,
      disabled,
      icon,
      isItemsLoaded,
      placeholderIcon,
      placeholder,
      createHandler,
      createPlaceholderText,
      readOnly,
      error,
      inProgress,
      highlight,
      modifiedField,
      disablePortal,
      position,
      isClose,
    } = this.props;
    const { props, state } = this;
    const { filteredItems, filter, isDropdownOpened } = state;
    const inputSize = filterText.length || 10;

    let heightOfPopper = 0;

    if (filteredItems.length === 0) {
      heightOfPopper = 74;
    } else if (filteredItems.length > 10) {
      heightOfPopper = state.rowHeight * 10;
    } else {
      heightOfPopper = filteredItems.length * state.rowHeight;
    }

    const placeholderIconClassName = placeholderIcon && `placeholder-icon ${placeholderIcon}`;

    return (
      <div
        className={cn({
          dropdownMainWrapper: true,
          'dropdown-focused': isDropdownOpened,
          highlightBlink: highlight && highlight.includes(props.highlightAnimationResetName),
        })}
        onAnimationEnd={() => props.highlightAnimationReset(props.highlightAnimationResetName)}
        ref={this.dropdownElement}
      >
        <div
          className={cn({
            dropdown: true,
            disabled,
            readOnly,
            'dropdown-focused': isDropdownOpened,
            [additionalClass]: additionalClass,
            isError: error,
            inProgress,
          })}
          ref={(node) => {
            this.node = node;
          }}
        >
          <div
            className={cn('dropdown-tags', {
              'dropdown-tags-icon': props.icon,
              'dropdown-modifiedFeild': modifiedField,
            })}
          >
            <If condition={icon}>
              <Icon name={inProgress ? 'sync' : props.icon} />
            </If>
            <If condition={!readOnly}>
              <div className="dropdown-opener" onClick={() => this.openDropdown()} />
            </If>
            {this.renderTags()}
            <Choose>
              <When condition={!readOnly}>
                <div className="dropdown-filter">
                  <input
                    type="text"
                    ref={this.dropdownInput}
                    size={inputSize}
                    value={state.filterValue}
                    placeholder={filterText}
                    onFocus={this.focusHandler}
                    onKeyDown={this.keyDownHandler}
                    onBlur={this.handleBlur}
                    onChange={this.onChangeHandler}
                    readOnly={!isItemsLoaded}
                  />
                  <If condition={modifiedField}>
                    <ModifiedField field={modifiedField} />
                  </If>
                </div>
              </When>
              <When condition={!props.checkedItems.length}>
                <div className="dropdown-tags-placeholder">{filterText}</div>
              </When>
              <Otherwise>{null}</Otherwise>
            </Choose>
          </div>
          <If condition={isDropdownOpened}>
            <Popper
              target={this.dropdownElement}
              className="dropdownElementPopper"
              isOpen={isDropdownOpened}
              onClose={this.hideDropdown}
              placement={`${((!ua.browser.isNotDesktop() || ua.browser.isTablet()) && position) ? position : 'bottom'}-start`}
              disablePortal={disablePortal}
              offset={[0, 0]}
              hide={false}
              arrow={false}
              autoWidth
              outsideClickListener
            >
              <div
                className={cn('dropdown dropdown-body-wrapper', { inProgress })}
                ref={this.dropdownBodyWrapper}
                style={{ top: position === 'top' && (!ua.browser.isNotDesktop() || ua.browser.isTablet()) && `${-(heightOfPopper + 10)}px` }}
              >
                <If condition={ua.browser.isNotDesktop()}>
                  <>
                    <header className="toolbar dropdown-header">
                      <div className="toolbarGroup">
                        <button
                          className="toolbarButton dropdown-close"
                          onClick={this.hideDropdown}
                          role="button"
                        >
                          <Icon name="regularPrevArrow" />
                        </button>
                      </div>
                      <div className="toolbarGroup">
                        <Choose>
                          <When condition={!readOnly}>
                            <div className="dropdown-filter">
                              <input
                                type="text"
                                ref={this.dropdownInputInner}
                                size={inputSize}
                                value={state.filterValue}
                                placeholder={filterText}
                                onFocus={this.focusHandler}
                                onKeyDown={this.keyDownHandler}
                                onBlur={this.handleBlur}
                                onChange={this.onChangeHandler}
                                readOnly={!isItemsLoaded}
                                autoFocus
                              />
                              {/* <If condition={modifiedField}>
                                <ModifiedField field={modifiedField} />
                              </If> */}
                            </div>
                          </When>
                          <When condition={!props.checkedItems.length}>
                            <div className="dropdown-tags-placeholder">{filterText}</div>
                          </When>
                          <Otherwise>{null}</Otherwise>
                        </Choose>
                      </div>
                    </header>
                    <If condition={props.checkedItems.length}>
                      <div
                        className={cn('dropdown-tags', {
                          'dropdown-tags-icon': props.icon,
                          'dropdown-modifiedFeild': modifiedField,
                        })}
                      >
                        <If condition={icon}>
                          <Icon name={inProgress ? 'sync' : props.icon} />
                        </If>
                        {this.renderTags()}
                      </div>
                    </If>
                  </>
                </If>
                <Choose>
                  <When condition={items.length === 0}>
                    <div className="dropdown-body">
                      <div className="placeholder">
                        <If condition={placeholderIconClassName}>
                          <div className={placeholderIconClassName}>
                            <Icon name={placeholderIcon} />
                          </div>
                        </If>
                        <If condition={placeholder}>
                          <div className="placeholder-text"> {placeholder} </div>
                        </If>
                        <If condition={createHandler}>
                          <div>{createPlaceholderText}</div>
                        </If>
                      </div>
                    </div>
                  </When>
                  <When condition={items.length > 0 || state.filter.length > 0}>
                    <>
                      <DropdownBody
                        className="dropdown-body"
                        ref={(node) => {
                          this.dropdownBody = node;
                        }}
                        itemsLength={filteredItems.length}
                        rowHeight={state.rowHeight}
                        position={position}
                      >
                        <Choose>
                          <When condition={filteredItems.length !== 0}>
                            <AutoSizer>
                              {({ height, width }) => (
                                <List
                                  ref={this.dropdownList}
                                  height={height}
                                  rowCount={filteredItems.length}
                                  rowHeight={state.rowHeight}
                                  rowRenderer={this.rowRenderer}
                                  width={width}
                                  scrollToRow={0}
                                  scrollToIndex={state.focusedIndex || 0}
                                  data={props.checkedItems}
                                />
                              )}
                            </AutoSizer>
                          </When>
                          <Otherwise>
                            <div className="dropdown-noresults">
                              <Choose>
                                <When condition={isItemsLoaded}>{`${
                                  localization.DROPDOWN.noResults
                                } «${filter.join(', ')}»`}
                                </When>
                                <Otherwise>{localization.SPINNERS.LOADING}</Otherwise>
                              </Choose>
                            </div>
                          </Otherwise>
                        </Choose>
                      </DropdownBody>
                      {/* {isItemsLoaded && state.createLinkVisible && this.renderCreateLink()} */}
                    </>
                  </When>
                  <Otherwise>{null}</Otherwise>
                </Choose>
              </div>
            </Popper>
          </If>
        </div>
      </div>
    );
  }
}

Dropdown.defaultProps = {
  inProgress: false,
  disabled: false,
  isOnlyCreate: false,
  isItemsLoaded: true,
  readOnly: false,
  additionalClass: null,
  createText: null,
  filterText: null,
  createPlaceholderText: null,
  placeholderIcon: null,
  placeholder: null,
  icon: null,
  highlight: [],
  highlightAnimationReset: () => {},
  highlightAnimationResetName: null,
  createHandler: () => {},
  onBlur: () => {},
  modifiedField: null,
  onItemClickHandler: () => {},
  onUncheckedHandler: () => {},
  disablePortal: false,
  position: 'bottom',
  isClose: false,
  isRole: false,
};

Dropdown.propTypes = {
  disabled: PropTypes.bool,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      url: PropTypes.string,
      descr: PropTypes.string,
    }),
  ).isRequired,
  isItemsLoaded: PropTypes.bool,
  checkedItems: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onItemClickHandler: PropTypes.func,
  onCheckedHandler: PropTypes.func.isRequired,
  onUncheckedHandler: PropTypes.func,
  createHandler: PropTypes.func,
  icon: PropTypes.string,
  placeholder: PropTypes.string,
  placeholderIcon: PropTypes.string,
  filterText: PropTypes.string,
  additionalClass: PropTypes.string,
  createText: PropTypes.string,
  createPlaceholderText: PropTypes.string,
  onBlur: PropTypes.func,
  highlight: PropTypes.arrayOf(PropTypes.string),
  highlightAnimationReset: PropTypes.func,
  highlightAnimationResetName: PropTypes.string,
  isOnlyCreate: PropTypes.bool,
  type: PropTypes.string.isRequired,
  inProgress: PropTypes.bool,
  modifiedField: PropTypes.shape({
    name: PropTypes.string,
  }),
  readOnly: PropTypes.bool,
  disablePortal: PropTypes.bool,
  position: PropTypes.string,
  isClose: PropTypes.bool,
  isRole: PropTypes.bool,
};

export default Dropdown;

const DropdownBody = styled.div`
  height: ${(props) => `${
    props.itemsLength === 0
      ? 74
      : props.itemsLength > 10
        ? props.rowHeight * 10
        : props.itemsLength * props.rowHeight
  }px`};
`;
