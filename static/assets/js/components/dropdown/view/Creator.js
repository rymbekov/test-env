/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { memo } from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import TruncateMarkup from 'react-truncate-markup';
import Tag from '../../Tag';

const DropDownCreator = (props) => {
  const { item, checked, highlighted, style } = props;

  const { newItems, onClick } = item;

  const leftEllipsis = (node) => {
    const childred = node.props.children;
    const itemsRenderedLength = childred[childred.length - 1].length;

    return <span>{`and ${newItems.length - itemsRenderedLength} more`}</span>;
  };

  return (
    <div
      className={cn('dropdown-item', { active: checked, highlighted })}
      onClick={onClick}
      style={style}
    >
      <div className="dropdown-item-text">
        <TruncateMarkup lines={1} lineHeight="24px" ellipsis={leftEllipsis}>
          <div className="dropdown-creator">
            Create{' '}
            {newItems.map((i) => {
              return (
                <TruncateMarkup.Atom key={`creator${i}`}>
                  <Tag type={item.type} text={i} />
                </TruncateMarkup.Atom>
              );
            })}
          </div>
        </TruncateMarkup>
      </div>
    </div>
  );
};

DropDownCreator.propTypes = {
  item: PropTypes.shape({
    newItems: PropTypes.arrayOf(PropTypes.string),
    onClick: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
  highlighted: PropTypes.bool.isRequired,
  checked: PropTypes.bool.isRequired,
};

export default memo(DropDownCreator);
