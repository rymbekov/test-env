import React from 'react';
import ErrorBoundary from '../ErrorBoundary';

import DeleteAccount from './view';

export default function () {
  return (
    <div className="pageWrapper wrapperPageMyAccount">
      <ErrorBoundary className="errorBoundaryPage">
        <DeleteAccount />
      </ErrorBoundary>
    </div>
  );
}
