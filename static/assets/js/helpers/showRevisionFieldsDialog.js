import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from '../store';
import RevisionFieldsDialog from '../components/RevisionFieldsDialog';

/** Show Revision required fields dialog */
export default function showRevisionFieldsDialog(props) {
  const $wrapper = document.createElement('div');
  $wrapper.classList.add('wrapperDialog');
  $wrapper.classList.add('exportDialogWrapper');
  const $container = document.querySelector('#dialogRoot') || document.body;
  $container.appendChild($wrapper);

  function destroy() {
    ReactDOM.unmountComponentAtNode($wrapper);
    $container.removeChild($wrapper);
  }
  ReactDOM.render(
    <Provider store={store}>
      <RevisionFieldsDialog destroy={destroy} {...props} />
    </Provider>,
    $wrapper,
  );
}
