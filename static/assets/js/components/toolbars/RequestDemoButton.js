import React from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '@picsio/ui';
import { CalendarBook } from '@picsio/ui/dist/icons';
import cn from 'classnames';
import localization from '../../shared/strings';
import Tooltip from '../Tooltip';

const RequestDemoButton = ({
  withHover, placement, handleLiveSupport, chatSupport,
}) => (
  <Tooltip content={localization.DETAILS.textRequestDemo} placement={placement}>
    <IconButton
      componentProps={{ 'data-testid': 'toolbarCatalogTopRequestDemoButton' }}
      className={cn('requestDemoButton', { withHover })}
      onClick={handleLiveSupport}
      size="lg"
      color="inherit"
      disabled={!chatSupport}
      id="itemliveSupport"
    >
      <CalendarBook />
    </IconButton>
  </Tooltip>
);

RequestDemoButton.defaultProps = {
  withHover: true,
  placement: 'bottom',
};

RequestDemoButton.propTypes = {
  withHover: PropTypes.bool,
  placement: PropTypes.string,
  chatSupport: PropTypes.bool.isRequired,
  handleLiveSupport: PropTypes.func.isRequired,
};

export default RequestDemoButton;
