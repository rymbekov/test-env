import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { Icon as UiIcon } from '@picsio/ui';
import Icon from '../Icon';
import { navigate } from '../../helpers/history';

import './style.scss';

const DropItem = (props) => {
  const {
    children,
    icon,
    id,
    icon: ControlIcon,
    text,
    additionalClass,
    isActive,
    href,
    onClick,
    sortViewMode,
    handleChangeCatalogViewItemSize,
    catalogViewItemSize,
    handleChangeCatalogViewMode,
    sizeText,
    catalogViewMode,
  } = props;

  const handleClick = useCallback(() => {
    if (href) {
      navigate(href);
    }
    if (typeof onClick === 'function') onClick();
  }, [href, onClick]);

  return (
    <div
      className={cn('toolbarDropdownItem', { additionalClass }, { active: isActive }, { sortType: sortViewMode })}
    >
      <div
        className={cn({ listItem: sortViewMode })}
        onClick={handleClick}
        onKeyPress={handleClick}
        tabIndex={0}
        role="menuitem"
        data-testid={id}
      >
        <If condition={icon}>
          <i className="toolbarDropdownItemIcon">
            <Choose>
              <When condition={typeof icon === 'function'}>
                <UiIcon size="lg" color="inherit">
                  <ControlIcon />
                </UiIcon>
              </When>
              <Otherwise>
                {/* @TODO: remove old Icon */}
                <Icon name={icon} />
              </Otherwise>
            </Choose>
          </i>
        </If>

        {/* <i className={'toolbarDropdownItemIcon ' + icon} /> */}
        <span className="toolbarDropdownItemText">{text}</span>
        {children}
      </div>
      <If condition={sortViewMode}>
        <div className="sortItems">
          <span
            className={cn('sortItem', { active: catalogViewItemSize === 1 })}
            onClick={() => {
              handleChangeCatalogViewMode(catalogViewMode);
              handleChangeCatalogViewItemSize(1);
            }}
          >
            {sizeText.textListx1}
          </span>
          <span
            className={cn('sortItem', { active: catalogViewItemSize === 1.5 })}
            onClick={() => {
              handleChangeCatalogViewMode(catalogViewMode);
              handleChangeCatalogViewItemSize(1.5);
            }}
          >
            {sizeText.textListx1_5}
          </span>
          <span
            className={cn('sortItem', { active: catalogViewItemSize === 2 })}
            onClick={() => {
              handleChangeCatalogViewMode('list');
              handleChangeCatalogViewItemSize(2);
            }}
          >
            {sizeText.textListx2}
          </span>
        </div>
      </If>
    </div>
  );
};

DropItem.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  text: PropTypes.string,
  additionalClass: PropTypes.string,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
  id: PropTypes.string,
  href: PropTypes.string,
  sortViewMode: PropTypes.bool,
  sortTypeText: PropTypes.string,
  handleChangeCatalogViewItemSize: PropTypes.func,
  handleChangeCatalogViewMode: PropTypes.func,
  catalogViewItemSize: PropTypes.number,
  sizeText: PropTypes.object,
  catalogViewMode: PropTypes.string,
};

export default memo(DropItem);
