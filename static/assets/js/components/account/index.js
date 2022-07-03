import React from 'react';
import ErrorBoundary from '../ErrorBoundary';

import Logger from '../../services/Logger';
import View from './view';

export default function () {
  Logger.log('User', 'SettingsMyAccountShow');

  return (
    <div className="pageWrapper wrapperPageMyAccount">
      <ErrorBoundary className="errorBoundaryPage">
        <View />
      </ErrorBoundary>
    </div>
  );
}
