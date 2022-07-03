import React from 'react';
import PropTypes from 'prop-types';
import TruncateMarkup from 'react-truncate-markup';

export default function Description(props) {
  const { title = ' ', description, isMobileView } = props;

  return (
    <div className="catalogItem__titleDescription">
      <div className="catalogItem__title">
        <If condition={title}>

          <TruncateMarkup lines={1}>
          <div >
            {title}
          </div>
        </TruncateMarkup>
        </If>
      </div>
      <If condition={description}>
        <TruncateMarkup lines={isMobileView ? 1 : 2} className="catalogItem__description">
          <div >
            {description}
          </div>
        </TruncateMarkup>
      </If>
    </div>
  );
}

Description.defaultProps = {
  title: '',
  description: '',
};

Description.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  isMobileView: PropTypes.bool.isRequired,
};
