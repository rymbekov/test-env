import React from 'react';
import { object } from 'prop-types';
import { distanceInWordsToNow } from 'date-fns';
import { Provider, connect } from 'react-redux';
import { loadAuth2 } from 'gapi-script';
import { Button } from '../../../UIComponents';
import { getWorkingFolderId } from '../../../store/helpers/user';

import * as utils from '../../../shared/utils';
import localization from '../../../shared/strings';
import Logger from '../../../services/Logger';
import Icon from '../../Icon';
import picsioConfig from '../../../../../../config';
import * as Api from '../../../api/syncs';
import Spinner from './Spinner'; // eslint-disable-line
import PerPlanMessages from './PerPlanMessages'; // eslint-disable-line

import ErrorBoundary from '../../ErrorBoundary';
import store from '../../../store';

import * as dialogs from '../dialogs/index';
import { navigate, navigateToRoot } from '../../../helpers/history';
import { showDialog } from '../../dialog';

export const getUserStorageName = (user) => {
	const { storageType, picsioStorage } = user;

	if (picsioStorage) {
		return ''
	}
	if (storageType === 's3') {
		return 'Amazon S3';
	}
	return 'Google Drive';
};
class SyncScreen extends React.Component {
	static propTypes = { user: object };

	state = { isLoading: true };

	isNotS3User = this.props.user && this.props.user.team.storageType !== 's3';

	componentDidMount() {
		if (!this.props.user.isSyncAllowed) {
			return navigateToRoot();
		}

		this.fetchSyncSettings();
		if (this.isNotS3User) {
			this.getTokenScopes();
		}
	}

	async fetchSyncSettings() {
		this.showSpinner();

		try {
			const response = await Api.fetchSyncSettings();
			this.setState({
				...response,
				isLoading: false,
			});
		} catch (error) {
			this.handleErrors(error);
		}
	}

	async getTokenScopes() {
		this.showSpinner();

		try {
			const response = await Api.getTokenScopes();
			this.setState({
				scopes: response,
				isLoading: false,
			});
		} catch (error) {
			this.hideSpinner();
			Logger.error(new Error('Can not get token scopes for Sync'), { error, showDialog: true }, [
				'syncGetTokenScopesFailed',
				(error && error.message) || 'NoMessage',
			]);
		}
	}

	async runSync(allowDestructive) {
		Logger.log('Sync', 'SettingsSyncFromGD');

		if (this.isNotS3User) {
			const workingFolderId = getWorkingFolderId();
			const respose = await Api.isFolderEmpty(workingFolderId);
			const empty = respose.isFolderEmpty;
			if (empty) {
				dialogs.showEmptyWorkingFolder();
			}
		}

		this.showSpinner(localization.SYNC.textSyncingData);

		try {
			await Api.runSync(allowDestructive);
			this.hideSpinner();
			this.fetchSyncSettings();
			dialogs.showSyncSuccess();
		} catch (error) {
			this.handleErrors(error);
		}
	}

	showSpinner(spinnerTitle) {
		this.setState({ isLoading: true, spinnerTitle });
	}

	hideSpinner() {
		this.setState({ isLoading: false });
	}

	handleErrors(error) {
		this.hideSpinner();
		if (error instanceof Api.errors.SlowSync) {
			dialogs.showSlowSync();
		} else if (error instanceof Api.errors.DestructiveSync) {
			dialogs.showDestructiveSyncWarning(() => this.runSync(true));
		} else if (error instanceof Api.errors.DestructiveWebsitesSync) {
			dialogs.showDestructiveSyncWebsitesWarning(error.websites);
		} else if (error instanceof Api.errors.SyncLimitExceeded) {
			dialogs.showSyncLimitExceededDialog(+error.minutesBeforeNextSync);
		} else if (error instanceof Api.errors.SyncAlreadyRunning) {
			dialogs.showAlreadyRunning(error.progress);
		} else if (error instanceof Api.errors.SyncApiError) {
			dialogs.showFailed();
		} else {
			throw error;
		}
	}

	goToUrl = () => {
		navigate('/billing?tab=overview');
		Logger.log('User', 'SettingsSyncHide');
	};

