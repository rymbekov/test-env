import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { activeCollectionSelector } from '../../../store/selectors/collections';
import { allowedActionsSelector, selectedAssetsIdsSelector } from '../../../store/selectors/assets';
import { selectedKeywordsIdsSelector } from '../../../store/selectors/keywords';

import Component from './ToolbarActions';
import * as assetsActions from '../../../store/actions/assets';
import * as collectionsActions from '../../../store/actions/collections';
import * as archiveActions from '../../../store/actions/archive';
import * as keywordsActions from '../../../store/actions/keywords';

const mapStateToProps = (state) => {
  const { inboxId, trashed, archived } = state.router.location.query;
  const { subscriptionFeatures, role } = state.user;
  const { openedTree } = state.main;
  const { permissions: rolePermissions } = role;
  const { websites: websitesAllowed, diffTool } = subscriptionFeatures;
  const { total } = state.assets;
  const { isDetailsOpen, panelsWidth } = state.main;
  const { catalogView } = panelsWidth;
  const { left, right } = catalogView;

  return {
    activeCollection: activeCollectionSelector(state),
    allowedActions: allowedActionsSelector(state),
    diffTool,
    isArchiveView: Boolean(archived),
    isInboxView: Boolean(inboxId),
    rolePermissions,
    selectedAssetsIds: selectedAssetsIdsSelector(state),
    selectedKeywordsIds: selectedKeywordsIdsSelector(state),
    trashed: Boolean(trashed),
    // isArchiveView: Boolean(state.main.openedTree === 'archive' && state.archive.activeCollectionId),
    websitesAllowed,
    openedTree,
    total,
    isDetailsOpen,
    left,
    right,
  };
};

export default connect(
  mapStateToProps,
  (dispatch) => ({
    assetsActions: bindActionCreators(assetsActions, dispatch),
    collectionsActions: bindActionCreators(collectionsActions, dispatch),
    archiveActions: bindActionCreators(archiveActions, dispatch),
    keywordsActions: bindActionCreators(keywordsActions, dispatch),
  }),
)(Component);
