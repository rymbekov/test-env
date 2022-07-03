import React, { useState } from 'react';
import { IconButton, Tooltip } from '@picsio/ui';
import { Plus, MinusIcon } from '@picsio/ui/dist/icons';
import { object } from 'prop-types';
import { Select } from '../../../../UIComponents';
import * as utils from '../../../../shared/utils';

const DEFAULT_SCALE_DELTA = 1.1;
const MIN_SCALE = 0.1;
const MAX_SCALE = 10.0;

export const SCALE_VALUES = {
  auto: 'auto',
  pageFit: 'page-fit',
  pageWidth: 'page-width',
  actualSize: '1',
};

export const LOCAL_STORAGE_FIELD_NAME = 'pdfViewerScale';

const SCALE_OPTIONS = [
  {
    value: SCALE_VALUES.auto,
    text: 'Auto',
  },
  {
    value: SCALE_VALUES.actualSize,
    text: 'Actual size',
  },
  {
    value: SCALE_VALUES.pageFit,
    text: 'Page fit',
  },
  {
    value: SCALE_VALUES.pageWidth,
    text: 'Page width',
  },
  {
    value: '0.75',
    text: '75%',
  },
  {
    value: '1.5',
    text: '150%',
  },
  {
    value: '2',
    text: '200%',
  },
];

function ScaleSelect({ eventBus, viewer }) {
  const initScale = utils.LocalStorage.get(LOCAL_STORAGE_FIELD_NAME) || SCALE_VALUES.auto;
  const initScaleValue = SCALE_OPTIONS.find((o) => o.value === initScale);

  const [scaleValue, setScaleValue] = useState(initScaleValue);

  const handleScaleChange = (e) => {
    const { value: scale } = e.target;
    const option = SCALE_OPTIONS.find((o) => o.value === scale);
    eventBus.dispatch('changescale', {
      source: ScaleSelect,
      scale,
    });
    utils.LocalStorage.set(LOCAL_STORAGE_FIELD_NAME, scale);
    setScaleValue(option);
  };

  const zoomIn = () => {
    let newScale = viewer.currentScale;
    newScale = (newScale * DEFAULT_SCALE_DELTA).toFixed(2);
    newScale = Math.ceil(newScale * 10) / 10;
    newScale = Math.min(MAX_SCALE, newScale);
    eventBus.dispatch('changescale', {
      source: ScaleSelect,
      scale: newScale,
    });
  };

  const zoomOut = () => {
    let newScale = viewer.currentScale;
    newScale = (newScale / DEFAULT_SCALE_DELTA).toFixed(2);
    newScale = Math.floor(newScale * 10) / 10;
    newScale = Math.max(MIN_SCALE, newScale);
    eventBus.dispatch('changescale', {
      source: ScaleSelect,
      scale: newScale,
    });
  };

  return (
    <>
      <Tooltip content="Zoom out">
        <IconButton onClick={zoomOut}>
          <MinusIcon />
        </IconButton>
      </Tooltip>
      <Select
        options={SCALE_OPTIONS}
        value={scaleValue.value}
        onChange={handleScaleChange}
        name="scale"
      />
      <Tooltip content="Zoom in">
        <IconButton onClick={zoomIn}>
          <Plus />
        </IconButton>
      </Tooltip>
    </>
  );
}

ScaleSelect.propTypes = {
  // eslint-disable-next-line
  eventBus: object, // EventBus from pdf.js
  // eslint-disable-next-line
  viewer: object, // Pdf.js viewer
};

export default ScaleSelect;
