import React, { useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { pollImage } from '../../helpers/images';
import Logger from '../../services/Logger';

const BrandedLogo = (props) => {
  const { src, rounded, className } = props;
  const [isLoading, setLoading] = useState(true);
  const [isError, setError] = useState(false);

  useEffect(() => {
    async function handleError() {
      setError(true);
      const poller = pollImage(src, 3000);
      try {
        await poller.promise;
        setError(false);
      } catch (err) {
        Logger.error(new Error('Error branded logo polling'), { error: err });
      }
    }
    const img = new Image();
    img.onload = () => setLoading(false);
    img.onerror = handleError;
    img.src = src;
  }, [src]);

  if (isError || !src) {
    return (
      <div
        className={cn('brandedLogo', className, {
          indicator: true,
          rounded,
        })}
      />
    );
  }

  return (
    <div
      className={cn('brandedLogo', className, {
        indicator: isLoading,
        rounded,
      })}
      style={{ backgroundImage: `url(${src})` }}
    />
  );
};

BrandedLogo.defaultProps = {
  className: null,
  rounded: false,
};
BrandedLogo.propTypes = {
  src: PropTypes.string.isRequired,
  className: PropTypes.string,
  rounded: PropTypes.bool,
};

export default memo(BrandedLogo);
