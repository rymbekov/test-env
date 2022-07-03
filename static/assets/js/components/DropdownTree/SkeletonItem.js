import React from 'react';
import Skeleton from 'react-loading-skeleton';
import PropTypes from 'prop-types';
import WithSkeletonTheme from '../WithSkeletonTheme';
import DropdownTreeIcon from './DropdownTreeIcon';

export default function SkeletonItem({ itemPaddingLeft, level, iconSpecial }) {
  return (
    <WithSkeletonTheme>
      <div className="row" style={{ paddingLeft: itemPaddingLeft * (level + 1) }}>
        <span className="iconSubject">
          <DropdownTreeIcon iconSpecial={iconSpecial} />
        </span>
        <span className="dropdownTreeItemName">
          <Skeleton width={120} height={16} />
        </span>
      </div>
      <div className="row" style={{ paddingLeft: itemPaddingLeft * (level + 1) }}>
        <span className="iconSubject">
          <DropdownTreeIcon iconSpecial={iconSpecial} />
        </span>
        <span className="dropdownTreeItemName">
          <Skeleton width={160} height={16} />
        </span>
      </div>
      <div className="row" style={{ paddingLeft: itemPaddingLeft * (level + 1) }}>
        <span className="iconSubject">
          <DropdownTreeIcon iconSpecial={iconSpecial} />
        </span>
        <span className="dropdownTreeItemName">
          <Skeleton width={220} height={16} />
        </span>
      </div>
    </WithSkeletonTheme>
  );
}

/** default props */
SkeletonItem.defaultProps = {
  iconSpecial: null,
  itemPaddingLeft: 15,
  level: 0,
};

SkeletonItem.propTypes = {
  iconSpecial: PropTypes.string,
  itemPaddingLeft: PropTypes.number,
  level: PropTypes.number,
};
