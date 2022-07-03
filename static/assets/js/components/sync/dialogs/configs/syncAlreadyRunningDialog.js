import localization from '../../../../shared/strings';

export default function makeConfigSyncAlreadyRunningDialog(progress) {
  return {
    title: localization.SYNC.textTitleCantStartSync,
    textBtnCancel: null,
    onClose() {},
    onOk() {},
    onCancel() {},
    text: localization.SYNC.textTextCantStartSyncTemplate(progress),
  };
}
