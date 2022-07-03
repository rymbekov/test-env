import React from 'react';
import cn from 'classnames';
import picsioConfig from '../../../../../../config';
import { Input } from '../../../UIComponents';
import Icon from '../../Icon';
import Logger from '../../../services/Logger';
import localization from '../../../shared/strings';
import Tooltip from '../../Tooltip';
import copyTextToClipboard from '../../../helpers/copyTextToClipboard';

const copyToClipboard = (e) => {
  Logger.log('User', 'InfoPanelShareSingleOptionsLinkCopied');
  const assetShareURL = e.currentTarget.dataset.value;
  const toastText = localization.DETAILS.sharedAssetsUrlCopied;
  copyTextToClipboard(assetShareURL, toastText);
};
export default ({
  assetId, title, thumbnail, isDisabledCopy,
}) => {
  const link = thumbnail ? `${picsioConfig.getApiBaseUrl()}/preview/${assetId}/thumbnail` : `${picsioConfig.SHOW_PICSIO_DOMAIN}/preview/${assetId}`;

  return (
    <div className="sharingSettingsBlock">
      <div className="sharingSettingsHeading">{title}</div>
      <div className="row sharingLink fieldCopyTo">
        <Input value={link} className="fieldCopyToUrl" />
        <Tooltip
          content={
            isDisabledCopy ? localization.DETAILS.disabledCopyAssetsTooltipText : null
          }
          placement="bottom"
        >
          <div
            className={cn('picsioDefBtn picsioLinkForShare fieldCopyToBtn', { disable: isDisabledCopy })}
            data-value={link}
            style={{ pointerEvents: isDisabledCopy ? 'unset' : 'visible' }}
            onClick={!isDisabledCopy ? copyToClipboard : () => { }}
            onKeyPress={!isDisabledCopy ? copyToClipboard : () => { }}
            aria-label="copy button"
            role="presentation"
          >
            <Icon name="copyToClipboard" />
          </div>
        </Tooltip>
      </div>
    </div>
  );
};
