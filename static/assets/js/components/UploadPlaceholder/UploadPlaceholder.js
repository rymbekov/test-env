import { func } from 'prop-types';
import React from 'react'; // eslint-disable-line
import localization from '../../shared/strings';
import Icon from '../Icon';

import './styles.scss';

const UploadPlaceholder = ({ onChange }) => (
  <div className="importPlaceholder">
    <div className="inner">
      <div className="btnIconUpload">
        <Icon name="upload" />
      </div>
      <span className="placeholderTitle">{localization.IMPORT.textSelectMedia}</span>
      <input type="file" onChange={onChange} multiple />
    </div>
  </div>
);

UploadPlaceholder.defaultProps = {
  onChange: Function.prototype,
};

UploadPlaceholder.propTypes = {
  onChange: func,
};

export default UploadPlaceholder;
