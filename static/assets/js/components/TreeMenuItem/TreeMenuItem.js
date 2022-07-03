import React, { memo } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { Icon as UiIcon } from '@picsio/ui';
import Icon from '../Icon';

const TreeMenuItem = (props) => {
  const {
    onClick,
    onChange,
    menuName,
    className,
    additionalClassName,
    icon,
    icon: ControlIcon,
    upload,
    dataTestId,
  } = props;

  return (
    <span
      className={cn('treeMenuItem', {
        [className]: className,
        [additionalClassName]: additionalClassName,
      })}
      onClick={onClick}
      onKeyPress={onClick}
      role="button"
      data-testid={dataTestId}
      tabIndex={0}
    >
      <span className="btnCollection iconHolder">
        <Choose>
          <When condition={typeof icon === 'function'}>
            <UiIcon size="md" color="inherit">
              <ControlIcon />
            </UiIcon>
          </When>
          <Otherwise>
            <Icon name={icon} />
          </Otherwise>
        </Choose>
      </span>
      <div className="treeMenuItemName">{menuName}</div>
      <If condition={upload}>
        <input
          type="file"
          multiple
          className="btnCollectionUpload"
          onChange={onChange}
          onClick={onClick}
        />
      </If>
    </span>
  );
};

TreeMenuItem.defaultProps = {
  className: null,
  additionalClassName: null,
  upload: null,
  onChange: () => {},
  dataTestId: null,
};

TreeMenuItem.propTypes = {
  onClick: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  menuName: PropTypes.string.isRequired,
  className: PropTypes.string,
  additionalClassName: PropTypes.string,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  upload: PropTypes.bool,
  dataTestId: PropTypes.string,
};

export default memo(TreeMenuItem);
