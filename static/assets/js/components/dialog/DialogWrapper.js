import React from 'react';
import ReactDOM from 'react-dom';
import ErrorBoundary from '../ErrorBoundary';
import Dialog from './views/index';

export default function DialogWrapper({ data, parentEl }) {
  ReactDOM.render(
    <ErrorBoundary className="errorBoundaryOverlay">
      <Dialog data={data || {}} parentEl={parentEl} />
    </ErrorBoundary>,
    parentEl,
  );

  return {};
}
