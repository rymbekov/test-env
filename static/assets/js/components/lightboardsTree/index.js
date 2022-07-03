import React from 'react';
import ErrorBoundary from '../ErrorBoundary';
import Tree from './views/index';

export default function () {
  return (
    <div className="wrapperTree tree">
      <ErrorBoundary className="errorBoundaryComponent">
        <Tree />
      </ErrorBoundary>
    </div>
  );
}
