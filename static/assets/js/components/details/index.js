import React from 'react'; // eslint-disable-line
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ErrorBoundary from '../ErrorBoundary';

/** Store */
import * as actions from '../../store/actions/assets';
import * as mainActions from '../../store/actions/main';
import * as userActions from '../../store/actions/user';

import Details from './view/index';

const DetailsWrapper = ({
  store,
  isDetailsOpen,
  actions,
  mainActions,
  userActions,
  panelName,
  textareaHeightNameLS,
  panelWidth,
  openedTree,
  user,
}) => (
  <ErrorBoundary className="errorBoundaryComponent">
    {isDetailsOpen && (
      <Details
        assets={store.items.filter((asset) => store.selectedItems.includes(asset._id))}
        assetsIds={store.selectedItems}
        total={store.total}
        actions={actions}
        mainActions={mainActions}
        userActions={userActions}
        inProgress={store.inProgress}
        panelName={panelName}
        textareaHeightNameLS={textareaHeightNameLS}
        panelWidth={panelWidth}
        openedTree={openedTree}
        error={store.error}
        user={user}
      />
    )}
  </ErrorBoundary>
);

const mapStateToProps = (store) => ({
  store: store.assets,
  isDetailsOpen: store.main.isDetailsOpen,
  panelWidth: store.main.panelsWidth.catalogView.right,
  openedTree: store.main.openedTree,
  user: store.user,
});

const ConnectedWrapper = connect(
  mapStateToProps,
  (dispatch) => ({
    actions: bindActionCreators(actions, dispatch),
    mainActions: bindActionCreators(mainActions, dispatch),
    userActions: bindActionCreators(userActions, dispatch),
  }),
)(DetailsWrapper);

export default ConnectedWrapper;
