import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as mainActions from '../../store/actions/main';
import * as assetsActions from '../../store/actions/assets';
import * as collectionsActions from '../../store/actions/collections';
import * as notificationsActions from '../../store/actions/notifications';
import * as lightboardsActions from '../../store/actions/lightboards';
import * as inboxesActions from '../../store/inboxes/actions';
import * as keywordsActions from '../../store/actions/keywords';
import archiveActions from '../../store/actions/archive';

import { getCatalogViewProps } from '../../store/selectors/catalogView';

import Component from './CatalogView';

const mapStateToProps = (state) => {
  const componentProps = getCatalogViewProps(state);
  return componentProps;
};

export default connect(mapStateToProps, (dispatch) => ({
  assetsActions: bindActionCreators(assetsActions, dispatch),
  mainActions: bindActionCreators(mainActions, dispatch),
  collectionsActions: bindActionCreators(collectionsActions, dispatch),
  notificationsActions: bindActionCreators(notificationsActions, dispatch),
  lightboardsActions: bindActionCreators(lightboardsActions, dispatch),
  inboxesActions: bindActionCreators(inboxesActions, dispatch),
  keywordsActions: bindActionCreators(keywordsActions, dispatch),
  archiveActions: bindActionCreators(archiveActions, dispatch),
}))(Component);
