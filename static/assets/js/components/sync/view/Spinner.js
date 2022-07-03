import React from 'react'; // eslint-disable-line

/**
 * Class Spinner
 * @param {Object} props
 * @param {string} props.title
 * @param {string} props.text
 */
const Spinner = ({ title, text }) => (
  <div className="picsioSpinner partial previewViewSpinner" style={style}>
    <div className="innerPicsioSpinner">
      <div className="spinner">
        <div />
        <span />
      </div>
      <div className="titleSpinner show">{title}</div>
      <div className="textSpinner">{text}</div>
    </div>
  </div>
);

const style = {
  zIndex: 4,
};

export default Spinner;
