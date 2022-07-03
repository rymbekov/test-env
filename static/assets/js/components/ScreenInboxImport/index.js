import React from 'react';
import ErrorBoundary from '../ErrorBoundary';
import ImportInbox from '../importInbox';

export default function ScreenInboxImport() {
  return (
    <ErrorBoundary>
      <ImportInbox />
    </ErrorBoundary>
  );
}
