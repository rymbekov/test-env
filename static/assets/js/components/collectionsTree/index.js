import React from 'react';
import ErrorBoundary from '../ErrorBoundary';

import Tree from './views/index';

export default function collectionsTree() {
  return (
    <div className="_wrapperTree tree">
      <ErrorBoundary className="errorBoundaryComponent">
        <Tree />
      </ErrorBoundary>
    </div>
  );
}
