import React, { memo } from 'react';
import PropTypes from 'prop-types';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import supportsEmoji from '../../shared/supportsEmoji';

const Flag = (props) => {
  const { abbreviation, alt, image } = props;
  return (
    <Choose>
      <When condition={supportsEmoji()}>
        <If condition={abbreviation}>
          <span className="flagImage">
            {getUnicodeFlagIcon(abbreviation)}
          </span>
        </If>
      </When>
      <Otherwise>
        <If condition={image}>
          <img className="flagImage" src={image} alt={alt || abbreviation} />
        </If>
      </Otherwise>
    </Choose>
  );
};

Flag.defaultProps = {
  abbreviation: '',
  alt: '',
  image: '',
};

Flag.propTypes = {
  abbreviation: PropTypes.string,
  alt: PropTypes.string,
  image: PropTypes.string,
};

export default memo(Flag);
