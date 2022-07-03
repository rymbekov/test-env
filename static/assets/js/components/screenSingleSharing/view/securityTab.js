import React, { useState } from 'react';

import { Input } from '../../../UIComponents';
import localization from '../../../shared/strings';

import Consent from '../../Websites/Tabs/Consent';

export default function ({ asset, handlers }) {
  const [password, setPassword] = useState(asset.password || '');
  const [confirm, setConfirm] = useState(asset.password || '');
  const [error, setError] = useState(null);
  const [singleSharingSettings, setSingleSharingSettings] = useState(asset.singleSharingSettings || {});

  const checkValidPassword = () => {
    if (password !== confirm) {
      setError(localization.INBOXSETTINGS.textPasswordConfirm);
    } else {
      setError(null);
      handlers.onChangeSetting('password', password);
    }
  };

  const onChangePassword = (e) => {
    setPassword(e.currentTarget.value);
    setError(null);
  };

  const onChangeConfirm = (e) => {
    setConfirm(e.currentTarget.value);
    setError(null);
  };

  return (
    <div className="pageTabsContent__mainOptions">
      <div className="pageItem">
        <div className="pageItemTitle">{localization.WEBSITES.textPassword}</div>
        <div className="pageWebsites__inputsBlock__content mediumInput">
          <form autoComplete="off" className="pageWebsites__inputsBlock__password">
            <div>
              <Input
                label={localization.WEBSITES.labelTypePassword}
                type="password"
                value={password}
                onBlur={checkValidPassword}
                onChange={onChangePassword}
              />
            </div>
            <div>
              <Input
                label={localization.WEBSITES.labelConfirmPassword}
                type="password"
                value={confirm}
                error={error}
                onBlur={checkValidPassword}
                onChange={onChangeConfirm}
              />
            </div>
          </form>
        </div>
      </div>
      <div className="pageItem">
        <div className="pageItemTitle">{localization.CONSENT.title}</div>
        <div className="mediumInput">
          <Consent
            isEnable={singleSharingSettings.visitingConsentEnable}
            title={singleSharingSettings.visitingConsentTitle || localization.CONSENT.SAS.VISITING.defaultTitle}
            message={singleSharingSettings.visitingConsentMessage || localization.CONSENT.SAS.VISITING.defaultMessage}
            labelStatus={localization.CONSENT.SAS.VISITING.labelStatus}
            labelTitle={localization.CONSENT.SAS.VISITING.labelTitle}
            labelMessage={localization.CONSENT.SAS.VISITING.labelMessage}
            onChangeStatus={handlers.onChangeConsentVisiting}
            onChangeTitle={handlers.onChangeConsentVisitingTitle}
            onChangeMessage={handlers.onChangeConsentVisitingMessage}
          />
          <Consent
            isEnable={singleSharingSettings.actionConsentEnable}
            title={singleSharingSettings.actionConsentTitle || localization.CONSENT.SAS.ACTION.defaultTitle}
            message={singleSharingSettings.actionConsentMessage || localization.CONSENT.SAS.ACTION.defaultMessage}
            labelStatus={localization.CONSENT.SAS.ACTION.labelStatus}
            labelTitle={localization.CONSENT.SAS.ACTION.labelTitle}
            labelMessage={localization.CONSENT.SAS.ACTION.labelMessage}
            onChangeStatus={handlers.onChangeConsentDownloading}
            onChangeTitle={handlers.onChangeConsentDownloadingTitle}
            onChangeMessage={handlers.onChangeConsentDownloadingMessage}
          />
        </div>
      </div>
    </div>
  );
}
