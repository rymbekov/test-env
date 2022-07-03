import localization from '../../shared/strings';

export function getRadios(isS3Storage, showRenameOption, showAddRevison) {
  const radios = [
    {
      label: localization.RESOLVEDUPLICATESDIALOG.textKeepBoth,
      value: 'addFile',
      checked: true,
    },
    {
      label: localization.RESOLVEDUPLICATESDIALOG.textAddAsNewRevision,
      value: 'addRevision',
      checked: false,
      dependentOn: 'revisions',
    },
    {
      label: localization.RESOLVEDUPLICATESDIALOG.textReplace,
      value: 'replaceFile',
      checked: false,
    },
    {
      label: localization.RESOLVEDUPLICATESDIALOG.textSkip,
      value: 'skipFile',
      checked: false,
    },
  ];

  if (isS3Storage) {
    /** Remove first option */
    const args = [0, 1];
    if (showRenameOption) {
      /** show rename option only for s3 and not for import */
      args.push({
        label: localization.RESOLVEDUPLICATESDIALOG.textRename,
        value: 'renameFile',
        checked: false,
      });
    }
    radios.splice(...args);
    radios[0].checked = true;
  }
  if (!showAddRevison) {
    radios.splice(1, 1);
  }
  return radios;
}

export const text = localization.RESOLVEDUPLICATESDIALOG.textFileAlreadyExists;
export const checkboxText = localization.RESOLVEDUPLICATESDIALOG.textApplyToAll;
