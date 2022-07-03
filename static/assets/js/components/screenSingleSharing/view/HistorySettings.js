import React from 'react'; // eslint-disable-line
import localization from '../../../shared/strings';
import { Checkbox } from '../../../UIComponents';
import UpgradePlan from '../../UpgradePlan';

export default ({
  singleSharingSettings,
  onChangeSetting,
  isCommentsNotAllowed,
  isRevisionsNotAllowed,
  disabled,
}) => (
  <div className="sharingSettingsBlock">
    <div className="sharingSettingsHeading">{localization.SCREEN_ASSET_SHARING.titleHistory}</div>
    <div className="settingsCheckboxes">
      <div className="settingsCheckboxesRow settingsCheckboxesHead">
        <div className="settingsCheckboxesChange">{localization.SCREEN_ASSET_SHARING.textChange}</div>
        <div className="settingsCheckboxesShow">{localization.SCREEN_ASSET_SHARING.textShow}</div>
      </div>
      <div className="settingsCheckboxesRow">
        <div className="settingsCheckboxesTitle">
          <Choose>
            <When condition={isRevisionsNotAllowed}>
              {localization.SCREEN_ASSET_SHARING.labelRevisionsDisabled}{' '}
              <UpgradePlan tooltip={localization.UPGRADE_PLAN.tooltipPlanLimitations} />
            </When>
            <Otherwise>
              {localization.SCREEN_ASSET_SHARING.labelRevisions}
            </Otherwise>
          </Choose>
        </div>
        <div className="settingsCheckboxesShow">
          <Checkbox
            value={singleSharingSettings.revisionsShow}
            onChange={onChangeSetting.bind(null, 'revisionsShow')}
            disabled={disabled || isRevisionsNotAllowed}
          />
        </div>
      </div>
      <div className="settingsCheckboxesRow">
        <div className="settingsCheckboxesTitle">
          <Choose>
            <When condition={isCommentsNotAllowed}>
              {localization.SCREEN_ASSET_SHARING.labelCommentsDisabled}{' '}
              <UpgradePlan tooltip={localization.UPGRADE_PLAN.tooltipPlanLimitations} />
            </When>
            <Otherwise>
              {localization.SCREEN_ASSET_SHARING.labelComments}
            </Otherwise>
          </Choose>
        </div>
        <div className="settingsCheckboxesChange">
          <Checkbox
            value={singleSharingSettings.comment}
            onChange={onChangeSetting.bind(null, 'comment')}
            disabled={!singleSharingSettings.commentShow || disabled || isCommentsNotAllowed}
          />
        </div>
        <div className="settingsCheckboxesShow">
          <Checkbox
            value={singleSharingSettings.commentShow}
            onChange={onChangeSetting.bind(null, ['commentShow', 'comment'])}
            disabled={disabled || isCommentsNotAllowed}
          />
        </div>
      </div>
    </div>
  </div>
);
