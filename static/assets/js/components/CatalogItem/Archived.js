import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon';
import Tooltip from '../Tooltip';

function Archived(props) {
  const { archivedReason } = props;

  return (
    <Tooltip content={archivedReason} placement="top">
      <div className="catalogItem__archived">
        <Icon name="archive" />
      </div>
    </Tooltip>
  );
}

Archived.propTypes = {
  archivedReason: PropTypes.string.isRequired,
};

export default memo(Archived);
