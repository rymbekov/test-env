/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { memo } from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import Avatar from '../../Avatar';
import Icon from '../../Icon';

const DropDownItem = (props) => {
  const { item, checked, highlighted, toggleCheck, style } = props;

  return (
    <div
      className={cn('dropdown-item', { active: checked, highlighted })}
      onClick={toggleCheck}
      style={style}
    >
      <Icon name="ok" />
      <If condition={item.url || item.url === null || item.url === ""}>
        <Avatar src={item.url} username={item.title} size={30} />
      </If>
      <div className="dropdown-item-text">
        <If condition={item.title}>
          <div className="dropdown-item-title">{item.title}</div>
        </If>
        <If condition={item.descr}>
          <div className="dropdown-item-descr">{item.descr}</div>
        </If>
      </div>
    </div>
  );
};

DropDownItem.propTypes = {
  item: PropTypes.shape({
    url: PropTypes.string,
    title: PropTypes.string,
    descr: PropTypes.string,
  }).isRequired,
  toggleCheck: PropTypes.func.isRequired,
  highlighted: PropTypes.bool.isRequired,
  checked: PropTypes.bool.isRequired,
};

export default memo(DropDownItem);
