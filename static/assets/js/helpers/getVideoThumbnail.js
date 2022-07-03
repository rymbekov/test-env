import { bindActionCreators } from 'redux';
import Logger from '../services/Logger';
import { fetchVideoThumbnail } from '../api/assets';
/** Store */
import store from '../store';
import { updateFields } from '../store/actions/assets';

const assetsActions = bindActionCreators({ updateFields }, store.dispatch);

export default async function getVideoThumbnail(assetId) {
  try {
    let url = await fetchVideoThumbnail(assetId);

    // it's need for GD Proofing
    if (url && url.endsWith('s220')) {
      url = url.replace('s220', 's320');
    }
    assetsActions.updateFields(assetId, ['videoThumbnail'], [url]);
    return url;
  } catch (err) {
    Logger.error(new Error('Error get video thumbnail'), { error: err, assetId });
    return null;
  }
}
