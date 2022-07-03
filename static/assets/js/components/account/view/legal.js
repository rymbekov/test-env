import React from 'react';
import clsx from 'classnames';

import Skeleton from 'react-loading-skeleton';
import dayjs from 'dayjs';
import WithSkeletonTheme from '../../WithSkeletonTheme';

import Logger from '../../../services/Logger';
import localization from '../../../shared/strings';
import ua from '../../../ua';

import sdk from '../../../sdk';
import LegalSupportTab from './LegalSupportTab';
import LegalTabActions from './LegalTabActions';
import LegalTabContent from './LegalTabContent';
import { navigate } from '../../../helpers/history';
import { showDialog } from '../../dialog';

const checkExpires = (supportConsentExpiresAt) => {
  const expiresDate = dayjs(supportConsentExpiresAt);
  const nowDate = dayjs();
  const diffDate = expiresDate.diff(nowDate, 'minutes');
  return diffDate;
};

export default class Legal extends React.Component {
  state = {
    isLoading: false,
    activeIndex: 0,
    texts: {},
  };

  tabs = ['Terms of Service', 'Privacy', 'Support'];

  async componentDidMount() {
    try {
      this.setState({ isLoading: true });
      const { data: texts } = await sdk.users.fetchConsents();
      this.setState({ texts, isLoading: false });
    } catch (err) {
      showDialog({
        title: localization.SERVER_ERROR.title,
        text: localization.SERVER_ERROR.text,
        textBtnCancel: null,
      });
      Logger.error(new Error('Error fetching consent'), { error: err }, [
        'SettingsMyAccountLegalPage',
        (err && err.message) || 'NoMessage',
      ]);
      this.setState({ isLoading: false });
    }
  }

  onDeleteAccount = () => {
    navigate('/users/me/delete');
  };

  onRestrictProcessing = () => {
    navigate('/users/me/restrict');
  };

  onHandlePersonalInfo = () => {
    navigate('/users/me/info');
  };

  onToggleSubscription = () => {
    const { user } = this.props;
    const value = !user.blockmail;
    this.props.userActions.updateUser({ blockmail: value }, false);
  };

  onRevokeConsent = () => {
    navigate('/users/me/revoke');
  };

  changeTab = (activeIndex) => {
    this.setState({ activeIndex });
  };

  changeSupportConsent = () => {
    const {
      user: {
        settings: { supportConsentExpiresAt },
      },
      userActions: { updateSupportConsent },
    } = this.props;
    const diffDate = checkExpires(supportConsentExpiresAt);

    if (!supportConsentExpiresAt || diffDate <= 0) {
      showDialog({
        title: localization.SUPPORT.ACCESS_TO_YOUR_ACCOUNT,
        text: localization.SUPPORT.CONSENT,
        onCancel() {
          updateSupportConsent();
        },
        onClose() {},
        textBtnCancel: localization.DIALOGS.UNDERSTAND,
        textBtnOk: localization.DIALOGS.CANCEL,
      });
    } else {
      updateSupportConsent();
    }
  };

  render() {
    const { activeIndex, isLoading, texts } = this.state;
    const { terms, privacy } = texts;
    const { user } = this.props;
    const { blockmail, settings, restrictProcessing } = user;
    const { supportConsentExpiresAt } = settings;
    const permissions = { restrictProcessing: !restrictProcessing };

    const diffDate = checkExpires(supportConsentExpiresAt);

    const actions = [
      {
        id: 'personalInfo',
        link: localization.ACCOUNT.linkSeeAllData,
        onClick: this.onHandlePersonalInfo,
        description: localization.ACCOUNT.textSeeAllData,
      },
      {
        id: 'personalInfoDownload',
        href: '/users/personalInfo?download',
        text: localization.ACCOUNT.linkDownloadAllData,
        description: localization.ACCOUNT.textDownloadAllData,
        notAllowedOnMobile: ua.isMobileApp(),
      },
      {
        id: 'deleteAll',
        link: localization.ACCOUNT.linkDeleteAllData,
        onClick: this.onDeleteAccount,
        description: localization.ACCOUNT.textDeleteAllData,
      },
      {
        id: 'restrict',
        link: localization.ACCOUNT.linkRestrictProcessing,
        text: localization.ACCOUNT.restricted,
        onClick: this.onRestrictProcessing,
        permission: 'restrictProcessing',
        description: localization.ACCOUNT.textRestrictProcessing,
      },
      {
        id: 'revoke',
        link: localization.ACCOUNT.linkRevokeConsents,
        description: localization.ACCOUNT.textRevokeConsents,
        onClick: this.onRevokeConsent,
      },
      {
        id: 'subscribe',
        link: blockmail ? 'Subscribe' : localization.ACCOUNT.linkUnsubscribe,
        onClick: this.onToggleSubscription,
        description: localization.ACCOUNT.textUnsubscribe,
      },
    ];

    return (
      <div className="pageTabsContentLegal">
        <div className="pageTabs">
          {this.tabs.map((tab, index) => {
            const active = activeIndex === index;

            return (
              <button
                key={tab}
                className={clsx({ active })}
                onClick={() => this.changeTab(index)}
                type="button"
              >
                {tab}
              </button>
            );
          })}
        </div>
        <Choose>
          <When condition={activeIndex === 0}>
            <LegalTabContent
              title="Terms of Service"
              isLoading={isLoading}
              html={terms}
              skeleton={
                <WithSkeletonTheme>
                  <p>
                    <Skeleton count={9} />
                  </p>
                  <p>
                    <Skeleton count={2} />
                  </p>
                </WithSkeletonTheme>
              }
            >
              <LegalTabActions actions={actions} permissions={permissions} />
            </LegalTabContent>
          </When>
          <When condition={activeIndex === 1}>
            <LegalTabContent
              title="Privacy Policy"
              isLoading={isLoading}
              html={privacy}
              skeleton={
                <WithSkeletonTheme>
                  <Skeleton count={10} />
                </WithSkeletonTheme>
              }
            >
              <LegalTabActions actions={actions} permissions={permissions} />
            </LegalTabContent>
          </When>
          <When condition={activeIndex === 2}>
            <LegalTabContent
              title="Support"
              isLoading={isLoading}
              content={
                <LegalSupportTab
                  value={Boolean(diffDate > 0)}
                  onChange={this.changeSupportConsent}
                />
              }
              skeleton={
                <WithSkeletonTheme>
                  <Skeleton count={10} />
                </WithSkeletonTheme>
              }
            />
          </When>
          <Otherwise>{null}</Otherwise>
        </Choose>
      </div>
    );
  }
}
