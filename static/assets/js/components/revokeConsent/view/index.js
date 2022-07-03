import React from 'react';
import Q from 'q';
import ConfirmComponent from '../../confirmComponent';
import Logger from '../../../services/Logger';
import localization from '../../../shared/strings';
import sdk from '../../../sdk';
import { navigate, reloadApp } from '../../../helpers/history';
import ToolbarScreenTop from '../../toolbars/ToolbarScreenTop';
import { showDialog } from '../../dialog';

export default class RevokeConsent extends React.Component {
  onRevoke = (data, config) => {
    Q(sdk.users.revokeConsent(data))
      .then((resp) => {
        if (resp.data.success) {
          reloadApp();
        } else {
          config.handlerNotSuccess();
        }
      })
      .catch((err) => {
        Logger.error(new Error('Can not revoke consent'), { error: err }, [
          'RevokeConsentFailed',
          (err && err.message) || 'NoMessage',
        ]);
        showDialog({
          title: localization.SERVER_ERROR.title,
          text: localization.SERVER_ERROR.text,
          textBtnCancel: null,
        });
      });
  };

  onDestroy = () => {
    navigate('/users/me?tab=legal');
  };

  render() {
    return (
      <div className="page">
        <ToolbarScreenTop
          title={[localization.ACCOUNT.titleRevokeConsents]}
          onClose={this.onDestroy}
        />
        <ConfirmComponent
          title={localization.ACCOUNT.warningRevokeConsents}
          content={localization.ACCOUNT.contentRevokeConsents}
          labelText={localization.ACCOUNT.labelRevokeConsents}
          buttonText={localization.ACCOUNT.buttonRevokeConsents}
          handler={this.onRevoke}
        />
      </div>
    );
  }
}
