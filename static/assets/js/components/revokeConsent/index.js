import React from 'react';
import ErrorBoundary from '../ErrorBoundary';

import RevokeConsent from './view';

export default function () {
  return (
    <div className="pageWrapper wrapperPageMyAccount">
      <ErrorBoundary className="errorBoundaryPage">
        <RevokeConsent />
      </ErrorBoundary>
    </div>
  );
}
