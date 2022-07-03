import React from 'react'; // eslint-disable-line

/**
 * Class Spinner
 * @param {Object} props
 * @param {string} props.title
 * @param {string} props.text
 */
const Spinner = ({ title, text }) => (
  <div className="picsioSpinner sliderSpinner" style={style}>
    <div className="innerPicsioSpinner">
      <div className="spinner">
        <div />
        <span />
      </div>
      {title && <div className="titleSpinner show">{title}</div>}
      {text && <div className="textSpinner show">{text}</div>}
    </div>
  </div>
);

const style = {
  zIndex: 4,
};

export default Spinner;
