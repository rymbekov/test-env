import events from '@picsio/events';

export default function (userId, event, integrations = [], transportType) {
  if (!event) return false;

  const collectionEventTypes = events.getCollectionTypes();

  if (collectionEventTypes.includes(event.type)) {
    // List of users that decided to disable {transportType} transport (collection transports)
    const transportTypeDisabledFor = event[`${transportType}DisabledFor`] || [];
    if (transportTypeDisabledFor.includes(userId)) return true;
  } else {
    // Settings for global transport
    const transportSettings = integrations.find((item) => item.type === transportType);

    // Check global transports
    if (transportSettings && !transportSettings.active) return true;

    if (transportSettings
      && transportSettings.active
      && transportSettings.eventTypes
      && transportSettings.eventTypes.length
      && !transportSettings.eventTypes.includes(event.type)
    ) {
      return true;
    }
  }

  return false;
}
