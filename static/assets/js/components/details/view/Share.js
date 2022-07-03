import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { CSSTransition } from 'react-transition-group';
import { IconButton, Button } from '@picsio/ui';
import { Link, Settings } from '@picsio/ui/dist/icons';
import localization from '../../../shared/strings';
import picsioConfig from '../../../../../../config';
import { Input, Checkbox } from '../../../UIComponents';
import Logger from '../../../services/Logger';
import { navigate } from '../../../helpers/history';
import UpgradePlan from '../../UpgradePlan';
import isAssetImageChecker from '../helpers/isAssetImageChecker';
import sendEventToIntercom from '../../../services/IntercomEventService';
import copyTextToClipboard from '../../../helpers/copyTextToClipboard';

const Share = (props) => {
  const [isFocused, setFocused] = useState(false);
  const {
    asset,
    assetSharingAllowed,
    onChange,
    isVisible,
    inProgress,
    toggleVisibility,
    disabled,
  } = props;
  const { _id: assetId, singleSharingSettings, fileExtension } = asset;
  const isShared = singleSharingSettings?.isShared;
  const link = `${picsioConfig.SHOW_PICSIO_DOMAIN}/preview/${assetId}`;
  const thumbnailLink = `${picsioConfig.getApiBaseUrl()}/preview/${assetId}/thumbnail`;
  const isAssetImage = isAssetImageChecker(fileExtension);

  const handleChange = (value) => {
    onChange(asset._id, 'isShared', value);
    if (!isVisible) {
      toggleVisibility('detailsAssetShareVisibility');
    }
    sendEventToIntercom('share from ipanel');
    const isAssetShared = !!value;
    if (isAssetShared) {
      Logger.log('User', 'InfoPanelShareSingle', { assetId });
    } else {
      Logger.log('User', 'InfoPanelUnShareSingle', { assetId });
    }
  };

  const handleTitleClick = () => toggleVisibility('detailsAssetShareVisibility');

  const handleInputFocus = () => setFocused(true);

  const handleInputBlur = () => setFocused(false);

  const openSettings = () => {
    Logger.log('User', 'InfoPanelShareSingleOptionsShow');
    navigate(`/singlesharing/${assetId}`);
  };

  const copyToClipboard = (e) => {
    Logger.log('User', 'InfoPanelShareSingleCopyLink');
    const assetShareURL = e.currentTarget.dataset.value;
    const toastText = localization.DETAILS.sharedAssetsUrlCopied;
    copyTextToClipboard(assetShareURL, toastText);
  };

  return (
    <div
      data-qa="details-component-share"
      className={cn('detailsPanel__item', { act: isVisible, disabled })}
    >
      <div className="detailsPanel__title">
        <span
          className={cn('detailsPanel__title_text',
            { withoutTriangle: !isShared || !assetSharingAllowed })}
          onClick={isShared ? handleTitleClick : null}
        >
          {localization.DETAILS.textShare}
        </span>
        <If condition={!assetSharingAllowed}>
          <UpgradePlan text={localization.UPGRADE_PLAN.textForHigherPlan} />
        </If>
        <If condition={isShared && !disabled && assetSharingAllowed}>
          <IconButton
            onClick={openSettings}
            size="md"
            color="primary"
            className="picsioLink"
          >
            <Link />
          </IconButton>
        </If>
        <div className="detailsPanel__title_buttons">
          <If condition={!disabled}>
            <Checkbox
              slide
              inProgress={inProgress}
              value={isShared}
              onChange={handleChange}
              icon="share"
              disabled={!assetSharingAllowed}
            />
          </If>
        </div>
      </div>
      <CSSTransition in={isVisible && isShared} timeout={300} classNames="fade">
        <>
          <If condition={isVisible && assetSharingAllowed && isShared}>
            <div className="sharingLink">{localization.DETAILS.textShareLink}</div>
            <div className={cn('fieldCopyTo', { isFocused })}>
              <div className="fieldCopyToHolder">
                <Input
                  value={link}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className="fieldCopyToUrl"
                />
                <IconButton
                  onClick={openSettings}
                  size="md"
                  className="fieldCopyToSettings"
                >
                  <Settings />
                </IconButton>
              </div>
              <Button
                id="button-copy-url"
                onClick={copyToClipboard}
                variant="contained"
                size="md"
                color="secondary"
                componentProps={{
                  'data-value': link,
                }}
              >
                {localization.DETAILS.textCopy}
              </Button>
            </div>
            <If condition={isAssetImage}>
              <div className="directLink">{localization.DETAILS.textDirectLink}</div>
              <div className={cn('fieldCopyTo', { isFocused })}>
                <div className="fieldCopyToHolder">
                  <Input
                    value={thumbnailLink}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    className="fieldCopyToUrl"
                  />
                </div>
                <Button
                  id="button-copy-url"
                  onClick={copyToClipboard}
                  variant="contained"
                  size="md"
                  color="secondary"
                  componentProps={{
                    'data-value': thumbnailLink,
                  }}
                >
                  {localization.DETAILS.textCopy}
                </Button>
              </div>
            </If>
            <div className="detailsPanel__item-button">
              <Button
                id="button-invite"
                onClick={() => {
                  navigate('/teammates?tab=teammates');
                  Logger.log('User', 'InfoPanelShareSingleInviteTeammate');
                }}
                variant="contained"
                size="md"
                color="secondary"
                fullWidth
              >
                {localization.DETAILS.textInviteTeammates}
              </Button>
            </div>
          </If>
        </>
      </CSSTransition>
    </div>
  );
};

Share.defaultProps = {
  disabled: false,
};

/** propTypes */
Share.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  inProgress: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  assetSharingAllowed: PropTypes.bool.isRequired,
  asset: PropTypes.object.isRequired,
  toggleVisibility: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default memo(Share);
