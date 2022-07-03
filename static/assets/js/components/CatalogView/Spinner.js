import React from 'react'; //eslint-disable-line

const style = { height: 'calc(50vh)' };

/**
 * Spinner component for catalog view
 * @param {boolean} big
 * @returns {JSX}
 */
export default ({ big }) => (
  <div className="picsioSpinner" style={big ? style : {}}>
    <div className="innerPicsioSpinner">
      <div className="spinner">
        <div />
        <span />
      </div>
    </div>
  </div>
);
