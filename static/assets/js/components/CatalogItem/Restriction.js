import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon';
import Tooltip from '../Tooltip';

function Restriction(props) {
  const { restrictedReason } = props;

  return (
    <Tooltip content={restrictedReason} placement="top">
      <div className="catalogItem__restiction" data-tooltip={restrictedReason}>
        <Icon name="warningFilled" />
      </div>
    </Tooltip>
  );
}

Restriction.propTypes = {
  restrictedReason: PropTypes.string.isRequired,
};

export default memo(Restriction);
