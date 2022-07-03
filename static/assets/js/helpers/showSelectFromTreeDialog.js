import React from 'react';
import ReactDOM from 'react-dom';
import SelectFromTreeDialog from '../components/SelectFromTreeDialog';

export default function showSelectFromTreeDialog(props) {
  const $wrapper = document.createElement('div');
  $wrapper.classList.add('wrapperDialog');
  $wrapper.classList.add('wrapperMoveDialog');
  document.body.appendChild($wrapper);

  function destroy() {
    ReactDOM.unmountComponentAtNode($wrapper);
    document.body.removeChild($wrapper);
  }

  ReactDOM.render(<SelectFromTreeDialog destroy={destroy} {...props} />, $wrapper);
}
