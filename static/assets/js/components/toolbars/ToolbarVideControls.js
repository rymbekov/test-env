import React, { useState } from 'react';
import PropTypes from 'prop-types';

import picsioConfig from '../../../../../config';

import ua from '../../ua';
import Button from './Button';
import VideoControlsDrawer from './VideoControlsDrawer';

const isMainApp = picsioConfig.isMainApp();

const ToolbarVideoControls = (props) => {
  const {
    getSnapshot, createCustomThumbnail, uploadCustomThumbnail, cropVideo,
  } = props;
  const [showDrawer, setShowDrawer] = useState(false);

  const toggleDrawer = () => {
    setShowDrawer((prevState) => !prevState);
  };

  return (
    <>
      <Choose>
        <When condition={ua.browser.isNotDesktop()}>
          <Button
            additionalClass="toolbarVideoControl"
            onClick={createCustomThumbnail}
            icon="createVideoThumb"
          />
        </When>
        <Otherwise>
          <Button additionalClass="toolbarVideoControl" onClick={toggleDrawer} icon="scenario" />
          <If condition={isMainApp}>
            <Button additionalClass="toolbarVideoControl" onClick={cropVideo} icon="scissors" />
          </If>
          <VideoControlsDrawer
            isOpen={showDrawer}
            onClose={toggleDrawer}
            getSnapshot={getSnapshot}
            createCustomThumbnail={createCustomThumbnail}
            uploadCustomThumbnail={uploadCustomThumbnail}
          />
        </Otherwise>
      </Choose>
    </>
  );
};

ToolbarVideoControls.propTypes = {
  getSnapshot: PropTypes.func.isRequired,
  createCustomThumbnail: PropTypes.func.isRequired,
  uploadCustomThumbnail: PropTypes.func.isRequired,
  cropVideo: PropTypes.func.isRequired,
};

export default ToolbarVideoControls;
