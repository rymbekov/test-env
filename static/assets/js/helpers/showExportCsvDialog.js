import React from 'react';
import ReactDOM from 'react-dom';
import ExportCsvDialog from '../components/ExportCsvDialog';

/** Show Export to CSV dialog */
export default function showExportCsvDialog(props) {
  const $wrapper = document.createElement('div');
  $wrapper.classList.add('wrapperDialog');
  $wrapper.classList.add('exportDialogWrapper');
  document.body.appendChild($wrapper);

  function destroy() {
    ReactDOM.unmountComponentAtNode($wrapper);
    document.body.removeChild($wrapper);
  }
  ReactDOM.render(<ExportCsvDialog destroy={destroy} {...props} />, $wrapper);
}
