import React from 'react';
import PropTypes from 'prop-types';

import UpgradePlan from '../../../UpgradePlan';

const Separator = (props) => {
  const { title, toggleVisibility, customFieldsAllowed } = props;

  return (
    <div className="detailsPanel__title">
      {customFieldsAllowed ? (
        <span
          className="detailsPanel__title_text"
          onClick={() => toggleVisibility(title)}
          data-item="detailsCustomFields"
        >
          {title}
        </span>
      ) : (
        <span className="detailsPanel__title_text withoutTriangle" data-item="detailsCustomFields">
          {title} <UpgradePlan />
        </span>
      )}
    </div>
  );
};

Separator.defaultProps = {
  title: '',
  toggleVisibility: null,
  customFieldsAllowed: true,
};
Separator.propTypes = {
  title: PropTypes.string,
  toggleVisibility: PropTypes.func,
  customFieldsAllowed: PropTypes.bool,
};

export default Separator;
