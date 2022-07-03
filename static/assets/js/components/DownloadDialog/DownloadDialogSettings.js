import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@picsio/ui';
import { reject } from 'lodash';

import localization from '../../shared/strings';
import { InputRange } from '../../UIComponents';

import PresetSelectOptions from './PresetSelectOptions';
import {
  options,
  qualityConfig,
  pixelsConfig,
  defaultPresetConfig,
} from './config';

const DownloadDialogSettings = (props) => {
  const {
    selectedSettings,
    onChange,
    isDisabledFormat,
    disablePdfFormat,
  } = props;
  const {
    mimeType = defaultPresetConfig.mimeType,
    quality = defaultPresetConfig.quality,
    resizing = defaultPresetConfig.resizing,
    width = defaultPresetConfig.width,
    density = defaultPresetConfig.density,
    units = defaultPresetConfig.units,
  } = selectedSettings;
  const isDefaultFormat = mimeType === defaultPresetConfig.mimeType;
  const isDefaultResizing = resizing === defaultPresetConfig.resizing;
  const isDefaultDensity = density === defaultPresetConfig.density;
  const isDisabledField = isDisabledFormat || isDefaultFormat;

  let mimeTypeOptions = [...options.mimeType];

  if (disablePdfFormat) {
    mimeTypeOptions = reject(mimeTypeOptions, (el) => el.text === 'pdf');
  }

  return (
    <div className="downloadDialog__settings">
      <PresetSelectOptions
        label="Format"
        id="format"
        name="mimeType"
        value={mimeType}
        onChange={onChange}
        options={mimeTypeOptions}
        disabled={isDisabledFormat}
      />
      <InputRange
        label={localization.DOWNLOADDIALOG.labelQuality}
        value={quality}
        onChange={(value) => onChange({ target: { name: 'quality', value } })}
        min={qualityConfig.min}
        max={qualityConfig.max}
        presets={qualityConfig.presets}
        disabled={isDisabledField}
      />
      <div className="downloadDialog__settings__row">
        <PresetSelectOptions
          label={localization.DOWNLOADDIALOG.labelSize}
          id="size"
          name="resizing"
          value={resizing}
          onChange={onChange}
          options={options.resizing}
          disabled={isDisabledField}
        />
        <TextField
          label={localization.DOWNLOADDIALOG.labelPixels}
          type="number"
          id="pixels"
          name="width"
          value={width}
          onChange={onChange}
          min={pixelsConfig.min}
          max={pixelsConfig.max}
          disabled={isDisabledField || isDefaultResizing}
        />
      </div>
      <div className="downloadDialog__settings__row">
        <PresetSelectOptions
          label={localization.DOWNLOADDIALOG.labelResolution}
          id="resolution"
          name="density"
          value={density}
          onChange={onChange}
          options={options.density}
          disabled={isDisabledField}
        />
        <PresetSelectOptions
          label={localization.DOWNLOADDIALOG.labelUnits}
          id="units"
          name="units"
          value={units}
          onChange={onChange}
          options={options.units}
          disabled={isDisabledField || isDefaultDensity}
        />
      </div>
    </div>
  );
};

DownloadDialogSettings.propTypes = {
  selectedSettings: PropTypes.shape({
    mimeType: PropTypes.string,
    quality: PropTypes.number,
    resizing: PropTypes.string,
    width: PropTypes.number,
    density: PropTypes.string,
    units: PropTypes.string,
    isArchive: PropTypes.bool,
    organizeByCollections: PropTypes.bool,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  isDisabledFormat: PropTypes.bool.isRequired,
  disablePdfFormat: PropTypes.bool.isRequired,
};

export default memo(DownloadDialogSettings);
