/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { memo } from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import localization from '../../../shared/strings';
import Icon from '../../Icon';
import Tooltip from '../../Tooltip';

const CreateButton = (props) => {
  const {
    item,
    actItemId,
    selectItem,
    removeItem,
    renameItem,
    duplicateItem,
    isEditable,
    isDefault,
  } = props;

  return (
    <div
      className={cn('pageTeam__leftSidebar__role', {
        act: item._id === actItemId,
        isError: item.error,
      })}
      onClick={() => {
        selectItem(item._id);
      }}
      key={item._id}
    >
      <div className="pageTeam__leftSidebar__role__name" title={item.name}>
        {item.name}
        {isDefault && <sup>default</sup>}
      </div>
      <div className="pageTeam__leftSidebar__role__manageRole">
        <If condition={isEditable}>
          <Tooltip content={localization.TEAMMATES.textTooltipDelete} placement="top">
            <span
              className="pageTeam__leftSidebar__role__btn"
              onClick={(e) => {
                e.stopPropagation();
                removeItem(item);
              }}
            >
              <Icon name="close" />
            </span>
          </Tooltip>
          <Tooltip content={localization.TEAMMATES.textTooltipEdit} placement="top">
            <span
              className="pageTeam__leftSidebar__role__btn"
              onClick={(e) => {
                e.stopPropagation();
                renameItem(item);
              }}
            >
              <Icon name="pen" />
            </span>
          </Tooltip>
        </If>
        <If condition={duplicateItem}>
          <Tooltip content={localization.TEAMMATES.textTooltipDuplicate} placement="top">
            <span
              className="pageTeam__leftSidebar__role__btn"
              onClick={(e) => {
                e.stopPropagation();
                duplicateItem(item);
              }}
            >
              <Icon name="dublicate" />
            </span>
          </Tooltip>
        </If>
      </div>
    </div>
  );
};

CreateButton.defaultProps = {
  duplicateItem: null,
  isEditable: true,
  isDefault: false,
};

CreateButton.propTypes = {
  actItemId: PropTypes.string.isRequired,
  selectItem: PropTypes.func.isRequired,
  removeItem: PropTypes.func.isRequired,
  renameItem: PropTypes.func.isRequired,
  duplicateItem: PropTypes.func,
  item: PropTypes.objectOf(PropTypes.any).isRequired,
  isEditable: PropTypes.bool,
  isDefault: PropTypes.bool,
};

export default memo(CreateButton);
