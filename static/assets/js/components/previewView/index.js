import React from 'react';
import ErrorBoundary from '../ErrorBoundary';

import ScreenPreview from './views/index';

export default function ({ match }) {
  return (
    <div className="wrapperScreenPreview">
      <ErrorBoundary className="errorBoundaryOverlay">
        <ScreenPreview id={match.params.id} />
      </ErrorBoundary>
    </div>
  );
}
