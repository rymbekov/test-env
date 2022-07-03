import localization from '../../shared/strings';

const list = {
  Catalog: {
    [localization.HOTKEYS.actionSelectDeselect]: {
      value: 'Command A',
    },
    [localization.HOTKEYS.actionImportpanel]: {
      value: 'Command I',
    },
    [localization.HOTKEYS.actionTreeCollections]: {
      value: 'Command C',
    },
    [localization.HOTKEYS.actionInfopanel]: {
      value: 'Command M',
    },
    [localization.HOTKEYS.actionSearch]: {
      value: 'Command F',
    },
    [localization.HOTKEYS.actionDialogHotkeys]: {
      value: 'Command /',
    },
    [localization.HOTKEYS.actionScrollUp]: {
      value: 'Up',
    },
    [localization.HOTKEYS.actionScrollDown]: {
      value: 'Down',
    },
    [localization.HOTKEYS.actionScrollUpPage]: {
      value: 'Fn Up',
    },
    [localization.HOTKEYS.actionScrollDownPage]: {
      value: 'Fn Down',
    },
    [localization.HOTKEYS.actionScrollToBegining]: {
      value: 'Fn Left',
    },
    [localization.HOTKEYS.actionScrollToEnd]: {
      value: 'Fn Right',
    },
  },

  Selection: {
    [localization.HOTKEYS.actionMassDownload]: {
      value: 'Command D',
    },
    [localization.HOTKEYS.actionFlagApprove]: {
      value: 'Command P',
    },
    [localization.HOTKEYS.actionFlagReject]: {
      value: 'Command X',
    },
    [localization.HOTKEYS.actionUnflag]: {
      value: 'Command U',
    },
    [localization.HOTKEYS.actionRating]: {
      value: 'Option 1-5',
    },

    [localization.HOTKEYS.actionColorRed]: {
      value: 'Command 6',
    },
    [localization.HOTKEYS.actionColorYellow]: {
      value: 'Command 7',
    },
    [localization.HOTKEYS.actionColorGreen]: {
      value: 'Command 8',
    },
    [localization.HOTKEYS.actionColorBlue]: {
      value: 'Command 9',
    },
    [localization.HOTKEYS.actionColorNone]: {
      value: 'Command 0',
    },
    [localization.HOTKEYS.actionSelectOneAsset]: {
      value: 'Option',
    },
    [localization.HOTKEYS.actionSelectSomeAssets]: {
      value: 'Command',
    },
    [localization.HOTKEYS.actionSelectRangeAssets]: {
      value: 'Shift',
    },
  },

  Preview: {
    [localization.HOTKEYS.actionPrevImg]: {
      value: 'Left',
    },
    [localization.HOTKEYS.actionNextImg]: {
      value: 'Right',
    },
    [localization.HOTKEYS.actionClosePreview]: {
      value: 'Esc',
    },
    [localization.HOTKEYS.actionInfopanel]: {
      value: 'Command I',
    },
    [localization.HOTKEYS.actionHistorypanel]: {
      value: 'Command H',
    },
  },
};

const isMAC = navigator.userAgent.toString().toLowerCase().includes('mac');

Object.values(list).forEach((categoryList) => {
  Object.values(categoryList).forEach((data) => {
    if (!isMAC) data.value = data.value.replace('Option', 'Alt');
    if (!isMAC) data.value = data.value.replace('Command', 'Ctrl');

    if (!isMAC) data.value = data.value.replace('Fn Up', 'Page up');
    if (!isMAC) data.value = data.value.replace('Fn Down', 'Page down');
    if (!isMAC) data.value = data.value.replace('Fn Left', 'Home');
    if (!isMAC) data.value = data.value.replace('Fn Right', 'End');
  });
});

export default list;
