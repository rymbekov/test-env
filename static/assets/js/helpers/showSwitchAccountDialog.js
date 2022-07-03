import React from 'react';
import ReactDOM from 'react-dom';
import SwitchAccountDialog from '../components/SwitchAccountDialog';

/** Show switch account dialog */
export default function showSwitchAccountDialog(props) {
  const $wrapper = document.createElement('div');
  $wrapper.classList.add('wrapperDialog');
  document.body.appendChild($wrapper);

  function destroy() {
    ReactDOM.unmountComponentAtNode($wrapper);
    document.body.removeChild($wrapper);
  }
  ReactDOM.render(<SwitchAccountDialog destroy={destroy} {...props} />, $wrapper);
}
