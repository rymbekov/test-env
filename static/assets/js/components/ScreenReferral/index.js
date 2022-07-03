import React from 'react';

import Logger from '../../services/Logger';
import localization from '../../shared/strings';
import ToolbarScreenTop from '../toolbars/ToolbarScreenTop';
import './styles/styles.scss';
import store from '../../store';
import InviteForm from './InviteForm';
import { back } from '../../helpers/history';
import copyTextToClipboard from '../../helpers/copyTextToClipboard';

const referralLinks = {
  email: 'http://bit.ly/37K5N6v',
  facebook: 'http://bit.ly/3ulIdqm',
  linkedin: 'http://bit.ly/2Nz0P5K',
  twitter: 'http://bit.ly/3qRoTPx',
  direct: 'http://bit.ly/3kkwh3r',
};

export default function ScreenReferral() {
  Logger.log('User', 'ReferralPageShow');

  const destroy = () => {
    Logger.log('User', 'ReferralPageHide');
    back();
  };

  const userId = store.getState().user.authorizedUsers[0]._id;

  const copyToClipboard = (message) => {
    const toastText = localization.DETAILS.messageCopied;
    copyTextToClipboard(message, toastText);
  };

  return (
    <div className="pageWrapper wrapperReferralPage">
      <div className="page pageReferral">
        <ToolbarScreenTop
          title={[localization.REFERRAL.title]}
          onClose={destroy}
          helpLink="referralProgram"
        />
        <div className="innerContent">
          <div className="innerContentWrapper">
            <div className="pageReferralTitle">
              Get <b>50$</b> for each friend you refer
            </div>
            <div className="pageReferralDescription">
              Share a referral link with friends to give a 50$ discount off their
              first payment (>Micro).<br /><br />When they subscribe to any plan
              starting with Micro and higher, you will get a 50$ bonus to your account.
            </div>
            <InviteForm
              userId={userId}
              referralLinks={referralLinks}
              copyToClipboard={copyToClipboard}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
