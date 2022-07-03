import React from 'react';

import { Watermarking as WatermarkingIcon, Brain } from '@picsio/ui/dist/icons';
import { Provider, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ErrorBoundary from '../../ErrorBoundary';
import ToolbarScreenTop from '../../toolbars/ToolbarScreenTop';
import ua from '../../../ua';

import Spinner from '../../spinner';
import ScreenTab from '../../ScreenTab';

import Logger from '../../../services/Logger';
import localization from '../../../shared/strings';

/** Store */
import store from '../../../store';
import * as userActions from '../../../store/actions/user';
import * as billingActions from '../../../store/actions/billing';
import * as rolesActions from '../../../store/reducers/roles';
import * as teamActions from '../../../store/reducers/teammates';
import Watermarking from './Watermarking';
import AIKeywords from './AIKeywords';
import Integrations from './integrations';
import Branding from './branding';
import Roles from './roles';
import Teammates from './teammates';
import Settings from './settings';
import Analytics from './Analytics';
import Security from './Security';
import { back } from '../../../helpers/history';

class TeamView extends React.Component {
  isMobile = ua.browser.isNotDesktop();

  state = {
    invitingTeammate: false,
  };

  configTabs = [
    {
      id: 'settings',
      title: localization.TEAMMATES.tabSettings,
      icon: 'myAccSettings',
      content: () => (
        <ErrorBoundary className="errorBoundaryComponent">
          <Settings />
        </ErrorBoundary>
      ),
    },
    {
      id: 'teammates',
      title: localization.TEAMMATES.tabTeammates,
      icon: 'users',
      // badge: `${this.props.subscriptionFeatures.teammatesCountIncludingPending}/${this.props.subscriptionFeatures.teammatesLimit}`,
      badge: `${
        this.props.teammates.items.filter(
          (teammate) => teammate.status !== 'Requested' && teammate.status !== 'owner',
        ).length
      }/${this.props.subscriptionFeatures.teammatesLimit}`,
      content: () => {
        const handlers = {
          onInitSpinner: this.initSpinner,
          onDestroySpinner: this.destroySpinner,
        };

        return (
          <ErrorBoundary className="errorBoundaryComponent">
            <Teammates invitingTeammate={this.state.invitingTeammate} handlers={handlers} />
          </ErrorBoundary>
        );
      },
    },
    {
      id: 'roles',
      title: localization.TEAMMATES.tabRoles,
      icon: 'clearEye',
      content: () => (
        <ErrorBoundary className="errorBoundaryComponent">
          <Roles />
        </ErrorBoundary>
      ),
    },
    {
      id: 'security',
      title: localization.TEAMMATES.tabSecurity,
      icon: 'websitePass',
      content: () => (
        <ErrorBoundary className="errorBoundaryComponent">
          <Security
            team={this.props.team}
            userActions={this.props.userActions}
            subscriptionFeatures={this.props.subscriptionFeatures}
          />
        </ErrorBoundary>
      ),
    },
    {
      id: 'branding',
      title: localization.TEAMMATES.tabBranding,
      icon: 'branding',
      content: () => (
        <ErrorBoundary className="errorBoundaryComponent">
          <Branding
            // team={this.props.team}
            subscriptionFeatures={this.props.subscriptionFeatures}
            helpLink={`myTeam_${this.configTabs.find((n) => n.id === this.props.actTab).id}`}
          />
        </ErrorBoundary>
      ),
    },
    {
      id: 'analytics',
      title: localization.TEAMMATES.tabAnalytics,
      icon: 'analyticsTab',
      content: () => <Analytics />,
    },
    {
      id: 'integrations',
      title: localization.TEAMMATES.tabIntegrations,
      icon: 'path',
      content: () => (
        <ErrorBoundary className="errorBoundaryComponent">
          <Integrations
            helpLink={`myTeam_${this.configTabs.find((n) => n.id === this.props.actTab).id}`}
            team={this.props.team}
            apiKey={this.props.apiKey}
            subscriptionFeatures={this.props.subscriptionFeatures}
          />
        </ErrorBoundary>
      ),
    },
    {
      id: 'watermarking',
      title: 'Watermarking',
      icon: <WatermarkingIcon className="svg-icon" />,
      content: () => (
        <ErrorBoundary className="errorBoundaryComponent">
          <Watermarking />
        </ErrorBoundary>
      ),
    },
    {
      id: 'aiKeywords',
      title: 'Artificial Intelligence',
      icon: <Brain className="svg-icon" />,
      content: () => (
        <ErrorBoundary className="errorBoundaryComponent">
          <AIKeywords
            subscriptionFeatures={this.props.subscriptionFeatures}
            user={this.props.user}
            addCard={this.props.billingActions.changeCard}
            buyKeywords={this.props.billingActions.buyKeywords}
            userActions={this.props.userActions}
          />
        </ErrorBoundary>
      ),
    },
  ];

  render() {
    const { props } = this;
    const { featureFlags } = props.team;
    const currentTabConfig = this.configTabs.find((n) => n.id === props.actTab);
    const activeTabTitle = !this.isMobile
      ? [localization.TEAMMATES.title, currentTabConfig.title]
      : [localization.TEAMMATES.title];
    return (
      <div className="page pageTeam">
        <ToolbarScreenTop
          title={activeTabTitle}
          onClose={this.destroy}
          helpLink={`myTeam_${currentTabConfig.id}`}
        />
        <div className="pageContent pageVertical">
          <aside className="pageSidebar">
            <ScreenTab
              name="MyTeam"
              configTabs={this.configTabs}
              rootPath="/teammates"
              actTab={props.actTab}
              featureFlags={featureFlags}
            />
          </aside>
          <div className="pageInnerContent">{currentTabConfig.content()}</div>
        </div>
      </div>
    );
  }

  componentWillUnmount() {
    this.destroySpinner();
  }

  initSpinner = () => {
    this.destroySpinner();
    this.spinner = new Spinner({
      parentEl: document.querySelector('.wrapperPageTeam'),
      classList: ['partial'],
    });
  };

  destroySpinner = () => {
    this.spinner && this.spinner.destroy();
  };

  destroy = () => {
    Logger.log('User', 'SettingsMyTeamHide');
    back();
  };
}

const mapStateToProps = (state) => ({
  actTab: state.router.location.query.tab || 'teammates',
  apiKey: state.user.apiKey,
  team: state.user.team,
  teammates: state.teammates,
  user: state.user,
  subscriptionFeatures: state.user.subscriptionFeatures,
});
const mapDispatchToProps = (dispatch) => ({
  userActions: bindActionCreators(userActions, dispatch),
  rolesActions: bindActionCreators(rolesActions, dispatch),
  teamActions: bindActionCreators(teamActions, dispatch),
  billingActions: bindActionCreators(billingActions, dispatch),
});
const ConnectedTeamView = connect(mapStateToProps, mapDispatchToProps)(TeamView);

export default (props) => (
  <Provider store={store}>
    <ConnectedTeamView {...props} />
  </Provider>
);
