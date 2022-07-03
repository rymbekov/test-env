import React from 'react';

import { Provider, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import localization from '../../../shared/strings';

import ScreenTab from '../../ScreenTab';
import ErrorBoundary from '../../ErrorBoundary';
import ToolbarScreenTop from '../../toolbars/ToolbarScreenTop';
import Logger from '../../../services/Logger';
import ua from '../../../ua';

import { getUserDateLocale, setUserDateLocale } from '../../../shared/dateLocale';

/** Store */
import store from '../../../store';
import * as userActions from '../../../store/actions/user';
import Legal from './legal';
import Notifications from './notifications';
import Settings from './settings';
import Profile from './profile';
import Security from './Security';
import { back } from '../../../helpers/history';

const PLACEHOLDERS = {
	fb: 'https://www.facebook.com/',
	twitter: 'https://www.twitter.com/',
	websiteUrl: 'http://',
};

class AccountView extends React.Component {
	isMobile = ua.browser.isNotDesktop();

	state = {
		errors: {},
		userData: {},
		loading: false,
	};

	configTabs = [
		{
			id: 'account',
			title: localization.ACCOUNT.tabTitleProfile,
			icon: 'avatar',
			content: () => {
				return (
					<ErrorBoundary className="errorBoundaryComponent">
						<Profile user={this.props.user} userActions={this.props.userActions} />
					</ErrorBoundary>
				);
			},
		},
		{
			id: 'settings',
			title: localization.ACCOUNT.tabTitleSettings,
			icon: 'myAccSettings',
			content: () => {
				const handlers = {
					onSetPreviewSize: this.setPreviewSize,
					onCheckParallelUpload: this.checkParallelUpload,
					onCheckColorScheme: this.checkColorScheme,
					onSetDateLocale: this.setDateLocale,
				};
				return (
					<ErrorBoundary className="errorBoundaryComponent">
						<Settings handlers={handlers} userData={this.state.userData} />
					</ErrorBoundary>
				);
			},
		},
		{
			id: 'notifications',
			title: localization.ACCOUNT.tabTitleNotifications,
			icon: 'bell',
			content: () => {
				const handlers = {
					updateUserEmails: this.updateUserEmails,
				};
				return (
					<ErrorBoundary className="errorBoundaryComponent">
						<Notifications
							userData={this.state.userData}
							handlers={handlers}
							errors={this.state.errors}
							user={this.props.user}
							userActions={this.props.userActions}
						/>
					</ErrorBoundary>
				);
			},
		},
		{
			id: 'security',
			title: localization.ACCOUNT.tabTitleSecurity,
			icon: 'websitePass',
			content: () => {
				return (
					<ErrorBoundary className="errorBoundaryComponent">
						<Security user={this.props.user} userActions={this.props.userActions} />
					</ErrorBoundary>
				);
			},
		},
		{
			id: 'legal',
			title: localization.ACCOUNT.tabTitleLegal,
			icon: 'legal',
			content: () => {
				return (
					<ErrorBoundary className="errorBoundaryComponent">
						<Legal user={this.props.user} userActions={this.props.userActions} />
					</ErrorBoundary>
				);
			},
		},
	];

	static getDerivedStateFromProps(nextProps, prevState) {
		if (nextProps.userData !== prevState.userData) {
			const { user } = nextProps;
			const {
				email,
				notificationsEmail,
				displayName,
				avatar,
				phone,
				blogUrl,
				facebookUrl,
				twitterUrl,
				about,
				contacts,
				position,
				settings,
				slackUserId,
			} = user;
			const { previewThumbnailSize, disableParallelUpload, picsioTheme } = settings || {};
			return {
				userData: {
					email,
					notificationsEmail,
					displayName,
					avatar,
					phone,
					blogUrl: blogUrl || PLACEHOLDERS.websiteUrl,
					facebookUrl: facebookUrl || PLACEHOLDERS.fb,
					twitterUrl: twitterUrl || PLACEHOLDERS.twitter,
					about,
					contacts,
					position,
					settings: {
						previewThumbnailSize: previewThumbnailSize || 'default',
						disableParallelUpload: !!disableParallelUpload,
						picsioTheme: picsioTheme || 'dark',
						dateLocale: getUserDateLocale(),
					},
					slackUserId,
				},
			};
		}
		return null;
	}

	defaultChange = (key, value) => {
		this.props.userActions.updateUser({ [key]: value });
	};

	async defaultSave(key, value) {
		Logger.log('User', 'SettingsMyAccountChange');
		this.props.userActions.updateUser({ [key]: value }, false);
	}

	async defaultSaveSettings(settings) {
		this.props.userActions.updateUser({ settings }, false);
		const patchBody = { settings };
		this.setState({ userData: { ...this.state.userData, ...patchBody } });
	}

	/** ******************* */
	/** **** SETTINGS ***** */
	/** ******************* */

	setPreviewSize = val => {
		Logger.log('User', 'SettingsMyAccountChangePreviewSize', val);
		const settings = { ...this.state.userData.settings, previewThumbnailSize: val};
		this.defaultSaveSettings(settings);
	};

	checkParallelUpload = val => {
		Logger.log('User', 'SettingsMyAccountChangeParallelUpload', val);
		const settings = { ...this.state.userData.settings, disableParallelUpload: val};
		this.defaultSaveSettings(settings);
	};

	checkColorScheme = (e, val) => {
		const theme = this.state.userData.settings.picsioTheme === 'dark' ? 'light' : 'dark';
		Logger.log('User', 'SettingsMyAccountChangeTheme', theme);

		if (val) {
			const settings = { ...this.state.userData.settings, picsioTheme: theme};
			this.defaultSaveSettings(settings);
		}
	};

	setDateLocale = (e, val) => {
		const dateLocale = this.state.userData.settings.dateLocale === 'en-gb' ? 'en-us' : 'en-gb';
		Logger.log('User', 'SettingsMyAccountChangeLocale', dateLocale);

		if (val) {
			const settings = { ...this.state.userData.settings, dateLocale };
			this.defaultSaveSettings(settings);
			setUserDateLocale(dateLocale);
		}
	};

	/** ************************ */
	/** **** NOTIFICATIONS ***** */
	/** ************************ */
	/**
	 * update user emails
	 * @param {string[]} emails
	 */
	updateUserEmails = emails => {
		this.defaultSave('notificationsEmail', emails);
	};

	destroy = () => {
		Logger.log('User', 'SettingsMyAccountHide');
		back('/search');
	};

	render() {
		const { props, state } = this;

		const currentTabConfig = this.configTabs.find(n => n.id === props.actTab);
		const activeTabTitle = !this.isMobile
			? [localization.ACCOUNT.title, currentTabConfig.title]
			: [localization.ACCOUNT.title];

		return (
			<div className="page pageMyAccount">
				<ToolbarScreenTop title={activeTabTitle} onClose={this.destroy} helpLink={`myAccount_${currentTabConfig.id}`} />
				<div className="pageContent pageVertical">
					<aside className="pageSidebar">
						<ScreenTab name="MyAccount" configTabs={this.configTabs} rootPath="/users/me" actTab={props.actTab} />
					</aside>
					<div className="pageInnerContent">{state.loading ? 'Loading' : currentTabConfig.content()}</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	actTab: state.router.location.query.tab || 'account',
	user: state.user,
});
const mapDispatchToProps = dispatch => ({
	userActions: bindActionCreators(userActions, dispatch),
});
const ConnectedAccountView = connect(mapStateToProps, mapDispatchToProps)(AccountView);

export default props => (
	<Provider store={store}>
		<ConnectedAccountView {...props} />
	</Provider>
);
