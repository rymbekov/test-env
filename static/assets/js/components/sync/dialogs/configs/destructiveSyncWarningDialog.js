import localization from '../../../../shared/strings';

export default (function () {
  return {
    title: localization.SYNC.textTitleSyncCancelled,
    textBtnOk: localization.DIALOGS.btnOk,
    textBtnCancel: localization.DIALOGS.btnCancel,
    onClose() {},
    onOk() {},
    onCancel() {},
    text: localization.SYNC.textTextSyncCancelledTemplate,
  };
}());
