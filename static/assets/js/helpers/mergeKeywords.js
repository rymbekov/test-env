import { bindActionCreators } from 'redux';
import store from '../store';
import Logger from '../services/Logger';
import localization from '../shared/strings';
import showSelectFromTreeDialog from './showSelectFromTreeDialog';
import { merge } from '../store/actions/keywords';

const keywordsActions = bindActionCreators(
  { merge },
  store.dispatch,
);

const mergeKeywords = (selectedIds, expanded) => {
  const { tree } = store.getState().keywords;

  Logger.log('UI', 'MergeToDialog');
  const { TITLE, OK, CANCEL } = localization.DIALOGS.KEYWORDS_MERGE;

  showSelectFromTreeDialog({
    title: TITLE,
    textBtnCancel: CANCEL,
    textBtnOk: OK,
    treeListItems: [{
      ...tree.keywords,
      name: 'Keywords',
    }] || [],
    onLoadChildren: () => {},
    onOk: (id) => {
      Logger.log('User', 'MergeToDialogOk');
      keywordsActions.merge(id[0], selectedIds);
    },
    onCancel: () => Logger.log('User', 'MergeToDialogCancel'),
    openedItems: expanded || ['keywords'],
    disableRoot: true,
    type: 'default',
    iconSpecial: 'keyword',
    disabledItems: ['keywords', ...selectedIds],
  });
};

export default mergeKeywords;
