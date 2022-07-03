import React from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '@picsio/ui';
import cn from 'classnames';
import { AddTeammate } from '@picsio/ui/dist/icons';
import localization from '../../shared/strings';
import Logger from '../../services/Logger';
import Tooltip from '../Tooltip';
import { navigate } from '../../helpers/history';

const InviteButton = ({ withHover, placement, isToolbarActionButton }) => (
  <Tooltip content={localization.DETAILS.textInviteTeammates} placement={placement}>
    <IconButton
      componentProps={{ 'data-testid': 'toolbarCatalogTopInviteButton' }}
      className={cn(isToolbarActionButton ? 'toolbarButton' : 'inviteButton', { withHover })}
      onClick={() => {
        navigate('/teammates?tab=teammates');
        Logger.log('User', isToolbarActionButton ? 'ToolbarActionInviteTeammate' : 'ToolbarCatalogTopInviteTeammate');
      }}
      size="xl"
      color="inherit"
    >
      <AddTeammate />
    </IconButton>
  </Tooltip>
);

InviteButton.defaultProps = {
  withHover: true,
  placement: 'bottom',
  isToolbarActionButton: false,
};

InviteButton.propTypes = {
  withHover: PropTypes.bool,
  placement: PropTypes.string,
  isToolbarActionButton: PropTypes.bool,
};

export default InviteButton;
