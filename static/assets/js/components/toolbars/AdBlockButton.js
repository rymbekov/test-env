import React, { useRef, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Popover, IconButton } from '@picsio/ui';
import { StopIcon } from '@picsio/ui/dist/icons';
import Logger from '../../services/Logger';

const AdBlockButton = ({ toggleAdBlockWarning }) => {
  const [detected, setDetected] = useState(false);
  const ref = useRef();
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => {
    Logger.log('User', 'AdBlockButtonToggle', open ? 'Close' : 'Open');
    setOpen((prevValue) => !prevValue);
  }, [open]);

  useEffect(() => {
    const isDetected = window.CAN_ADS === undefined;

    toggleAdBlockWarning(isDetected);

    if (isDetected) {
      setDetected(true);
      setOpen(true);
    }
    Logger.log('UI', `AdBlock${isDetected ? 'Detected' : 'NotDetected'}`);
    console.info(`adblock ${isDetected ? 'detected' : "isn't detected"}`);
  }, [toggleAdBlockWarning]);

  return (
    <Choose>
      <When condition={detected}>
        <>
          <IconButton
            ref={ref}
            className="toolbarButton"
            onClick={toggle}
            color="error"
          >
            <StopIcon />
          </IconButton>
          <Popover
            target={ref}
            isOpen={open}
            onClose={toggle}
            placement="right"
            offset={[-28, 28]}
            PopperProps={{
              style: { width: 370 },
              hide: false,
              portalContainer: document.querySelector('.toolbarCatalogLeft'),
            }}
            close
          >
            <p>
              It looks like you’re using adblocker in your browser.
              <br />
              <br />
              Pics.io app doesn’t display any ads and we request you to disable
              your adblocker or whitelist our website within it. Otherwise some
              features of the website might not work correctly.
              <br />
              <a href="mailto:support@pics.io" target="_blank" rel="noreferrer">
                Get back to us
              </a>{' '}
              if you see this message and don’t have adblocker.
            </p>
          </Popover>
        </>
      </When>
      <Otherwise>{null}</Otherwise>
    </Choose>
  );
};

AdBlockButton.propTypes = {
  toggleAdBlockWarning: PropTypes.func.isRequired,
};

export default AdBlockButton;
