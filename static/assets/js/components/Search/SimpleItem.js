import React from 'react'; // eslint-disable-line
import { string, bool } from 'prop-types';
import cn from 'classnames';

function SimpleItem({ label, children, additionaClass }) {
  return (
    <div
      className={cn({
        itemSearchFilters: true,
        itemSearchFiltersRight: additionaClass,
      })}
    >
      <div className="labelItemSearchFilters">{label}</div>
      <div className="contentItemSearchFilters">{children}</div>
    </div>
  );
}

SimpleItem.propTypes = {
  label: string,
  additionaClass: bool,
};

export default SimpleItem;
