import React from 'react'; // eslint-disable-line
import cn from 'classnames';
import { DatePicker } from '@picsio/ui';
import dayjs from 'dayjs';
import ua from '../../../ua';
import localization from '../../../shared/strings';
import { datePickerPlaceholderWithTime, datePickerDateFormat, datePickerTimeFormat } from '../../../shared/dateLocale';
import Header from './Header';
import LinkSharing from './Link';
import DownloadsSettings from './DownloadsSettings';
import HistorySettings from './HistorySettings';
import InfopanelSettings from './InfopanelSettings';
import ThumbnailSettings from './ThumbnailSettings';
import ErrorBoundary from '../../ErrorBoundary'; // eslint-disable-line
import isAssetImageChecker from '../../details/helpers/isAssetImageChecker';

class ScreenInboxSettings extends React.Component {
  isMobile = ua.browser.isNotDesktop();

  renderExpiresField = () => {
    const { asset = {}, subscriptionFeatures, handlers } = this.props;
    const { singleSharingSettings = {} } = asset;
    const isAssetSharingDisabled = subscriptionFeatures.assetSharing === false;

    let expiresDate;
    if (!this.isMobile) {
      expiresDate = singleSharingSettings.expiresAt
      && dayjs(singleSharingSettings.expiresAt).isValid()
        ? new Date(singleSharingSettings.expiresAt)
        : null;
    } else {
      expiresDate = singleSharingSettings.expiresAt
      && dayjs(singleSharingSettings.expiresAt).isValid()
        ? dayjs(singleSharingSettings.expiresAt).format('YYYY-MM-DD')
        : '';
    }

    return (
      <div className="expiresField">
        <div className="expiresFieldTitle">Expires at</div>
        <DatePicker
          selected={expiresDate}
          placeholderText={datePickerPlaceholderWithTime}
          onChange={(value) => handlers.onChangeSetting('expiresAt', value)}
          showTimeSelect
          datePickerTimeFormat={datePickerTimeFormat}
          datePickerDateFormat={`${datePickerDateFormat} ${datePickerTimeFormat}`}
          timeCaption="time"
          minDate={new Date()}
          disabled={isAssetSharingDisabled}
        />
      </div>
    );
  };

  render() {
    const { props } = this;
    const {
      asset, subscriptionFeatures, inProgress, handlers,
    } = props;
    const { singleSharingSettings = {}, fileExtension } = asset;
    const isAssetSharingDisabled = subscriptionFeatures.assetSharing === false;
    const isCommentsNotAllowed = !subscriptionFeatures.comments;
    const isRevisionsNotAllowed = !subscriptionFeatures.revisions;
    const isAssetImage = isAssetImageChecker(fileExtension);

    return (
      <div className={cn('sharingSettings', { disabled: inProgress })}>
        <Header
          assetName={asset.name}
          singleSharingSettings={singleSharingSettings}
          onChangeSetting={handlers.onChangeSetting}
          disabled={isAssetSharingDisabled}
        />
        <LinkSharing
          assetId={asset._id}
          title={localization.DETAILS.textShareLink}
          isDisabledCopy={!singleSharingSettings.isShared}
        />
        <If condition={isAssetImage}>
          <LinkSharing
            assetId={asset._id}
            title={localization.DETAILS.textDirectLink}
            thumbnail
            isDisabledCopy={!singleSharingSettings.isShared}
          />
        </If>
        {this.renderExpiresField()}
        <DownloadsSettings
          singleSharingSettings={singleSharingSettings}
          onChangeSetting={handlers.onChangeSetting}
          disabled={isAssetSharingDisabled}
        />
        <HistorySettings
          singleSharingSettings={singleSharingSettings}
          onChangeSetting={handlers.onChangeSetting}
          disabled={isAssetSharingDisabled}
          isCommentsNotAllowed={isCommentsNotAllowed}
          isRevisionsNotAllowed={isRevisionsNotAllowed}
        />
        <InfopanelSettings
          singleSharingSettings={singleSharingSettings}
          onChangeSetting={handlers.onChangeSetting}
          disabled={isAssetSharingDisabled}
        />
        <ThumbnailSettings
          singleSharingSettings={singleSharingSettings}
          onChangeSetting={handlers.onChangeSetting}
          disabled={isAssetSharingDisabled}
        />
      </div>
    );
  }
}

export default ScreenInboxSettings;
