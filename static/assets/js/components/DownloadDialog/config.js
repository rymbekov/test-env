import localization from '../../shared/strings';
import ua from '../../ua';

export const options = {
  mimeType: [
    {
      value: 'original',
      text: localization.DOWNLOADDIALOG.textAsOriginal,
    },
    {
      value: 'image/jpeg',
      text: 'jpg',
    },
    {
      value: 'image/png',
      text: 'png',
    },
    {
      value: 'application/pdf',
      text: 'pdf',
    },
  ],
  resizing: [
    {
      value: 'original',
      text: localization.DOWNLOADDIALOG.textAsOriginal,
    },
    {
      value: 'largest',
      text: localization.DOWNLOADDIALOG.textLargestSide,
    },
    {
      value: 'width',
      text: localization.DOWNLOADDIALOG.textWidth,
    },
    {
      value: 'height',
      text: localization.DOWNLOADDIALOG.textHeight,
    },
  ],
  density: [
    {
      value: 'original',
      text: localization.DOWNLOADDIALOG.textAsOriginal,
    },
    {
      value: '72',
      text: '72',
    },
    {
      value: '96',
      text: '96',
    },
    {
      value: '150',
      text: '150',
    },
    {
      value: '300',
      text: '300',
    },
    {
      value: '600',
      text: '600',
    },
    {
      value: '1200',
      text: '1200',
    },
  ],
  units: [
    {
      value: 'PixelsPerInch',
      text: 'pixels/inch',
    },
    {
      value: 'PixelsPerCentimeter',
      text: 'pixels/cm',
    },
  ],
};

export const qualityConfig = {
  default: 85,
  min: 0,
  max: 100,
  presets: [
    {
      name: 'low',
      value: 30,
    },
    {
      name: 'medium',
      value: 60,
    },
    {
      name: 'high',
      value: 90,
    },
  ],
};

export const pixelsConfig = {
  default: 1024,
  min: 0,
  max: 100000,
};

export const getOptionDefaultValue = (type) => options[type][0].value;

export const defaultPresetConfig = {
  mimeType: getOptionDefaultValue('mimeType'),
  quality: qualityConfig.default,
  resizing: getOptionDefaultValue('resizing'),
  width: pixelsConfig.default,
  density: getOptionDefaultValue('density'),
  units: getOptionDefaultValue('units'),
  isArchive: ua.browser.isOldSafari(),
  withoutWatermark: false,
  organizeByCollections: false,
};

export const defaultPresets = [
  {
    _id: 'original',
    name: 'Original',
    data: defaultPresetConfig,
  },
];

export const customPreset = {
  _id: 'custom',
  name: 'Custom',
  data: defaultPresetConfig,
};
