import * as utils from '../../shared/utils';
import Toast from '../../components/Toast';

const listOpenedDialog = [];

const DontShowAgain = (config) => {
  const { name } = config;
  if (!name) {
    alert('prop "name is required"');
  }

  const isPopupDisabledByUser = utils.getCookie(name) && utils.getCookie(name) === true;
  if (isPopupDisabledByUser || (config.disallowOpenFewTimes && ~listOpenedDialog.indexOf(name))) {
    return;
  }

  const alertConfig = {
    onOk() {
      utils.setCookie(name, true);
      const index = listOpenedDialog.indexOf(name);
      ~index && listOpenedDialog.splice(index, 1);
    },
    onClose() {
      const index = listOpenedDialog.indexOf(name);
      ~index && listOpenedDialog.splice(index, 1);
    },
  };
  config.btnTxt && (alertConfig.btnOkValue = config.btnTxt);
  config.hideClose && (alertConfig.hideClose = config.hideClose);

  Toast(config.txt, alertConfig);

  listOpenedDialog.push(name);
};

export default DontShowAgain;
