import React from 'react';
import Q from 'q';
import ConfirmComponent from '../../confirmComponent';
import localization from '../../../shared/strings';
import ToolbarScreenTop from '../../toolbars/ToolbarScreenTop';
import Logger from '../../../services/Logger';
import sdk from '../../../sdk';
import { navigate } from '../../../helpers/history';
import { showDialog } from '../../dialog';

export default class DeleteAllData extends React.Component {
  onDelete = (data, config) => Q(sdk.users.deleteAccount(data))
    .then((resp) => {
      if (resp.data.success) {
        showDialog({
          title: null,
          text: localization.ACCOUNT.dailogTextDeleteAllData,
          onOk: () => this.onDestroy(),
          onCancel: () => this.onDestroy(),
          textBtnCancel: null,
        });
      } else {
        config.handlerNotSuccess();
      }
    })
    .catch((err) => {
      showDialog({
        title: localization.SERVER_ERROR.title,
        text: localization.SERVER_ERROR.text,
        textBtnCancel: null,
      });
      Logger.error(new Error('Error deleting account'), { error: err }, [
        'DeleteAccount',
        (err && err.message) || 'NoMessage',
      ]);
    });

  onDestroy = () => {
    navigate('/users/me?tab=legal');
  };

  render() {
    return (
      <div className="page">
        <ToolbarScreenTop
          title={[localization.ACCOUNT.titleDeleteAllData]}
          onClose={this.onDestroy}
        />
        <ConfirmComponent
          title={localization.ACCOUNT.warningDeleteAllData}
          content={localization.ACCOUNT.contentDeleteAllData}
          labelText={localization.ACCOUNT.labelDeleteAllData}
          buttonText={localization.ACCOUNT.buttonDeleteAllData}
          handler={this.onDelete}
        />
      </div>
    );
  }
}
