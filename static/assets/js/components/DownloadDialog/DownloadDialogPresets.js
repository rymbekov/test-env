import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { TextField, IconButton } from '@picsio/ui';
import { BookmarkIcon } from '@picsio/ui/dist/icons';
import Icon from '../Icon';
import Tooltip from '../Tooltip';

import PresetMenuItem from './PresetMenuItem';

const DownloadDialogPresets = (props) => {
  const {
    isLoading, presets, selectedPreset, onChange, onRemove, onSave,
  } = props;
  const { _id: selectedId, name: selectedName, data: selectedData } = selectedPreset;
  const renderValue = () => selectedName;
  const isDisabledSave = selectedId === 'original' || !!selectedData.resolution;

  return (
    <div className="downloadDialog__presets">
      <div className="downloadDialog__presets__select">
        <TextField
          label="Save as"
          name="presets"
          value={selectedId}
          onChange={onChange}
          disabled={isLoading}
          select
          LabelProps={{
            id: 'label-presets',
          }}
          SelectProps={{
            labelId: 'label-presets',
            dataId: '_id',
            dataValue: 'name',
            options: presets,
            optionComponent: (args) => (<PresetMenuItem onRemove={onRemove} {...args} />),
            renderValue,
            MenuProps: {
              PopperProps: {
                portalContainer: document.querySelector('.wrapperDownloadDialog'),
              },
            },
          }}
        />
      </div>
      <div className="downloadDialog__presets__save">
        <Tooltip content={isDisabledSave ? null : 'Click to save'}>
          <IconButton
            onClick={onSave}
            disabled={isDisabledSave}
          >
            <Choose>
              <When condition={isLoading}>
                <Icon className="sync-loading" name="sync" />
              </When>
              <Otherwise>
                <BookmarkIcon />
              </Otherwise>
            </Choose>
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
};

DownloadDialogPresets.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  presets: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
  selectedPreset: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    data: PropTypes.object,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default memo(DownloadDialogPresets);
