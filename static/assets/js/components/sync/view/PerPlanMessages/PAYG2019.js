import React from 'react'; // eslint-disable-line
import pluralize from "pluralize";

export function autosyncMessage({ subscriptionFeatures, onClick, storageName, minutesBeforeNextSync }) {
	const freePlan = !subscriptionFeatures.websitesLimit && !subscriptionFeatures.teammatesLimit;

	if (freePlan) {
		return (
			<p>
				With your current <b>{subscriptionFeatures.planName}</b> plan, you can sync your {storageName} storage with
				Pics.io every 60 minutes.{' '}
				{
					!subscriptionFeatures.scheduledSyncCron && <p>
						<span className="picsioLink" onClick={onClick}>
							Upgrade your billing plan
						</span>{' '}
						and get automatic syncronization.
						</p>
				}
				<br />
				<br />
				{minutesBeforeNextSync
					? `Next sync will be available in ${pluralize("minute", Math.ceil(minutesBeforeNextSync), true)}.`
					: "Next sync will be available soon."}
			</p>
		);
	} else {
		return (
			<p>
				With your current <b>{subscriptionFeatures.planName}</b> plan, you can sync your {storageName} storage with
				Pics.io every 15 minutes.{' '}
				{
					!subscriptionFeatures.scheduledSyncCron && <p>
						<span className="picsioLink" onClick={onClick}>
							Upgrade your billing plan
						</span>{' '}
						and get automatic syncronization.
						</p>
				}
				<br />
				<br />
				{minutesBeforeNextSync
					? `Next sync will be available in ${pluralize("minute", Math.ceil(minutesBeforeNextSync), true)}.`
					: "Next sync will be available soon."}
			</p>
		);
	}
}
