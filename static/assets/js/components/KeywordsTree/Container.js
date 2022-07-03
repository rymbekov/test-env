import { connect } from 'react-redux';
import Component from './Keywords';

const mapStateToProps = (state) => ({
  activeKeywords: state.keywords.activeKeywords,
  all: state.keywords.all,
  isKeywordsActionsAllowed: state.user.isKeywordsActionsAllowed,
  isAddKeywordsOutsideVocabulary: state.user.role.permissions.addKeywordsOutsideVocabulary,
  isLoaded: state.keywords.isLoaded,
  isLoading: state.keywords.isBusy,
  isBusy: state.keywords.isBusy,
  error: state.keywords.error,
  panelWidth: state.main.panelsWidth.catalogView.left,
  rolePermissions: state.user.role.permissions,
  searchQuery: state.keywords.searchQuery,
  selectedKeywords: state.keywords.selectedKeywords,
  sortType: state.user.keywordsSortType || state.keywords.sortType,
  tree: state.keywords.tree,
});

export default connect(mapStateToProps)(Component);
