import sdk from '../sdk';
import picsioConfig from '../../../../config';
import ua from '../ua';
import * as utils from '../shared/utils';
import {
  navigate,
} from './history';
import { showDialog } from '../components/dialog';
import localization from '../shared/strings';

/**
 * Get download url
 * @param {Object} params
 * @param {string} params.assetId
 * @param {string?} params.revisionId
 * @param {boolean?} params.allowDownloadByGS - allow download by google storage
 * @param {boolean?} params.useProxy - now we need it for mobile downloading ( > 40MB assets)
 * @param {number?} params.resolution - download proxy version of video
 * @returns {Promise}
 */
export default async function getDownloadUrl({
  assetId,
  revisionId,
  allowDownloadByGS = true,
  useProxy,
  resolution,
}) {
  if (picsioConfig.isMainApp()) {
    /** Main app */

    const params = {
      assetId, revisionId, allowDownloadByGS, resolution,
    };
    if (window.useProxy || (ua.isMobileApp() && useProxy)) params.useProxy = true;
    const { data } = await sdk.assets.buildDownloadLink(params);
    return data;
  }
  /** Website */
  const { alias } = window.websiteConfig;
  const { data } = await sdk.assets.buildPublicDownloadLink(
    {
      assetId, revisionId, allowDownloadByGS, alias,
    },
  );
  return data;
}
