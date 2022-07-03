import { showDialog } from '../../components/dialog';

export default function textAndCheckboxDialog(config) {
  let dialogConfig = {
    title: config.title,
    text: config.html,
    checkbox: {
      label: config.checkboxLabel,
    },
    onOk() {},
    onCancel() {},
  };

  dialogConfig = { ...dialogConfig, ...config.dialogConfig };

  return showDialog(dialogConfig);
}
