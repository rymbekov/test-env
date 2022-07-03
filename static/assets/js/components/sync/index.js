import React from 'react';
import ErrorBoundary from '../ErrorBoundary';
import Logger from '../../services/Logger';

import localization from '../../shared/strings';
import ToolbarScreenTop from '../toolbars/ToolbarScreenTop';
import SyncScreen from './view/index';
import { back } from '../../helpers/history';

export default function () {
  Logger.log('User', 'SettingsSyncShow');

  const destroy = () => {
    Logger.log('User', 'SettingsSyncHide');
    back();
  };

  return (
    <div className="pageWrapper wrapperPageSync">
      <ErrorBoundary className="errorBoundaryPage">
        <div className="page pageSync">
          <ToolbarScreenTop title={[localization.SYNC.screenTitle]} onClose={destroy} helpLink="sync" />
          <ErrorBoundary className="errorBoundaryPage">
            <SyncScreen />
          </ErrorBoundary>
        </div>
      </ErrorBoundary>
    </div>
  );
}
