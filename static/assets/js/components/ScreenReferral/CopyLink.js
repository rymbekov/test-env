import React from 'react';
import PropTypes from 'prop-types';

const CopyLink = ({ link, copyToClipboard }) => (
  <div className="referralCopyLink">
    <div className="referralCopyLink-text">
      <a href={link}>{link}</a>
    </div>
    <button
      type="button"
      className="referralCopyLink-button"
      onClick={() => copyToClipboard(link)}
      onKeyPress={() => copyToClipboard(link)}
      tabIndex={0}
    >
      Copy Link
    </button>
  </div>
);

CopyLink.propTypes = {
  link: PropTypes.string.isRequired,
  copyToClipboard: PropTypes.func.isRequired,
};

export default CopyLink;
