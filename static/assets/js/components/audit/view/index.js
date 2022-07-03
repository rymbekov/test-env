import React from 'react';

import { Provider, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import localization from '../../../shared/strings';

import ScreenTab from '../../ScreenTab';
import ErrorBoundary from '../../ErrorBoundary';
import ToolbarScreenTop from '../../toolbars/ToolbarScreenTop';
import Logger from '../../../services/Logger';
import ua from '../../../ua';

import store from '../../../store';
import * as mainActions from '../../../store/actions/main';

import { isHaveTeammatePermission } from '../../../store/helpers/user';
import AuditTrailTab from './AuditTrailTab';
import AnalyticsTab from './AnalyticsTab';
import { back } from '../../../helpers/history';

class AuditView extends React.Component {
  isMobile = ua.browser.isNotDesktop();

  state = {
    loading: false,
  };

  configTabs = [
    {
      id: 'audit',
      title: localization.AUDIT.logsTab,
      icon: 'audit',
      content: () => (
        <ErrorBoundary className="errorBoundaryComponent">
          <AuditTrailTab
            teammates={this.props.teammates}
            openedTree={this.props.openedTree}
            user={this.props.user}
          />
        </ErrorBoundary>
      ),
    },
    {
      id: 'analytics',
      title: localization.AUDIT.analyticsTab,
      icon: 'analyticsTab',
      content: () => (
        <ErrorBoundary className="errorBoundaryComponent">
          <AnalyticsTab />
        </ErrorBoundary>
      ),
    },
  ];

  destroy = () => {
    Logger.log('User', 'SettingsMyAccountHide');
    back('/search');
  };

  render() {
    const { props, state } = this;

    const currentTabConfig = this.configTabs.find((n) => n.id === props.actTab);
    const activeTabTitle = !this.isMobile
      ? [localization.AUDIT.title, currentTabConfig.title]
      : [localization.AUDIT.title];
    const configTabsWithoutAuditTrail = this.configTabs.filter((item) => item.id !== 'audit');

    return (
      <div className="page pageMyAccount">
        <ToolbarScreenTop
          title={activeTabTitle}
          onClose={this.destroy}
          helpLink={`auditTrail_${currentTabConfig.id}`}
        />
        <div className="pageContent pageVertical">
          <aside className="pageSidebar">
            <ScreenTab
              name="MyAccount"
              configTabs={
                isHaveTeammatePermission('accessAuditTrail')
                  ? this.configTabs
                  : configTabsWithoutAuditTrail
              }
              rootPath="/audit"
              actTab={isHaveTeammatePermission('accessAuditTrail') ? props.actTab : 'analytics'}
            />
          </aside>
          <div className="pageInnerContent">
            {state.loading ? 'Loading' : currentTabConfig.content()}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  actTab: state.router.location.query.tab || 'audit',
  user: state.user,
  openedTree: state.main.openedTree,
  teammates: state.teammates.items,
});
const mapDispatchToProps = (dispatch) => ({
  mainActions: bindActionCreators(mainActions, dispatch),
});
const ConnectedAuditView = connect(mapStateToProps, mapDispatchToProps)(AuditView);

export default (props) => (
  <Provider store={store}>
    <ConnectedAuditView {...props} />
  </Provider>
);
