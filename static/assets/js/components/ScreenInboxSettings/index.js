import React from 'react';
import ErrorBoundary from '../ErrorBoundary';
import View from './view';

export default function ({ match }) {
  return (
    <div className="pageWrapper wrapperPageInboxSettings">
      <ErrorBoundary className="errorBoundaryPage">
        <View inboxId={match.params.id} />
      </ErrorBoundary>
    </div>
  );
}