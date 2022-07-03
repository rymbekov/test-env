import React from 'react'; // eslint-disable-line
import cronstrue from 'cronstrue';

export function autosyncMessage({
	scheduledSyncCronPattern,
	autosyncIntervalInMinutes,
	planName,
	onClick,
	storageName,
	subscriptionFeatures
}) {
	return (
		<p>
			With your current <b>{planName}</b> billing plan, {storageName} storage syncs with Pics.io automatically{' '}
			{autosyncIntervalInMinutes
				? `every ${autosyncIntervalInMinutes} minutes`
				: cronstrue.toString(scheduledSyncCronPattern).toLowerCase()}
			.<br />
			<br />
			Now, you can press Sync Now to refresh your storage manually. {' '}
			{
				!subscriptionFeatures.scheduledSyncCron && <p>
					<span className="picsioLink" onClick={onClick}>
						Upgrade your billing plan
					</span>{' '}
					and get automatic syncronization.
				</p>
			}
		</p>
	);
}
