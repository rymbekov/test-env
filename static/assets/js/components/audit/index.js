import React from 'react';
import ErrorBoundary from '../ErrorBoundary';
import Logger from '../../services/Logger';
import View from './view';
import sendEventToIntercom from '../../services/IntercomEventService';

export default () => {
  Logger.log('User', 'SettingsAuditTrailShow');
  sendEventToIntercom('audit trail');

  return (
    <div className="pageWrapper wrapperPageAudit">
      <ErrorBoundary className="errorBoundaryPage">
        <View />
      </ErrorBoundary>
    </div>
  );
};
