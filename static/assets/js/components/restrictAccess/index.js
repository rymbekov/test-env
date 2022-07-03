import React from 'react';
import ErrorBoundary from '../ErrorBoundary';

import RestrictAccess from './view';

export default function () {
  return (
    <div className="pageWrapper wrapperPageMyAccount">
      <ErrorBoundary className="errorBoundaryPage">
        <RestrictAccess />
      </ErrorBoundary>
    </div>
  );
}
