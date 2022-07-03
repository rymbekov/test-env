import React from 'react';
import ErrorBoundary from '../ErrorBoundary';
import Logger from '../../services/Logger';

import Storage from './Storage';
import sendEventToIntercom from '../../services/IntercomEventService';

export default function () {
  Logger.log('User', 'SettingsGoogleDriveShow', 'SettingsStorageShow');
  sendEventToIntercom('storage settings');

  return (
    <div className="pageWrapper wrapperPageStorage">
      <ErrorBoundary className="errorBoundaryPage">
        <Storage />
      </ErrorBoundary>
    </div>
  );
}
