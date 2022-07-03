import React, { useState } from 'react';

import { Input } from '../../../UIComponents';
import localization from '../../../shared/strings';

import Consent from '../../Websites/Tabs/Consent';

export default function ({ inbox, handlers }) {
  const [password, setPassword] = useState(inbox.password || '');
  const [confirm, setConfirm] = useState(inbox.password || '');
  const [error, setError] = useState(null);

  const checkValidPassword = () => {
    if (password !== confirm) {
      setError(localization.INBOXSETTINGS.textPasswordConfirm);
    } else {
      setError(null);
      handlers.onChangePassword(password, confirm);
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
            isEnable={inbox.visitingConsentEnable}
            title={inbox.visitingConsentTitle || localization.CONSENT.INBOX.VISITING.defaultTitle}
            message={inbox.visitingConsentMessage || localization.CONSENT.INBOX.VISITING.defaultMessage}
            labelStatus={localization.CONSENT.INBOX.VISITING.labelStatus}
            labelTitle={localization.CONSENT.INBOX.VISITING.labelTitle}
            labelMessage={localization.CONSENT.INBOX.VISITING.labelMessage}
            onChangeStatus={handlers.onChangeConsentVisiting}
            onChangeTitle={handlers.onChangeConsentVisitingTitle}
            onChangeMessage={handlers.onChangeConsentVisitingMessage}
          />
          <Consent
            isEnable={inbox.actionConsentEnable}
            title={inbox.actionConsentTitle || localization.CONSENT.INBOX.ACTION.defaultTitle}
            message={inbox.actionConsentMessage || localization.CONSENT.INBOX.ACTION.defaultMessage}
            labelStatus={localization.CONSENT.INBOX.ACTION.labelStatus}
            labelTitle={localization.CONSENT.INBOX.ACTION.labelTitle}
            labelMessage={localization.CONSENT.INBOX.ACTION.labelMessage}
            onChangeStatus={handlers.onChangeConsentUploading}
            onChangeTitle={handlers.onChangeConsentUploadingTitle}
            onChangeMessage={handlers.onChangeConsentUploadingMessage}
          />
        </div>
      </div>
    </div>
  );
}