	getActivityScope = async () => {
		const driveActivityScope = 'https://www.googleapis.com/auth/drive.activity.readonly';

		const auth2 = await loadAuth2(
			picsioConfig.google.mainApp,
			'https://www.googleapis.com/auth/drive'
		);
		const user = auth2.currentUser.get();

		if (this.state.scopes && this.state.scopes.includes(driveActivityScope)) {
			return;
		}

		try {
			const res = await user.grantOfflineAccess({
				scope: driveActivityScope,
			});

			try {
				await Api.appendNewScopes(res.code);
				this.setState({ requiresActivityAPIPermissions: false });
			} catch (error) {
				const errorMessage =
					error && (utils.getDataFromResponceError(error, 'msg') || error.message);
				const errorSubcode = utils.getDataFromResponceError(error, 'subcode');
				if (errorSubcode === 'WrongGoogleAccountError') {
					Logger.error(new Error('Wrong user account selected'), { error }, [
						'syncAppendNewScopesFailed',
						errorMessage || 'NoMessage',
					]);

					return showDialog({
						title: localization.SYNC.errorWrongAccount,
						text: errorMessage,
						textBtnCancel: null,
					});
				}

				Logger.error(new Error('Can not append new scopes for Sync'), { error }, [
					'syncAppendNewScopesFailed',
					errorMessage || 'NoMessage',
				]);
			}
		} catch (error) {
			Logger.error(new Error('Can not grant offline access for Sync'), { error }, [
				'syncGrantOfflineAccessFailed',
				(error && error.message) || 'NoMessage',
			]);
		}
	};

	render() {
		const {
			isLoading,
			spinnerTitle,
			syncedAt,
			scheduledSyncCronPattern,
			enableScheduledSync,
			enableScheduledActivityAPISync,
			requiresActivityAPIPermissions,
			autosyncInterval,
			minutesBeforeNextSync,
		} = this.state;
		const { user } = this.props;
		const { subscriptionFeatures } = user;
		const { scheduledSyncCron } = subscriptionFeatures;
		let { planId } = subscriptionFeatures;
		let planName;
		if (!planId && subscriptionFeatures.planName) {
			planId =
				subscriptionFeatures.planName.toLowerCase() === 'free'
					? 'Free'
					: subscriptionFeatures.planName.toLowerCase() === 'pay as you go'
					? 'PAYG2019'
					: 'Plans2019';
			planName = subscriptionFeatures.planName;
		}
		const AutosyncMessage = PerPlanMessages[planId].autosyncMessage;
		const TryAutoSyncMessage = PerPlanMessages[planId].tryAutoSyncMessage;
		const autosyncIntervalInMinutes = autosyncInterval ? autosyncInterval / 60 : null;
		const storageName = getUserStorageName(user.team);
		const isSyncDisabled = Boolean(minutesBeforeNextSync);

		return (
			<div className="pageContent">
				{isLoading && <Spinner title={`${spinnerTitle || localization.SYNC.textLoading}`} />}
				<ErrorBoundary>
					<div className="pageInnerContent">
						{syncedAt && (
							<div className="syncTitle">
								The latest sync happened {distanceInWordsToNow(new Date(syncedAt))} ago
							</div>
						)}
						<p>
							<Button
								id="button-runSync"
								className="picsioDefBtn"
								icon="sync"
								onClick={() => this.runSync()}
								type="submit"
								disabled={isSyncDisabled}
							>
								Sync Now
							</Button>
						</p>
						{!syncedAt && (
							<p>Want to synchronize your {storageName} storage with Pics.io? Press Sync now.</p>
						)}
						{!enableScheduledSync && syncedAt && TryAutoSyncMessage && <TryAutoSyncMessage />}

						{this.isNotS3User &&
							(enableScheduledSync || enableScheduledActivityAPISync) &&
							AutosyncMessage && (
								<AutosyncMessage
									scheduledSyncCronPattern={scheduledSyncCronPattern || scheduledSyncCron}
									autosyncIntervalInMinutes={autosyncIntervalInMinutes}
									subscriptionFeatures={subscriptionFeatures}
									planName={planName}
									storageName={storageName}
									onClick={this.goToUrl}
									minutesBeforeNextSync={minutesBeforeNextSync}
								/>
							)}

						{requiresActivityAPIPermissions && this.isNotS3User && (
							<>
								<div className="warning warningLarge">
									<div className="warningIcon">
										<Icon name="warning" />
									</div>
									<div className="warningText">
										We have recently improved our Sync operations. If you want to get better
										experience with Autosync please provide additional permissions to access your
										Google Drive data.
									</div>
								</div>
								<span className="picsioDefBtn syncButton" onClick={this.getActivityScope}>
									Give access
								</span>
							</>
						)}
					</div>
				</ErrorBoundary>
			</div>
		);
	}
}

const mapStateToProps = (store) => ({
	user: store.user,
	storageType: store.user.team.storageType,
});
const ConnectedSyncScreen = connect(mapStateToProps)(SyncScreen);

export default (props) => (
	<Provider store={store}>
		<ConnectedSyncScreen {...props} />
	</Provider>
);
