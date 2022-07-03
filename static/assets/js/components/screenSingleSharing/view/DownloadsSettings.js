import React from 'react'; // eslint-disable-line
import localization from '../../../shared/strings';

import { Checkbox } from '../../../UIComponents';

export default ({ singleSharingSettings, onChangeSetting, disabled }) => (
  <div className="sharingSettingsBlock">
    <div className="sharingSettingsHeading">{localization.SCREEN_ASSET_SHARING.titleDownloads}</div>
    <div className="settingsCheckboxes">
      <div className="settingsCheckboxesRow settingsCheckboxesHead">
        <div className="settingsCheckboxesShow">{localization.SCREEN_ASSET_SHARING.textShow}</div>
      </div>
      <div className="settingsCheckboxesRow">
        <div className="settingsCheckboxesTitle">{localization.SCREEN_ASSET_SHARING.labelAllowDownloadFile}</div>
        <div className="settingsCheckboxesShow">
          <Checkbox
            value={singleSharingSettings.download}
            onChange={onChangeSetting.bind(null, 'download')}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  </div>
);
