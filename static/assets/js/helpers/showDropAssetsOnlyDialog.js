import localization from '../shared/strings';
import { showDialog } from '../components/dialog';

export default function showDropAssetsOnlyDialog() {
  const {
    TITLE, TEXT, TEXT_CANCEL, TEXT_OK,
  } = localization.DIALOGS.DRAG_AND_DROP_ONLY_ASSETS;
  showDialog({
    title: TITLE,
    text: TEXT,
    textBtnCancel: TEXT_CANCEL,
    textBtnOk: TEXT_OK,
  });
}
