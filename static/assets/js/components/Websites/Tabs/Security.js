import React, { useState } from 'react';

import { Input } from '../../../UIComponents';
import localization from '../../../shared/strings';

import Consent from './Consent';

function Security({ website, handlers }) {
  const [password, setPassword] = useState(website.password || '');
  const [confirm, setConfirm] = useState(website.password || '');
  const [error, setError] = useState(null);

  const checkValidPassword = () => {
    if (password !== confirm) {
      setError(localization.INBOXSETTINGS.textPasswordConfirm);
    } else {
      setError(null);
      handlers.onChangePassword(password)
    }
  };

  const onChangePassword = e => {
    setPassword(e.currentTarget.value);
    setError(null);
  };

  const onChangeConfirm = e => {
    setConfirm(e.currentTarget.value);
    setError(null);
  };

  return (
    <div className="pageTabsContent__mainOptions">
      <div className="pageItem">
        <div className="pageItemTitle">{localization.WEBSITES.textPassword}</div>
        <div className="pageWebsites__inputsBlock__content  mediumInput">
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
            isEnable={website.visitingConsentEnable}
            title={website.visitingConsentTitle || localization.CONSENT.WEBSITE.VISITING.defaultTitle}
            message={website.visitingConsentMessage || localization.CONSENT.WEBSITE.VISITING.defaultMessage}
            labelStatus={localization.CONSENT.WEBSITE.VISITING.labelStatus}
            labelTitle={localization.CONSENT.WEBSITE.VISITING.labelTitle}
            labelMessage={localization.CONSENT.WEBSITE.VISITING.labelMessage}
            onChangeStatus={handlers.onChangeConsentVisiting}
            onChangeTitle={handlers.onChangeConsentVisitingTitle}
            onChangeMessage={handlers.onChangeConsentVisitingMessage}
          />
          <Consent
            isEnable={website.actionConsentEnable}
            title={website.actionConsentTitle || localization.CONSENT.WEBSITE.ACTION.defaultTitle}
            message={website.actionConsentMessage || localization.CONSENT.WEBSITE.ACTION.defaultMessage}
            labelStatus={localization.CONSENT.WEBSITE.ACTION.labelStatus}
            labelTitle={localization.CONSENT.WEBSITE.ACTION.labelTitle}
            labelMessage={localization.CONSENT.WEBSITE.ACTION.labelMessage}
            onChangeStatus={handlers.onChangeConsentDownloading}
            onChangeTitle={handlers.onChangeConsentDownloadingTitle}
            onChangeMessage={handlers.onChangeConsentDownloadingMessage}
          />
        </div>
      </div>
    </div>
  );
}

export default Security;
