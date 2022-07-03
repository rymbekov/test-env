import React from 'react'; // eslint-disable-line
import ReactDOM from 'react-dom';
import ErrorBoundary from '../ErrorBoundary';

import DialogRadios from './views/index'; // eslint-disable-line

export default function (params) {
  const parentEl = params.parentEl || document.querySelector('.wrapperRadiosDialog');
  const {
    title, onOk, okName, cancelName, onCancel, onClose, checkbox, items, helpLink, description, text,
  } = params;
  const close = () => {
    parentEl && ReactDOM.unmountComponentAtNode(parentEl);
    onClose && onClose();
  };
  const cancel = () => {
    onCancel && onCancel();
    close();
  };
  const ok = (value, checkbox) => {
    onOk && onOk(value, checkbox);
    close();
  };

  ReactDOM.render(
    <ErrorBoundary>
      <DialogRadios
        title={title}
        onClose={close}
        onCancel={cancel}
        onOk={ok}
        textBtnOk={okName}
        textBtnCancel={cancelName}
        items={items}
        checkbox={checkbox}
        helpLink={helpLink}
        description={description}
        text={text}
      />
    </ErrorBoundary>,
    parentEl,
  );

  const API = {};

  return API;
}
