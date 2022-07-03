import React, { memo, useState } from 'react';
import styled from 'styled-components';
import cn from 'classnames';
import { pollImage } from '../../helpers/images';
import Logger from '../../services/Logger';
import Icon from '../Icon';

/**
 * Avatar
 * @param {Object} props
 * @param {string} props.src
 * @param {string} props.username
 * @param {number} props.size
 * @param {boolean} props.avatarPicsio
 * @param {boolean} props.stretch
 * @param {boolean} props.enablePolling
 * @param {string} props.className
 * @returns {JSX}
 */
const Avatar = ({
  src, username, size, avatarPicsio, stretch, enablePolling, className,
}) => {
  const [isLoading, setLoading] = useState(true);
  const [isError, setError] = useState(false);

  const avatarSize = stretch ? '100%' : `${size}px`;

  const handleError = async () => {
    if (enablePolling) {
      setError(true);
      const poller = pollImage(src, 3000);
      try {
        await poller.promise;
        setError(false);
      } catch (err) {
        Logger.error(new Error('Error avatar polling'), { error: err });
      }
    } else {
      setError(true);
    }
  };

  const isAvatarTransparent = (source) => {
    if (!source) return false;
    const transparentExtensions = ['png', 'svg', 'gif'];
    const isTransparent = transparentExtensions.some((ext) => source.toLowerCase().endsWith(ext));
    return isTransparent;
  };

  if (isError || !src) {
    return (
      <StyledAvatar
        avatarSize={avatarSize}
        className={cn('avatar', {
          [className]: Boolean(className),
          avatarPicsio,
        })}
      >
        <Icon
          name={cn({
            avatar: !avatarPicsio,
            logoPicsio: avatarPicsio,
          })}
        />
      </StyledAvatar>
    );
  }

  return (
    <StyledAvatar
      avatarSize={avatarSize}
      className={cn('avatar', {
        isAvatarLoading: isLoading,
        [className]: Boolean(className),
        isAvatarTransparent: isAvatarTransparent(src),
      })}
    >
      <img
        src={src}
        alt={username}
        width={size}
        height={size}
        onLoad={() => setLoading(false)}
        onError={() => handleError()}
      />
    </StyledAvatar>
  );
};

const StyledAvatar = styled.div`
  width: ${(props) => `${props.avatarSize}`};
  height: ${(props) => `${props.avatarSize}`};
  line-height: ${(props) => `${props.avatarSize}`};
  font-size: ${(props) => `${props.avatarSize}`};
`;

export default memo(Avatar);
