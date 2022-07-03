import React from 'react';
import ErrorBoundary from '../ErrorBoundary';
import Logger from '../../services/Logger';

import View from './view/index';
import sendEventToIntercom from '../../services/IntercomEventService';

export default function () {
  Logger.log('User', 'SettingsCustomFieldsShow');
  sendEventToIntercom('custom fields settings');

  return (
    <div className="pageWrapper wrapperPageCustomFields">
      <ErrorBoundary className="errorBoundaryPage">
        <View />
      </ErrorBoundary>
    </div>
  );
}
