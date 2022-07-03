import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@picsio/ui';
import localization from '../../../../shared/strings';

const DetailsPanelFooter = ({ isOpen, toggleEditPanel }) => (
  <div className="detailsPanelEdit__footer">
    <Button variant="contained" color={isOpen ? 'secondary' : 'primary'} onClick={toggleEditPanel} fullWidth>
      {isOpen ? localization.DONE : localization.DETAILS.editWidgets}
    </Button>
  </div>
);

DetailsPanelFooter.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleEditPanel: PropTypes.func.isRequired,
};

export default memo(DetailsPanelFooter);
