import React from 'react'; // eslint-disable-line
import { string, any, func } from 'prop-types';
import { Select } from '../../UIComponents'; // eslint-disable-line
import localization from '../../shared/strings';

const options = [
  {
    text: localization.SEARCH.optionAny,
    value: 'any',
  },
  {
    text: localization.SEARCH.optionImages,
    value: 'images',
  },
  {
    text: localization.SEARCH.optionVideo,
    value: 'video',
  },
  {
    text: localization.SEARCH.optionAudio,
    value: 'audio',
  },
  {
    text: localization.SEARCH.optionText,
    value: 'text',
  },
  {
    text: localization.SEARCH.optionPDF,
    value: 'pdf',
  },
  {
    text: localization.SEARCH.optionSketch,
    value: 'sketch',
  },
  {
    text: localization.SEARCH.optionRAW,
    value: 'raw',
  },
  {
    text: localization.SEARCH.optionPhotoshop,
    value: 'photoshop',
  },
  {
    text: localization.SEARCH.option3D,
    value: '3d',
  },
];

function Types({ label, value, onChange }) {
  return (
    <div className="itemSearchFilters">
      <div className="labelItemSearchFilters">{label}</div>
      <div className="contentItemSearchFilters">
        <div className="defaultType">
          <Select options={options} value={value} onChange={(event, value) => onChange(value)} />
        </div>
      </div>
    </div>
  );
}

Types.propTypes = {
  label: string,
  value: any,
  onChange: func,
};

export default Types;
