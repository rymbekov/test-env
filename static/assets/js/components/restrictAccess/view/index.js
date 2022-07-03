import React from 'react';
import Q from 'q';
import { bindActionCreators } from 'redux';
import ConfirmComponent from '../../confirmComponent';
import ToolbarScreenTop from '../../toolbars/ToolbarScreenTop';
import Logger from '../../../services/Logger';
import localization from '../../../shared/strings';

/** Store */
import store from '../../../store';
import { updateUser } from '../../../store/actions/user';
import sdk from '../../../sdk';
import { navigate } from '../../../helpers/history';
import { showDialog } from '../../dialog';

const userActions = bindActionCreators({ updateUser }, store.dispatch);

export default class RestrictAccess extends React.Component {
  onRestrict = (data, config) => Q(sdk.users.restrictProcessing(data))
    .then((resp) => {
      if (resp.data.success) {
        const params = {
          restrictProcessing: true,
          blockmail: true,
        };
        userActions.updateUser(params, false);

        this.onDestroy();
      } else {
        config.handlerNotSuccess();
      }
    })
    .catch((err) => {
      Logger.error(new Error('Error restrict access'), { error: err }, [
        'RestrictAccessFailed',
        (err && err.message) || 'NoMessage',
      ]);
      showDialog({
        title: localization.SERVER_ERROR.title,
        text: localization.SERVER_ERROR.text,
        textBtnCancel: null,
      });
    });

  onDestroy = () => {
    navigate('/users/me?tab=legal');
  };

  render() {
    return (
      <div className="page">
        <ToolbarScreenTop
          title={[localization.ACCOUNT.titleRestrictProcessing]}
          onClose={this.onDestroy}
        />
        <ConfirmComponent
          title={localization.ACCOUNT.warningRestrictProcessing}
          content={localization.ACCOUNT.contentRestrictProcessing}
          labelText={localization.ACCOUNT.labelRestrictProcessing}
          buttonText={localization.ACCOUNT.buttonRestrictProcessing}
          handler={this.onRestrict}
        />
      </div>
    );
  }
}
