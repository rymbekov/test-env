import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'classnames';
import { ToolbarMenu, ToolbarMenuItem, IconButton } from '@picsio/ui';
import {
  ClockIcon,
  TriangleDownIcon,
} from '@picsio/ui/dist/icons/';
import _find from 'lodash/find';

import defaultSorts from './defaultSorts';

const checkActiveSort = (items, activeSort) => {
  const { type } = activeSort;
  const isExist = !!_find(items, { id: type });

  if (isExist) {
    return activeSort;
  }
  return {
    type: null,
    order: 'asc',
  };
};

const SearchBarSort = (props) => {
  const { activeSort, onSort, sortItems, hiddenSorts } = props;
  const ref = useRef(null);
  const [open, setOpen] = useState(false);

  const items = sortItems.filter((i) => !hiddenSorts.includes(i.id));
  const { type, order } = checkActiveSort(items, activeSort);
  const isAsc = order === 'asc';
  const activeItem = _find(items, { id: type }) || {};
  const { icon: activeIcon } = activeItem;

  const toggle = () => setOpen(prevValue => !prevValue);

  return (
    <div className={clsx('searchBar-sort', { 'is-active': open })}>
      <IconButton ref={ref} onClick={toggle} color="inherit" componentProps={{ 'data-qa-id': 'collectionSortButton' }}>
        <>
          <Choose>
            <When condition={activeIcon}>
              {activeIcon}
            </When>
            <Otherwise>
              <ClockIcon />
            </Otherwise>
          </Choose>
          <TriangleDownIcon
            className={clsx('sortArrow', {
              asc: isAsc,
            })}
          />
        </>
      </IconButton>
      <ToolbarMenu
        ref={ref}
        className="sortMenu"
        isOpen={open}
        onClose={toggle}
        arrow={false}
        placement="bottom-start"
        PopperProps={{
          hide: false,
          offset: [0, 5],
          style: {
            width: 300,
          },
        }}
      >
        {items.map(({ id, text, icon, separator, sort, sortOptions }) => (
          <ToolbarMenuItem
            key={id}
            id={id}
            text={text}
            icon={icon}
            separator={separator}
            sort={sort}
            sortType={id}
            sortOptions={sortOptions}
            activeSort={activeSort}
            onSort={onSort}
          />
        ))}
      </ToolbarMenu>
    </div>
  );
}

SearchBarSort.defaultProps = {
  sortItems: defaultSorts,
  hiddenSorts: [],
};
SearchBarSort.propTypes = {
  sortItems: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    text: PropTypes.string,
    icon: PropTypes.oneOfType([PropTypes.node, PropTypes.object]),
    sort: PropTypes.bool,
    separator: PropTypes.bool,
    sortOptions: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.string])),
  })),
  activeSort: PropTypes.shape({
    type: PropTypes.string,
    order: PropTypes.string,
  }).isRequired,
  onSort: PropTypes.func.isRequired,
  hiddenSorts: PropTypes.arrayOf(PropTypes.string),
};

export default SearchBarSort;
