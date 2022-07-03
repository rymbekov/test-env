/* eslint-disable max-len */
/* eslint-disable no-useless-catch */
import React from 'react';
import { unwrapResult } from '@reduxjs/toolkit';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { string, shape, func } from 'prop-types';
import ScreenTab from '../ScreenTab';
import ErrorBoundary from '../ErrorBoundary';
import ToolbarScreenTop from '../toolbars/ToolbarScreenTop';

import Logger from '../../services/Logger';
import ua from '../../ua';
import Icon from '../Icon';

import { isUnauthorized } from '../../store/helpers/user';
import localization from '../../shared/strings';

import * as userActions from '../../store/actions/user';
import StripeFooter from './StripeFooter';
import Invoices from './Invoices';
import Info from './Info';
import Overview from './Overview';
import Card from './Card';
import { back } from '../../helpers/history';

const PAY_AS_YOU_GO = 'payg';

class Billing extends React.Component {
  isMobile = ua.browser.isNotDesktop();

  planNames = {};

  state = {
    tmpChosenPlan: null,
    tmpChosenPayAsYouGo: {
      websites: null,
      teammates: null,
    },
    invoices: null,
    errors: {},
    address: null,
    config: null,
    plans: null,
    isPlansLoading: false,
  };

  configTabs = [
    {
      id: 'overview',
      title: localization.BILLING.tabTitleOverview,
      icon: 'billOverview',
      content: () => {
        return (
          <ErrorBoundary className="errorBoundaryComponent">
            <Overview />
          </ErrorBoundary>
        );
      },
    },
    {
      id: 'info',
      title: localization.BILLING.tabTitleInfo,
      icon: 'billInfo',
      content: () => {
        const handlers = {
          onBlurNameInput: this.changeCustomerName,
          onBlurEmailInput: this.changeCustomerEmail,
          onBlurAddressInput: this.changeCustomerAddressField,
          onBlurFooterInput: this.changeCustomerFooter,
          changeCustomerTax: this.changeCustomerTax,
          setError: this.setError,
        };
        const { customer } = this.props.user;
        const { name, email, tax } = customer;
        const address = this.state.address || customer.address || {};
        const { footer } = customer.invoice_settings;

        return (
          <ErrorBoundary className="errorBoundaryComponent">
            <Info
              address={address}
              footer={footer}
              email={email}
              name={name}
              tax={tax}
              handlers={handlers}
              errors={this.state.errors}
            />
          </ErrorBoundary>
        );
      },
    },
    {
      id: 'invoices',
      title: localization.BILLING.tabTitleInvoices,
      icon: 'billInvoice',
      content: () => (
        <ErrorBoundary className="errorBoundaryComponent">
          <Invoices invoices={this.state.invoices} />
        </ErrorBoundary>
      ),
    },
    {
      id: 'card',
      title: localization.BILLING.tabTitleCard,
      icon: 'card',
      content: () => (
        <ErrorBoundary className="errorBoundaryComponent">
          <Card />
        </ErrorBoundary>
      ),
    },
  ];

  componentDidMount() {
    Logger.log('User', 'SettingsBillingShow');
  }

  createPayAsYouGoPlan = (plans) => {
    const paygPlans = [];
    const paygPlanWebsites = plans.find(
      (plan) => plan.plans.length && plan.plans[0].id === 'payg_websites'
    );
    if (paygPlanWebsites) paygPlans.push(paygPlanWebsites.plans[0]);
    const paygPlanTeeammates = plans.find(
      (plan) => plan.plans.length && plan.plans[0].id === 'payg_teammates'
    );
    if (paygPlanTeeammates) paygPlans.push(paygPlanTeeammates.plans[0]);
    const paygPlan = {
      id: PAY_AS_YOU_GO,
      name: 'Pay As You Go',
      description: 'Perfect for individuals',
      plans: paygPlans,
    };
    return paygPlan;
  };

  changeCustomerEmail = async (email) => {
    const { errors } = this.state;
    Logger.log('User', 'SettingsBillingInfoChange');
    const res = await this.props.userActions.updateCustomerEmail(email);
    if (res.error) {
      errors.email = res.error;
      this.setState({ errors });
    } else {
      delete errors.email;
    }
    this.updateView();
  };

  changeCustomerName = async (name) => {
    const { errors } = this.state;
    Logger.log('User', 'SettingsBillingInfoChange');
    const res = await this.props.userActions.updateCustomerName(name);
    if (res.error) {
      errors.name = res.error;
      this.setState({ errors });
    } else {
      delete errors.name;
    }
    this.updateView();
  };

