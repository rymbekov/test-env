import React from 'react'; // eslint-disable-line
import localization from '../../../shared/strings';

import { Checkbox } from '../../../UIComponents';

export default ({ singleSharingSettings, onChangeSetting, disabled }) => (
  <div className="sharingSettingsBlock">
    <div className="sharingSettingsHeading">{localization.SCREEN_ASSET_SHARING.titleMarks}</div>
    <div className="settingsCheckboxes">
      <div className="settingsCheckboxesRow settingsCheckboxesHead">
        <div className="settingsCheckboxesChange">{localization.SCREEN_ASSET_SHARING.textChange}</div>
        <div className="settingsCheckboxesShow">{localization.SCREEN_ASSET_SHARING.textShow}</div>
      </div>
      <div className="settingsCheckboxesRow">
        <div className="settingsCheckboxesTitle">{localization.SCREEN_ASSET_SHARING.labelFlag}</div>
        <div className="settingsCheckboxesChange">
          <Checkbox
            value={singleSharingSettings.flag}
            onChange={onChangeSetting.bind(null, 'flag')}
            disabled={!singleSharingSettings.flagShow || disabled}
          />
        </div>
        <div className="settingsCheckboxesShow">
          <Checkbox
            value={singleSharingSettings.flagShow}
            onChange={onChangeSetting.bind(null, ['flagShow', 'flag'])}
            disabled={disabled}
          />
        </div>
      </div>
      <div className="settingsCheckboxesRow">
        <div className="settingsCheckboxesTitle">{localization.SCREEN_ASSET_SHARING.labelRating}</div>
        <div className="settingsCheckboxesChange">
          <Checkbox
            value={singleSharingSettings.rating}
            onChange={onChangeSetting.bind(null, 'rating')}
            disabled={!singleSharingSettings.ratingShow || disabled}
          />
        </div>
        <div className="settingsCheckboxesShow">
          <Checkbox
            value={singleSharingSettings.ratingShow}
            onChange={onChangeSetting.bind(null, ['ratingShow', 'rating'])}
            disabled={disabled}
          />
        </div>
      </div>
      <div className="settingsCheckboxesRow">
        <div className="settingsCheckboxesTitle">{localization.SCREEN_ASSET_SHARING.labelColor}</div>
        <div className="settingsCheckboxesChange">
          <Checkbox
            value={singleSharingSettings.color}
            onChange={onChangeSetting.bind(null, 'color')}
            disabled={!singleSharingSettings.colorShow || disabled}
          />
        </div>
        <div className="settingsCheckboxesShow">
          <Checkbox
            value={singleSharingSettings.colorShow}
            onChange={onChangeSetting.bind(null, ['colorShow', 'color'])}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  </div>
);
