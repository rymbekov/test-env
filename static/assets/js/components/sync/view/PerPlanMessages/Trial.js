import React from 'react'; // eslint-disable-line
import cronstrue from 'cronstrue';

export function autosyncMessage({ scheduledSyncCronPattern, autosyncIntervalInMinutes, storageName }) {
	return (
		<p>
			<b>Trial</b> period with Pics.io comes with a benefit - auto-sync.
			<br />
			Your {storageName} storage syncs with Pics.io automatically{' '}
			{autosyncIntervalInMinutes
				? `every ${autosyncIntervalInMinutes} minutes`
				: cronstrue.toString(scheduledSyncCronPattern).toLowerCase()}
			.<br />
			<br />
			If you need to refresh your storage right now, just press <b>Sync Now</b> to do it manually.
		</p>
	);
}
