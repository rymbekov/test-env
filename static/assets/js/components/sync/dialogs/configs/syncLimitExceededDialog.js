import localization from '../../../../shared/strings';

export default (function () {
  return {
    title: localization.SYNC.textTitleCantStartSync,
    textBtnCancel: null,
    onClose() {},
    onOk() {},
    onCancel() {},
    text: localization.SYNC.textManualSyncLimited,
  };
}());
