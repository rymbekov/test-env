import ReactDOM from 'react-dom';
import Dialog from './DialogWrapper';

export { default } from './DialogWrapper';

/** Show dialog
 * @param {Object} data - data for Dialog
 */
export function showDialog(data) {
  const $wrapper = document.querySelector('.wrapperDialog');
  Dialog({
    parentEl: $wrapper,
    data,
  });
  const close = () => {
    if ($wrapper) ReactDOM.unmountComponentAtNode($wrapper);
  };

  return close;
}

/** Show error dialog
 * @param {string} text
 * @param {string?} title
 * @returns {undefined}
 */
export function showErrorDialog(text, title = 'Error') {
  showDialog({ title, text, textBtnCancel: null });
}

/** Show alert dialog
 * @param {string} text
 * @param {string?} title
 * @returns {undefined}
 */
export function showInfoDialog(text, title = 'Info') {
  showDialog({ title, text, textBtnCancel: null });
}