  changeCustomerFooter = async (footer) => {
    const { errors } = this.state;
    Logger.log('User', 'SettingsBillingInfoChange');
    const res = await this.props.userActions.updateCustomerFooter(footer);
    if (res.error) {
      errors.footer = res.error;
      this.setState({ errors });
    } else {
      delete errors.footer;
    }
    this.updateView();
  };

  changeCustomerAddressField = async (key, value) => {
    const { errors } = this.state;
    let address = {};
    if (this.state.address) {
      address = {
        ...this.state.address,
        [key]: value,
      };
    } else {
      address = {
        ...this.props.user.customer.address,
        [key]: value,
      };
    }

    this.setState({ address });

    Logger.log('User', 'SettingsBillingInfoChange');
    const res = await this.props.userActions.updateCustomerAddress(address);
    if (res.error) {
      errors[key] = res.error;
      this.setState({ errors });
    } else {
      delete errors[key];
    }

    this.updateView();
  };

  changeCustomerTax = async (tax, example) => {
    const {
      userActions: { updateUserCustomerTax },
    } = this.props;
    const exampleTemplate = `Enter a value as in the example: [${example}]`;

    if (tax && !tax.value) {
      this.setError('tax', exampleTemplate);
    } else {
      this.setError('tax', null);

      updateUserCustomerTax(tax)
        .then(unwrapResult)
        .catch(() => {
          this.setError('tax', exampleTemplate);
        });
    }
  };

  setError = (name, error = null) => {
    this.setState(({ errors }) => ({
      errors: {
        ...errors,
        [name]: error,
      },
    }));
  };

  destroy = () => {
    Logger.log('User', 'SettingsBillingHide');

    back('/search');
  };

  updateView() {
    this.setState(this.state);
  }

  render() {
    const { actTab, user } = this.props;
    const isMobilePwa = ua.isPWA() && ua.browser.isNotDesktop();

    const currentTabConfig = this.configTabs.find((n) => n.id === actTab);
    const activeTabTitle =
      !this.isMobile && !isMobilePwa
        ? [localization.BILLING.title, currentTabConfig.title]
        : [localization.BILLING.title];

    return (
      <ErrorBoundary className="errorBoundaryPage">
        <div className="pageWrapper wrapperPageBilling">
          <div className="page pageBilling">
            <Choose>
              <When condition={isMobilePwa || ua.isMobileApp()}>
                <ToolbarScreenTop
                  title={activeTabTitle}
                  onClose={this.destroy}
                  helpLink={`myBilling_${currentTabConfig.id}`}
                  unauthorized={isUnauthorized(user)}
                />
                <div className="pageContent">
                  <div className="pageInnerContent">
                    <div className="notice" style={{ margin: '0 auto' }}>
                      <div className="notice__icon">
                        <Icon name="billInvoice" />
                      </div>
                      <div className="notice__text">
                        Billing management is not available from iOS and Android applications.
                        <br />
                        Please use browser version instead.
                      </div>
                    </div>
                  </div>
                </div>
              </When>
              <Otherwise>
                <ToolbarScreenTop
                  title={activeTabTitle}
                  onClose={this.destroy}
                  helpLink={`myBilling_${currentTabConfig.id}`}
                  unauthorized={isUnauthorized(user)}
                />

                <div className="pageContent pageVertical">
                  <aside className="pageSidebar">
                    <ScreenTab
                      name="Billing"
                      configTabs={this.configTabs}
                      rootPath="/billing"
                      actTab={actTab}
                    />
                    <StripeFooter />
                  </aside>
                  <div className="pageInnerContent">{currentTabConfig.content()}</div>
                </div>
              </Otherwise>
            </Choose>
          </div>
        </div>
      </ErrorBoundary>
    );
  }
}

const mapStateToProps = (state) => ({
  actTab: state.router.location.query.tab || 'overview',
  user: state.user,
});
const mapDispatchToProps = (dispatch) => ({
  userActions: bindActionCreators(userActions, dispatch),
});
const ConnectedBilling = connect(mapStateToProps, mapDispatchToProps)(Billing);

Billing.propTypes = {
  actTab: string.isRequired,
  user: shape({
    customer: shape({
      [string]: string,
    }),
  }).isRequired,
  userActions: shape({
    [string]: func,
  }).isRequired,
};

export default (props) => <ConnectedBilling {...props} />;
