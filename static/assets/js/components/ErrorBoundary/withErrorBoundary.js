import React from 'react';

import ErrorBoundary from './ErrorBoundary';

export default (WrappedComponent, { className }) => (props) => (
  <ErrorBoundary className={className}>
    <WrappedComponent {...props} />
  </ErrorBoundary>
);
