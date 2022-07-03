import React from 'react'; // eslint-disable-line
import cronstrue from 'cronstrue';

export function autosyncMessage({ subscriptionFeatures, scheduledSyncCronPattern, autosyncIntervalInMinutes, onClick, storageName }) {
	return (
		<p>
			With your current <b>Micro</b> billing plan, {storageName} storage syncs with Pics.io automatically{' '}
			{autosyncIntervalInMinutes
				? `every ${autosyncIntervalInMinutes} minutes`
				: cronstrue.toString(scheduledSyncCronPattern).toLowerCase()}
			.<br />
			<br />
			Now, you can press Sync Now to refresh your storage manually.{' '}
			{
					!subscriptionFeatures.scheduledSyncCron && <p>
						<span className="picsioLink" onClick={onClick}>
							Upgrade your billing plan
						</span>{" "}
						to Small and auto-sync your storage faster.
						</p>
				}
		</p>
	);
}

export function tryAutoSyncMessage() {
	return (
		<p>
			Tired of manual sync?
			<br />
			<br />
			Try our new option - Auto-sync (BETA). Drop us a line at{' '}
			<a href="mailto:support@pics.io" className="picsioLink">
				support@pics.io
			</a>{' '}
			and we'll make it active for you.
		</p>
	);
}
