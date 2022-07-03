import React from 'react';
import { object, oneOfType, string, boolean } from 'prop-types';
import cn from 'classnames';
import { Icon } from '@picsio/ui';
import localization from '../../shared/strings';
import ua from '../../ua';
import Logger from '../../services/Logger';

const isMobile = ua.browser.isNotDesktop();

class SortItem extends React.Component {
  handleClick = (event, order) => {
    if (!isMobile) event.stopPropagation(); // desktop sort dropdown doesn't hiding by item clicking
    const { name, sort, changeSort } = this.props;

    const defaultOrder = 'desc';
    const currentSortType = sort.type;

    function setSortOrder() {
      if (name === 'custom') return;
      if (order) {
        return order;
      } if (currentSortType === name) {
        return sort.order === 'asc' ? 'desc' : 'asc';
      }
      return defaultOrder;
    }

    Logger.log('User', 'ChangeSortMode', name);

    if (changeSort) {
      changeSort(name, setSortOrder());
    } else {
      throw new Error('changeSortHandler is undefined');
    }
  };

  render() {
    const {
      children, name, sortConfig, sort, additionalClass, disabled,
    } = this.props;

    return (
      <div
        className={cn('toolbarDropdownItem toolbarDropdownSortItem', {
          active: sort.type === name,
          [additionalClass]: additionalClass,
          disabled,
        })}
        onClick={(event) => this.handleClick(event)}
      >
        <i className="toolbarDropdownItemIcon">
          <Icon size="lg" color="inherit">
            {sortConfig[name].icon()}
          </Icon>
        </i>

        <span className="toolbarDropdownItemText">{localization.SORT[name]}</span>

        {name !== 'custom' ? (
          <div className="sortDirections">
            <span
              onClick={(event) => this.handleClick(event, 'asc')}
              className={cn('sortDirection-asc', {
                'sortDirection-disabled': sort.order !== 'asc',
              })}
            >
              {sortConfig[name].asc}
            </span>
            <span
              onClick={(event) => this.handleClick(event, 'desc')}
              className={cn('sortDirection-desc', {
                'sortDirection-disabled': sort.order !== 'desc',
              })}
            >
              {sortConfig[name].desc}
            </span>
          </div>
        ) : null}
        {children}
      </div>
    );
  }
}

SortItem.propTypes = {
  name: string,
  sortConfig: object,
  sort: oneOfType([string, object]),
  additionalClass: string,
  disabled: boolean,
};

export default SortItem;
