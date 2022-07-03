import { createSelector } from 'reselect';
import picsioConfig from '../../../../../config';
import * as utils from '../../shared/utils';
// import normalizeAsset from '../../components/CatalogItem/helpers/normalizeAsset';

const getUserPermissions = (state) => state.user.role.permissions;
const getSelectedAssets = (state) => state.assets.selectedItems;
const getAllowedActions = (state) => state.assets.allowedActions;
const getAssets = (state) => state.assets.items;
const getAssetId = (state, props) => props.assetId;

export const assetSelector = createSelector(
  getUserPermissions,
  getAssetId,
  getAssets,
  (userPermissions, assetId, assets) => {
    const asset = assets.find((item) => item._id === assetId);
    if (asset) {
      const extendedAsset = { ...asset };
      const isRestricted = utils.isAssetRestricted(extendedAsset.restrictSettings);
      const restrictedIsDownloadableOrShareable = picsioConfig.isMainApp()
        ? !isRestricted || (isRestricted && userPermissions.restrictedDownload)
        : true;
      extendedAsset.allowAssetSharing = Boolean(
        picsioConfig.isMainApp()
        && !asset.trashed
        && !asset.archived
        && asset.permissions.websites
        && restrictedIsDownloadableOrShareable,
      );

      return extendedAsset;
      // @TODO: think about usage normalizeAsset helper
      // return normalizeAsset(asset);
    }

    return {};
  },
);

export const allowedActionsSelector = createSelector(
  getAllowedActions,
  (actions) => actions,
);

export const selectedAssetsIdsSelector = createSelector(
  getSelectedAssets,
  (ids) => ids,
);

export default {
  assetSelector,
  allowedActionsSelector,
  selectedAssetsIdsSelector,
};
