import DontShowAgain from '../../../ui/alerts/dontShowAgainAlert';

const showInfoPopupSelectAll = () => {
  /** if desktop browser */
  const key = ~window.navigator.userAgent.toString().toLowerCase().indexOf('mac')
    ? 'cmd'
    : 'ctrl';
  DontShowAgain({
    name: 'popupSelectionInfo',
    txt: `You may select files using:<br />&mdash; "${key} + mouse click" - selects a file<br />&mdash; "shift + mouse click" - selects a files range<br />&mdash; "${key} + A" - selects all the files respecting current filter`,
    btnTxt: "Don't show it again",
    disallowOpenFewTimes: true,
    hideClose: false,
  });
};

export default showInfoPopupSelectAll;
