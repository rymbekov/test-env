import * as utils from '../shared/utils';
import Logger from '../services/Logger';
import { fetchThumbnails } from '../api/assets';
/**
 * Get thumbnail urls from the server
 * @prams {string[]} assetIds
 */
export default async function getThumbnailUrls(assetIds) {
  try {
    if (!assetIds.length) {
      throw new Error('assetIds cannot be empty');
    }
    const response = await fetchThumbnails(assetIds);
    return response.map((thumbnail) => {
      /** Legacy code */
      if (thumbnail.trashed) {
        return {
          ...thumbnail,
          error: { code: 456, msg: 'File is trashed' },
        };
      }
      return thumbnail;
    });
  } catch (err) {
    const errorMessage = utils.getDataFromResponceError(err, 'msg') || 'no reason';
    Logger.info(`Error get thumbnails for assets : ${JSON.stringify(assetIds)}`);
    throw new Error(`Can not get thumbnail urls, ${errorMessage}`);
  }
}
