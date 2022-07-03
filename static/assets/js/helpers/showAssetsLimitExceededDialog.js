import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from '../store';
import AssetsLimitExceededDialog from '../components/AssetsLimitExceededDialog';

/** Show assets limit exceeded dialog */
export default function showAssetsLimitExceededDialog(props) {
  const $wrapper = document.createElement('div');
  $wrapper.classList.add('wrapperDialog');
  const $container = document.querySelector('#dialogRoot') || document.body;
  $container.appendChild($wrapper);

  function destroy() {
    ReactDOM.unmountComponentAtNode($wrapper);
    $container.removeChild($wrapper);
  }
  ReactDOM.render(
    <Provider store={store}>
      <AssetsLimitExceededDialog destroy={destroy} {...props} />
    </Provider>,
    $wrapper,
  );
}
