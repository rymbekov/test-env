import React, { memo } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { Icon as UiIcon } from '@picsio/ui';
import Icon from '../Icon';
import Tooltip from '../Tooltip';

const TreeButton = (props) => {
  const {
    onClick,
    tooltip,
    className,
    additionalClassName,
    icon,
    icon: ControlIcon,
    children,
    dataTestId,
  } = props;

  return (
    <Tooltip
      className={cn('treeButtonSmall', { [className]: className })}
      content={tooltip}
      placement="top"
    >
      <span
        className={cn('btnCollection', { [additionalClassName]: additionalClassName })}
        onClick={onClick}
        onKeyPress={onClick}
        role="button"
        data-testid={dataTestId}
        tabIndex={0}
      >
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
        <If condition={children}>{children}</If>
      </span>
    </Tooltip>
  );
};

TreeButton.defaultProps = {
  className: '',
  additionalClassName: '',
  children: null,
  dataTestId: null,
};

TreeButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  tooltip: PropTypes.string.isRequired,
  className: PropTypes.string,
  additionalClassName: PropTypes.string,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  children: PropTypes.node,
  dataTestId: PropTypes.string,
};

export default memo(TreeButton);
