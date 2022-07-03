import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Drawer, MenuList, MenuItem, MenuItemIcon, MenuItemText, IconButton } from '@picsio/ui';
import { CloseIcon, SaveFrameIcon, ThumbitIcon } from '@picsio/ui/dist/icons';

import Icon from '../Icon';
import picsioConfig from '../../../../../config';

const isMainApp = picsioConfig.isMainApp();

const VideoControlsDrawer = (props) => {
  const {
    isOpen,
    onClose,
    getSnapshot,
    createCustomThumbnail,
    uploadCustomThumbnail,
  } = props;
  const controls = [
    {
      id: 'get',
      text: 'Take a snapshot',
      onClick: () =>  {
        getSnapshot();
        onClose();
      },
      icon: SaveFrameIcon,
      onlyMainApp: false,
    },
    {
      id: 'create',
      text: 'Create custom thumbnail',
      onClick: () =>  {
        createCustomThumbnail();
        onClose();
      },
      icon: ThumbitIcon,
      onlyMainApp: true,
    },
    {
      id: 'upload',
      text: 'Upload custom thumbnail',
      onClick: (e) =>  {
        uploadCustomThumbnail(e);
        onClose();
      },
      icon: () => <Icon name="btnCollectionUpload" />,
      onlyMainApp: true,
    },
  ];
  const controlsByApp = controls.filter(({ onlyMainApp }) => !(onlyMainApp && !isMainApp));

  return (
    <Drawer className="videoControlsDrawer" isOpen={isOpen} direction="bottom" fullSize>
      <div className="videoControlsDrawer__header">
        <h4>Thumbnail and snapshot</h4>
        <IconButton onClick={onClose} color="inherit" size="md">
          <CloseIcon />
        </IconButton>
      </div>
      <MenuList padding={false}>
        {
          controlsByApp.map((control) => {
            const { id, text, onClick, icon: ControlIcon } = control;

            return (
              <MenuItem key={id} onClick={onClick}>
                <MenuItemIcon size="lg">
                  <ControlIcon />
                </MenuItemIcon>
                <MenuItemText primary={text} />
              </MenuItem>
            )
          })
        }
      </MenuList>
    </Drawer>
  );
};

VideoControlsDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  getSnapshot: PropTypes.func.isRequired,
  createCustomThumbnail: PropTypes.func.isRequired,
  uploadCustomThumbnail: PropTypes.func.isRequired,
};

export default memo(VideoControlsDrawer);
