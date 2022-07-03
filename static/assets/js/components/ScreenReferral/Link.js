import React from 'react';
import { string } from 'prop-types';
import { Input } from '../../UIComponents';
import Icon from '../Icon';
import Logger from '../../services/Logger';
import localization from '../../shared/strings';
import copyTextToClipboard from '../../helpers/copyTextToClipboard';

const LinkForm = ({ referralLink }) => {
  const copyToClipboard = (e) => {
    Logger.log('User', 'ReferralLinkCopy');
    const referalLinkURL = e.currentTarget.dataset.value;
    const toastText = localization.DETAILS.referralLinkCopied;
    copyTextToClipboard(referalLinkURL, toastText);
  };

  return (
    <div className="sendInvitesForm">
      <div htmlFor="sendInvitesForm" className="formLabel">
        Share a link
      </div>

      <div className="sendInvitesInviteURLLabel">Referral link:</div>
      <div className="fieldCopyTo sendInvitesInviteURLLine">
        <Input value={referralLink} className="fieldCopyToUrl" readonly />
        <div
          className="picsioDefBtn picsioLinkForShare fieldCopyToBtn"
          data-value={referralLink}
          onClick={copyToClipboard}
          role="presentation"
        >
          <Icon name="copyToClipboard" />
        </div>
      </div>
    </div>
  );
};

LinkForm.propTypes = {
  referralLink: string.isRequired,
};

export default LinkForm;
