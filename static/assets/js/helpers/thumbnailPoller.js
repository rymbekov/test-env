import { bindActionCreators } from 'redux';
import localization from '../shared/strings';
import Logger from '../services/Logger';
import getThumbnailUrls from './getThumbnailUrls';
import store from '../store';
import { setThumbnails } from '../store/actions/assets';
import { showDialog } from '../components/dialog';

const setThumbnailsAction = bindActionCreators({ setThumbnails }, store.dispatch).setThumbnails;

/**
 * @param {string} id - assetId
 * @returns {Object}
 */
export default function pollGDThumbnail(id) {
  let numberOfAttempts = 0;
  let forceStopped = false;
  let tokenRefreshed = false;
  const attempt = async () => {
    if (forceStopped) return;
    try {
      const [thumbnail] = await getThumbnailUrls([id]);
      if (thumbnail.thumbnailLink) {
        setThumbnailsAction([thumbnail]);
      } else {
        throw new Error('ThumbnailLink not generated yet');
      }
    } catch (error) {
      /** if token expired */
      if (error.code === 401 && !tokenRefreshed) {
        try {
          tokenRefreshed = true;
          attempt();
        } catch (err) {
          // eslint-disable-next-line no-shadow
          let error;
          /** if google response */
          if (err.error && err.error.code) {
            const { code, errors, message } = err.error;
            const { reason } = errors[0];
            error = { code, reason, message };
          } else {
            /** else */
            error = { code: 401, reason: 'cantRefreshToken', message: "Can't refresh token" };
          }

          const title = localization.DIALOGS.SOMETHING_WENT_WRONG.TITLE;
          const body = `code: ${error.code}<br/>reason: ${error.reason}<br/>message: ${error.message}`;
          const text = localization.DIALOGS.SOMETHING_WENT_WRONG.TEXT({
            subject: encodeURIComponent(title),
            body: encodeURIComponent(`\n${body.replace(/<br\/>/g, '\n')}`),
            code: body,
          });
          showDialog({
            title,
            text,
            icon: 'warning',
            className: 'errorDialog',
            textBtnCancel: localization.DIALOGS.SOMETHING_WENT_WRONG.CANCEL_TEXT,
            textBtnOk: localization.DIALOGS.SOMETHING_WENT_WRONG.OK_TEXT,
            onOk: () => window.location.reload(),
          });
          Logger.error(
            new Error('Error polling GD thumbnail'),
            {
              error: err,
              text,
              thumbnailError: error,
            },
            ['PollingThumbnailFromGDFailed', (err && err.message) || 'NoMessage']
          );
          setThumbnailsAction([{ _id: id, error }]);
        }
      } else if (error.code === 456 || error.code === 404) {
        /** if trashed/removed in GD */
        setThumbnailsAction([{ _id: id, error }]);
      } else if (numberOfAttempts < 300) {
        numberOfAttempts += 1;
        setTimeout(attempt, 10000);
      } else {
        setThumbnailsAction([{ _id: id, error }]);
      }
    }
  };
  attempt();
  const stop = () => {
    forceStopped = true;
  };

  return { stop };
}
