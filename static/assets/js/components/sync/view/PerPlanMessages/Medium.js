import React from 'react'; // eslint-disable-line
import cronstrue from 'cronstrue';

export function autosyncMessage({ scheduledSyncCronPattern, autosyncIntervalInMinutes, storageName }) {
	return (
		<p>
			With your current <b>Medium</b> billing plan, {storageName} storage syncs with Pics.io automatically{' '}
			{autosyncIntervalInMinutes
				? `every ${autosyncIntervalInMinutes} minutes`
				: cronstrue.toString(scheduledSyncCronPattern).toLowerCase()}
			.<br />
			<br />
			If you need to refresh your storage right now, just press <b>Sync Now</b> to do it manually.
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
