import React from 'react';
import PropTypes from 'prop-types';

export default function Spinner(props) {
  const { spinnerTitle, uploadRevisionProgress } = props;

  return (
    <div className="picsioSpinner partial" style={{ zIndex: 7, background: 'rgba(0, 0, 0, 0.9)' }}>
      <div className="innerPicsioSpinner">
        <div className="spinner">
          <div />
          <span />
        </div>
        <If condition={spinnerTitle != null}>
          <span className="titleSpinner show">
            {spinnerTitle}
            {uploadRevisionProgress && (
              <span className="spinnerProgress">{`${uploadRevisionProgress}%`}</span>
            )}
          </span>
        </If>
      </div>
    </div>
  );
}

Spinner.defaultProps = {
  spinnerTitle: null,
  uploadRevisionProgress: null,
};

Spinner.propTypes = {
  spinnerTitle: PropTypes.string,
  uploadRevisionProgress: PropTypes.number,
};
