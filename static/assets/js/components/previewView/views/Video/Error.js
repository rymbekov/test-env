import React from 'react';
import { Icon, Button } from '@picsio/ui';
import { Warning, Retry } from '@picsio/ui/dist/icons';
import {
  bool, number, shape, string,
} from 'prop-types';

const refreshPage = () => window.location.reload();

/**
 * @param props
 * @param {MediaError} props.error
 * @param {boolean} props.[isMobile = false]
 * @returns {JSX}
 */
const VideoError = ({ error, isMobile }) => {
  const { code } = error;
  const start = <p>Your {isMobile ? 'device' : 'browser'} can not play this video.</p>;
  const end = (
    <p>
      For more details, read{' '}
      <a
        href="https://help.pics.io/en/articles/1749059-working-with-video-files-in-pics-io"
        target="_blank"
        rel="noreferrer"
      >
        our article
      </a>{' '}
      on videos in Pics.io.
    </p>
  );

  let middle = null;
  switch (code) {
  case 1:
    middle = (
      <p>Possible reasons:{' '}
        <strong>adblocker</strong>{', '}
        <strong>VPN</strong>{', '}
        <strong>firewall</strong>.
      </p>
    );
    break;

  case 2:
    middle = (
      <Button
        variant="contained"
        color="primary"
        onClick={refreshPage}
        size="md"
        startIcon={<Retry />}
      >
        Refresh the page
      </Button>
    );
    break;

  case 3:
    middle = (
      <p>Possible reasons:{' '}
        <strong>unsupported codec</strong>{', '}
        <strong>too high bitrate for your browser</strong>
      </p>
    );
    break;
    // no default
  }

  return (
    <div className="videoError">
      <h1><Icon><Warning /></Icon> ERROR!</h1>
      {start}
      {middle}
      {end}
    </div>
  );
};

VideoError.defaultProps = {
  isMobile: false,
};

VideoError.propTypes = {
  error: shape({
    code: number,
    message: string,
  }).isRequired,
  isMobile: bool,
};

export default VideoError;
