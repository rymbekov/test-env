import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { InputControlLabel } from '@picsio/ui';
import { isMobile, isIOS } from 'react-device-detect';

import localization from '../../shared/strings';
import ua from '../../ua';
import picsioConfig from '../../../../../config';
import Tooltip from '../Tooltip';

const DownloadDialogAdditional = (props) => {
  const {
    selectedSettings, onChange, countAssets, canDownloadWithoutWatermark,
  } = props;
  const isOldSafari = ua.browser.isOldSafari();
  const isMainApp = picsioConfig.isMainApp();
  const isProofing = picsioConfig.isProofing();
  const {
    isArchive,
    organizeByCollections,
    withoutWatermark,
  } = selectedSettings;
  const isShowArchiveCheckbox = !isOldSafari && (isMainApp || isProofing);
  const isShowCollectionsCheckbox = countAssets > 1 && (isMainApp || isProofing);
  // download more than 1 asset on mobile iOS devices is only as an archive, user can't change it
  const isArchiveCheckboxDisabled = countAssets > 1 && isMobile && isIOS;

  return (
    <div className="downloadDialog__additional">
      {/* temporary hides checkbox for generate archive in safari */}
      <If condition={isShowArchiveCheckbox}>
        <InputControlLabel
          label={localization.DOWNLOADDIALOG.labelDownloadAs}
          id="archive"
          name="isArchive"
          value={isArchive}
          onChange={onChange}
          disabled={isArchiveCheckboxDisabled}
          control="checkbox"
        />
      </If>
      <If condition={canDownloadWithoutWatermark}>
        <InputControlLabel
          label={localization.DOWNLOADDIALOG.labelDownloadWithoutWatermark}
          id="withoutWatermark"
          name="withoutWatermark"
          value={withoutWatermark}
          onChange={onChange}
          control="checkbox"
        />
      </If>
      <If condition={isShowCollectionsCheckbox}>
        <div className="organizeByCollections">
          <Tooltip content={localization.DOWNLOADDIALOG.tooltipOrganize}>
            <InputControlLabel
              label={localization.DOWNLOADDIALOG.labelOrganizeBy}
              id="collections"
              name="organizeByCollections"
              value={organizeByCollections}
              onChange={onChange}
              disabled={!isArchive}
              control="checkbox"
            />
          </Tooltip>
        </div>
      </If>
    </div>
  );
};

DownloadDialogAdditional.propTypes = {
  selectedSettings: PropTypes.shape({
    isArchive: PropTypes.bool,
    organizeByCollections: PropTypes.bool,
    withoutWatermark: PropTypes.bool,
  }).isRequired,
  canDownloadWithoutWatermark: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  countAssets: PropTypes.number.isRequired,
};

export default memo(DownloadDialogAdditional);
