import React from 'react'; // eslint-disable-line
import localization from '../../../shared/strings';

import { Checkbox } from '../../../UIComponents';

export default ({ singleSharingSettings, onChangeSetting, disabled }) => (
  <div className="sharingSettingsBlock">
    <div className="sharingSettingsHeading">{localization.SCREEN_ASSET_SHARING.titleInfopanel}</div>
    <div className="settingsCheckboxes">
      <div className="settingsCheckboxesRow settingsCheckboxesHead">
        <div className="settingsCheckboxesChange">{localization.SCREEN_ASSET_SHARING.textChange}</div>
        <div className="settingsCheckboxesShow">{localization.SCREEN_ASSET_SHARING.textShow}</div>
      </div>
      <div className="settingsCheckboxesRow">
        <div className="settingsCheckboxesTitle">{localization.SCREEN_ASSET_SHARING.labelTitle}</div>
        <div className="settingsCheckboxesChange">
          <Checkbox
            value={singleSharingSettings.titleEditable}
            onChange={onChangeSetting.bind(null, 'titleEditable')}
            disabled={!singleSharingSettings.titleShow || disabled}
          />
        </div>
        <div className="settingsCheckboxesShow">
          <Checkbox
            value={singleSharingSettings.titleShow}
            onChange={onChangeSetting.bind(null, ['titleShow', 'titleEditable'])}
            disabled={disabled}
          />
        </div>
      </div>
      <div className="settingsCheckboxesRow">
        <div className="settingsCheckboxesTitle">{localization.SCREEN_ASSET_SHARING.labelDescription}</div>
        <div className="settingsCheckboxesChange">
          <Checkbox
            value={singleSharingSettings.descriptionEditable}
            onChange={onChangeSetting.bind(null, 'descriptionEditable')}
            disabled={!singleSharingSettings.descriptionShow || disabled}
          />
        </div>
        <div className="settingsCheckboxesShow">
          <Checkbox
            value={singleSharingSettings.descriptionShow}
            onChange={onChangeSetting.bind(null, ['descriptionShow', 'descriptionEditable'])}
            disabled={disabled}
          />
        </div>
      </div>
      <div className="settingsCheckboxesRow">
        <div className="settingsCheckboxesTitle">{localization.SCREEN_ASSET_SHARING.labelCustomFields}</div>
        <div className="settingsCheckboxesShow">
          <Checkbox
            value={singleSharingSettings.customFieldsShow}
            onChange={onChangeSetting.bind(null, 'customFieldsShow')}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  </div>
);
