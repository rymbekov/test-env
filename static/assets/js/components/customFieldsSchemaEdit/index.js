import React from 'react';
import ErrorBoundary from '../ErrorBoundary';
import Logger from '../../services/Logger';

import View from './view/index';

export default function () {
  Logger.log('User', 'SettingsCustomFieldsShow');

  return (
    <div className="pageWrapper wrapperPageCustomFieldsEdit">
      <ErrorBoundary className="errorBoundaryPage">
        <View />
      </ErrorBoundary>
    </div>
  );
}
