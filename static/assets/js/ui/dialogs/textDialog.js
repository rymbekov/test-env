import { showDialog } from '../../components/dialog';

export default function textDialog(config) {
  let dialogConfig = {
    text: config.html,
    title: config.title,
    onOk() {},
    onCancel() {},
    textBtnCancel: null,
  };

  dialogConfig = { ...dialogConfig, ...config.dialogConfig };

  return showDialog(dialogConfig);
}
