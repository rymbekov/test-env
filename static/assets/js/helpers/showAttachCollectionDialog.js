import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from '../store';
import AttachCollectionDialog from '../components/AttachCollectionDialog';

export default function showAttachCollectionDialog(props) {
  const $wrapper = document.createElement('div');
  $wrapper.classList.add('wrapperDialog');
  $wrapper.classList.add('wrapperMoveDialog');
  document.body.appendChild($wrapper);

  function destroy() {
    ReactDOM.unmountComponentAtNode($wrapper);
    document.body.removeChild($wrapper);
  }

  ReactDOM.render(
    <Provider store={store}>
      <AttachCollectionDialog destroy={destroy} {...props} />
    </Provider>, $wrapper,
  );
}
