import picsioConfig from '../../../../config';
import ua from '../ua';
import * as api from './index';
import globalHistory, { isRoutePreview, isRouteSearch } from '../helpers/history';

const CONFIG = {
  PAGE_SIZE: 50,
};

export const prepareSearchQuery = () => {
  let query = window.location.search.slice(1);
  if (!isRouteSearch()) {
    const latestSearch = globalHistory.entries.find(
      ({ pathname, search }) => isRouteSearch(pathname + search),
    );
    if (latestSearch) query = latestSearch.search.slice(1);
  }

  const result = {};
  // query is empty for proofing main page
  if (query) {
    query.split('&').forEach((item) => {
      const [key, value] = item.split('=');
      const decodedValue = decodeURIComponent(value);

      result[key] = key in result ? [].concat(result[key], decodedValue) : decodedValue;
    });
  }
  return result;
};

/**
 * Fetch assets for main app
 * @param {number} from
 * @param {object} sort
 * @param {boolean?} geoData
 * @returns {Promise}
 */
async function fetchPicsioAssets(from, sort, geoData, assets) {
  const data = {
    ...prepareSearchQuery(),
    size: geoData ? 'all' : CONFIG.PAGE_SIZE,
    from,
    sort,
  };
  if (isRoutePreview()) {
    const assetId = window.location.pathname.split('/').pop();
    const asset = assets.find((a) => a._id === assetId);
    if (asset && asset.trashed) data.trashed = true;
  }
  if (geoData) {
    data.geoData = true;
    data.onlyIds = true;
    data.zoom = Number(data.zoom);
  }

  return api.post('/images/search', { data });
}

/**
 * Fetch assets for proofing template
 * @param {number} from
 * @returns {Promise}
 */
function fetchProofingAssets(from, sort) {
  const query = prepareSearchQuery();
  query.tagId = query.tagId || picsioConfig.access.tag._id;
  return api
    .post(`${picsioConfig.getApiBaseUrl()}/public/images/search`, {
      data: {
        alias: window.websiteConfig.alias,
        size: CONFIG.PAGE_SIZE,
        from,
        sort,
        ...query,
      },
    })
    .catch((err) => {
      if (err.status === 401) {
        window.location.replace(
          `/websites/signin?alias=${window.websiteConfig.alias}`,
        );
      }
      throw err; // actually we should write something meaningful to user here
    });
}

export const get = (...params) => (picsioConfig.isProofing()
  ? fetchProofingAssets(...params)
  : fetchPicsioAssets(...params));

/**
 * Get one asset
 * @param {string} id - asset id
 * @returns {Promise}
 */
export const fetchOneAsset = (id) => {
  let url = `/images/${id}`;
  if (!picsioConfig.isMainApp()) {
    url = `${picsioConfig.getApiBaseUrl()}/public${url}?alias=${
      window.websiteConfig.alias
    }`;
  }
  return api.get(url);
};

/**
 * Get assets by ids
 * @param {string[]} ids - assets ids
 * @returns {Promise}
 */
export const fetchAssetsByIds = (ids) => {
  const data = {
    assetIds: ids,
  };
  return api.post('/images/getAssets', { data });
};

export const fetchThumbnailsMainApp = (assetIds) => api.post('/images/fetchThumbnails', { data: { assetIds } });

export const fetchThumbnailsWebsites = (assetIds) => {
  const { alias } = window.websiteConfig;
  const apiBaseUrl = picsioConfig.getApiBaseUrl();
  return api.get(
    `${apiBaseUrl}/public/drive/files/${assetIds.join(',')}?alias=${alias}`,
  );
};

/**
 * Fetch thumbmails for assets
 * @param {string[]} assetIds
 * @returns {Promise}
 */
export const fetchThumbnails = (assetIds) => (picsioConfig.isMainApp()
  ? fetchThumbnailsMainApp(assetIds)
  : fetchThumbnailsWebsites(assetIds));

export const fetchRevisionsThumbnailsMainApp = (assetId) => api.get(`/images/${assetId}/revisionsThumbnails`);

export const fetchRevisionsThumbnailsWebsites = (assetId) => {
  const apiBaseUrl = picsioConfig.getApiBaseUrl();
  return api.get(`${apiBaseUrl}/public/images/${assetId}/revisionsThumbnails?alias=${
    window.websiteConfig.alias
  }`);
};

/**
 * Fetch revisions thumbmails for assets
 * @param {string[]} assetIds
 * @returns {Promise}
 */
export const fetchRevisionsThumbnails = (assetIds) => (picsioConfig.isMainApp()
  ? fetchRevisionsThumbnailsMainApp(assetIds)
  : fetchRevisionsThumbnailsWebsites(assetIds));

export const fetchPagesThumbnailsMainApp = (assetId, revisionId) => {
  if (revisionId) return api.get(`/images/${assetId}/pagesThumbnails/${revisionId}`);
  return api.get(`/images/${assetId}/pagesThumbnails`);
};

export const fetchPagesThumbnailsWebsites = (assetId, revisionId) => {
  const apiBaseUrl = picsioConfig.getApiBaseUrl();
  if (revisionId) {
    return api.get(`${apiBaseUrl}/public/images/${assetId}/pagesThumbnails/${revisionId}?alias=${
      window.websiteConfig.alias
    }`);
  }
  return api.get(`${apiBaseUrl}/public/images/${assetId}/pagesThumbnails?alias=${
    window.websiteConfig.alias
  }`);
};

/**
 * Fetch pages for assets
 * @param {string} assetId
 * @param {string} revisionId
 * @returns {Promise}
 */
export const fetchPagesThumbnails = (assetId, revisionId) => (picsioConfig.isMainApp()
  ? fetchPagesThumbnailsMainApp(assetId, revisionId)
  : fetchPagesThumbnailsWebsites(assetId, revisionId));

export const fetchVideoThumbnailMainApp = (assetId) => api.get(`/images/${assetId}/videoPreview`);

export const fetchVideoThumbnailWebsites = (assetId) => {
  const apiBaseUrl = picsioConfig.getApiBaseUrl();
  return api.get(
    `${apiBaseUrl}/public/images/${assetId}/videoPreview?alias=${
      window.websiteConfig.alias
    }`,
  );
};

/**
 * Fetch thumbmail for video assets
 * @param {string} assetId
 * @returns {Promise}
 */
export const fetchVideoThumbnail = (assetId) => (picsioConfig.isMainApp()
  ? fetchVideoThumbnailMainApp(assetId)
  : fetchVideoThumbnailWebsites(assetId));

/**
 * Get aggregatedData for assets (details panel)
 * @param {string[]} assetsIds
 * @returns {Promise}
 */
export const getAggregatedData = (assetsIds) => api.post('/images/aggregatedData', {
  data: { _ids: assetsIds },
});

/**
 * Reorder assets
 * @param {string} tagId
 * @param {string} lightboardId
 * @param {Object[]} list
 * @returns {Promise}
 */
export const reorder = (
  tagId,
  lightboardId,
  list,
  overwriteCurrentCustomSort,
) => {
  let url = '/images/order';
  if (overwriteCurrentCustomSort) url += '?overwriteCurrentCustomSort=true';

  return api.put(url, {
    data: {
      tagId,
      lightboardId,
      list,
    },
  });
};

/**
 * Get assets IDs for cmd+A
 * @returns {Promise}
 */
export const selectAll = () => api.post('/images/search', {
  data: {
    onlyIds: true,
    ...prepareSearchQuery(),
    responseSchema: {
      full: 1,
      images: {
        _id: 1,
      },
      total: 1,
    },
  },
});

/**
 * Get assets total for collection
 * @param {string} tagId - collection ID
 * @returns {Promise}
 */
export const getAssetsTotal = (tagId) => api.post('/images/search', {
  data: {
    onlyIds: true,
    tagId,
    responseSchema: {
      total: 1,
      images: 0,
    },
  },
});

/**
 * Get assets with keys from schema, like { _id: 1, name: 1 }
 * @returns {Promise}
 */
export const getAssetsBySchemaForSearchQuery = (schema) => api.post('/images/search', {
  data: {
    onlyIds: true,
    ...prepareSearchQuery(),
    responseSchema: {
      images: {
        ...schema,
      },
    },
  },
});

/**
 * Get url and token for upload file
 * @param {string?} assetId - for upload revision
 * @param {*} metadata - metadata for upload
 * @param {number} contentLength - file size
 * @param {string} contentType
 * @param {string?} assetIdToReplace
 * @returns {Promise} - server returns
 * {
 *   url: UploadUrl,
 *   token: AuthorizationToken
 * }
 */
export const getGDUploadUrl = (
  assetId,
  metadata,
  contentLength,
  contentType,
  assetIdToReplace,
) => {
  const data = {
    metadata, contentType, contentLength, assetIdToReplace,
  };
  let url = '/images/buildGDUploadLink';
  if (assetId) url += `/${assetId}`;

  return api.post(url, { data });
};

/**
 * Get url for upload file to the S3
 * @param {string} fileName - required
 * @param {string} fileSize - required
 * @param {string} mimeType - required
 * @param {string?} collectionId - if no collectionId - upload to the root
 * @param {string?} lightboardId
 * @param {string?} assetId - for upload revision
 * @returns {Promise} - server returns { url: UploadUrl }
 */
export const getS3UploadUrl = (
  fileName,
  fileSize,
  mimeType,
  collectionId,
  lightboardId,
  assetId,
) => {
  let url = '/images/buildS3UploadLink';
  if (assetId) {
    /** url for upload REVISION */
    url += `/${assetId}`;
  }
  return api.post(url, {
    data: {
      fileName, fileSize, mimeType, collectionId, lightboardId,
    },
  });
};

export const completeMultipart = (parts, uploadId, storageId) => api.post('/images/completeS3Multipart', { data: { parts, uploadId, storageId } });


/**
 * Get custom video url for MainApp
 * @param {string} assetId
 * @param {string?} revisionId
 * @returns {Promise}
 */
function getCustomVideoUrlMain(assetId, revisionId) {
  let url = `/images/buildCustomVideoLink/${assetId}`;
  if (revisionId) url += `/${revisionId}`;
  if (window.useProxy) {
    url += '?useProxy=true';
  }
  return api.get(url);
}

/**
 * Get custom video url for Proofing and Sas
 * @param {string} assetId
 * @param {string?} revisionId
 * @returns {Promise}
 */
function getCustomVideoUrlProofingAndSas(assetId, revisionId) {
  let url = `${picsioConfig.getApiBaseUrl()}/public/images/buildCustomVideoLink/${assetId}`;
  if (revisionId) url += `/${revisionId}`;
  url += `?alias=${window.websiteConfig.alias}`;
  return api.get(url);
}

/**
 * Get custom video url
 * @param {string} assetId
 * @param {string?} revisionId
 * @returns {Promise}
 */
export const getCustomVideoUrl = (...params) => (picsioConfig.isMainApp()
  ? getCustomVideoUrlMain(...params)
  : getCustomVideoUrlProofingAndSas(...params));

/**
 * Get restricted assets
 * @returns {Promise}
 */
export const getRestrictedAssets = (tagId) => api.post('/images/search', {
  data: {
    showRestricted: true,
    tagId,
  },
});

/**
 * Download zipped assets on proofing
 */
export async function downloadWebsiteZip(storageType) {
  let zipperUrl = picsioConfig.services.zipper.URL;
  if (storageType === 'gd') {
    zipperUrl = picsioConfig.services.zipper.URL_GD;
  }
  if (storageType === 's3') {
    zipperUrl = picsioConfig.services.zipper.URL_S3;
  }

  window.open(
    `${zipperUrl}?websiteId=${picsioConfig.access._id}&mimeType=original&resizing=original`,
    '_blank',
  );
}


/**
 * Remove assets from collection
 * @param {string[]} ids - assets ids
 * @param {string} collectionId
 * @returns {Promise}
 */
export const removeFromCollection = (ids, collectionId) => api.post('/batch/assets/removeCollection', {
  data: { ids, collectionId },
});


/**
 * Delete assets without trash
 * @param {string[]} assetsIds
 */
export const deleteAssets = (assetIds) => api.del('/images/delete', { data: { assetIds } });

/**
 * Add assets to lightboard
 * @param {string[]} ids
 * @param {string} lightboardId
 * @param {boolean} isMove
 * @param {object?} actions -
 *                       { [assetId]: { action: 'rename' | 'replace', assetIdToReplace: [assetId] }}
 * @returns {Promise}
 */
export const addToLightboard = (ids, lightboardId, isMove = false, actions) => api.post('/batch/assets/addLightboard', {
  data: {
    ids,
    lightboardId,
    isMove,
    actions,
  },
});

/**
 * Remove assets from lightboard
 * @param {string[]} ids
 * @param {string} lightboardId
 * @returns {Promise}
 */
export const removeFromLightboard = (ids, lightboardId) => api.post('/batch/assets/removeLightboard', {
  data: { ids, lightboardId },
});

/**
 * Add keyword to assets
 * @param {string[]} assetIds
 * @param {string} keywordName
 * @returns {Promise}
 */
export const addKeyword = (assetIds, keywordName) => {
  let url = '/keywords/attach';
  if (!picsioConfig.isMainApp()) {
    url = `${picsioConfig.getApiBaseUrl()}/public${url}?alias=${
      window.websiteConfig.alias
    }`;
  }
  return api.put(url, {
    data: {
      assetIds,
      name: keywordName,
    },
  });
};

/**
 * Remove keyword from assets
 * @param {string[]} assetIds
 * @param {string} keywordId
 * @returns {Promise}
 */
export const removeKeyword = (assetIds, keywordId) => {
  let url = `/keywords/detach/${keywordId}`;
  if (!picsioConfig.isMainApp()) {
    url = `${picsioConfig.getApiBaseUrl()}/public${url}?alias=${
      window.websiteConfig.alias
    }`;
  }
  return api.put(url, { data: { assetIds } });
};

/**
 * Assign user to assets
 * @param {string} assigneeId
 * @param {string[]} imageIds
 * @returns {Promise}
 */
export const assignUser = (assigneeId, imageIds) => api.put('/images/assignAssets', {
  data: {
    imageIds,
    assigneeId,
  },
});

export const setCollections = (assetId, collectionIds) => api.put(`/assets/${assetId}/setTags`, {
  data: { tagIds: collectionIds },
});

/**
 * Unassign user from assets
 * @param {string} assigneeId
 * @param {string[]} imageIds
 * @returns {Promise}
 */
export const unAssignUser = (assigneeId, imageIds) => api.put('/images/unassignAssets', {
  data: {
    imageIds,
    assigneeId,
  },
});

/**
 * Patch assets
 * @param {string[]} ids
 * @param {Object} patchForAssets
 * @returns {Promise}
 */
export const patch = (ids, patchForAssets) => {
  let url = '/images';
  if (!picsioConfig.isMainApp()) {
    url = `${picsioConfig.getApiBaseUrl()}/public${url}?alias=${
      window.websiteConfig.alias
    }`;
  }
  return api.put(url, { data: { ids, patch: patchForAssets } });
};


/**
 * Set title for assets
 * @param {string[]} ids
 * @param {string} value
 * @returns {Promise}
 */
export const setTitle = (ids, value) => {
  let url = '/images/setTitle';
  if (!picsioConfig.isMainApp()) {
    url = `${picsioConfig.getApiBaseUrl()}/public${url}?alias=${
      window.websiteConfig.alias
    }`;
  }
  return api.put(url, { data: { ids, value } });
};

/**
 * Set description for assets
 * @param {string[]} ids
 * @param {string} value
 * @returns {Promise}
 */
export const setDescription = (ids, value) => {
  let url = '/images/setDescription';
  if (!picsioConfig.isMainApp()) {
    url = `${picsioConfig.getApiBaseUrl()}/public${url}?alias=${
      window.websiteConfig.alias
    }`;
  }
  return api.put(url, { data: { ids, value } });
};

/**
 * Set flag for assets
 * @param {string[]} ids
 * @param {string} value - must be one of "flagged | unflagged | rejected"
 * @returns {Promise}
 */
export const setFlag = (ids, value) => {
  let url = '/images/setFlag';
  if (!picsioConfig.isMainApp()) {
    url = `${picsioConfig.getApiBaseUrl()}/public${url}?alias=${
      window.websiteConfig.alias
    }`;
  }
  return api.put(url, { data: { ids, value } });
};

/**
 * Set color for assets
 * @param {string[]} ids
 * @param {string} value - must be one of "red | yellow | green | blue | purple | nocolor"
 * @returns {Promise}
 */
export const setColor = (ids, value) => {
  let url = '/images/setColor';
  if (!picsioConfig.isMainApp()) {
    url = `${picsioConfig.getApiBaseUrl()}/public${url}?alias=${
      window.websiteConfig.alias
    }`;
  }
  return api.put(url, { data: { ids, value } });
};

/**
 * Set rating for assets
 * @param {string[]} ids
 * @param {number} value - must be from 0 to 5
 * @returns {Promise}
 */
export const setRating = (ids, value) => {
  let url = '/images/setRating';
  if (!picsioConfig.isMainApp()) {
    url = `${picsioConfig.getApiBaseUrl()}/public${url}?alias=${
      window.websiteConfig.alias
    }`;
  }
  return api.put(url, { data: { ids, value } });
};

/**
 * Set userOrientation field for assets
 * @param {string[]} ids
 * @param {Object} value
 * @param {number} value.rotation - one of: 0 | 90 | 180 | 270
 * @param {boolean} value.flipX
 * @param {boolean} value.flipY
 */
export const setUserOrientation = (ids, value) => {
  let url = '/images/setUserOrientation';
  if (!picsioConfig.isMainApp()) {
    url = `${picsioConfig.getApiBaseUrl()}/public${url}?alias=${
      window.websiteConfig.alias
    }`;
  }
  return api.put(url, { data: { ids, value } });
};

/**
 * Set single asset sharing settings for assets
 * @param {string} id
 * @param {Object} value
 * @returns {Promise}
 */
export const setSingleAssetSharingSettings = (id, value) => {
  let url = '/images/setSingleSharingSettings';
  if (!picsioConfig.isMainApp()) {
    url = `${picsioConfig.getApiBaseUrl()}/public${url}?alias=${
      window.websiteConfig.alias
    }`;
  }
  return api.put(url, { data: { id, value } });
};

/**
 * Set restrict settings for assets
 * @param {string[]} ids
 * @param {Object} value
 * @returns {Promise}
 */
export const setAssetsRestrictSettings = (ids, value) => api.put('/images/setRestrictSettings', {
  data: {
    ids,
    value,
  },
});

/**
 * @param {string} assetId
 * @param {string} revisionId
 * @returns {Promise}
 */
export const approveRevision = (assetId, revisionId) => api.put(`/images/${assetId}/${revisionId}/approve`);

/**
 * @param {string} assetId
 * @param {string} revisionId
 * @returns {Promise}
 */
export const disApproveRevision = (assetId, revisionId) => api.put(`/images/${assetId}/${revisionId}/disapprove`);

/**
 * Change custom field value on assets
 * @param {string[]} ids
 * @param {string} title - custom field title
 * @param {string} type - custom field type
 * @param {string?} visibility
 * @param {*} value
 * @returns {Promise}
 */
export const patchCustomField = (ids, title, type, visibility, value) => api.put('/customFieldsValue/batch', {
  data: {
    images: ids,
    title,
    type,
    visibility,
    value,
  },
});

/**
 * Attach multiple custom field value on assets
 * @param {string[]} ids
 * @param {string} title - custom field title
 * @param {string} type - custom field type
 * @param {*} value
 * @returns {Promise}
 */
export const attachMultipleCustomField = (ids, title, type, value) => api.put('/customFieldsValue/attach', {
  data: {
    images: ids,
    title,
    type,
    value,
  },
});

/**
 * Detach multiple custom field value on assets
 * @param {string[]} ids
 * @param {string} title - custom field title
 * @param {string} type - custom field type
 * @param {*} value
 * @returns {Promise}
 */
export const detachMultipleCustomField = (ids, title, type, value) => api.put('/customFieldsValue/detach', {
  data: {
    images: ids,
    title,
    type,
    value,
  },
});

/**
 * Add revision
 * @param {string} assetID
 * @param {Object} data
 * @returns {Promise}
 */
export const addRevision = (assetID, data) => api.post(`/images/${assetID}/revisions/`, { data });

/**
 * Revert Revision
 * @param {string} assetId
 * @param {string} revisionId
 * @returns {Promise}
 */
export const revertRevision = (assetId, revisionId) => api.put(`/images/${assetId}/${revisionId}/revert`);

/**
 * Add video thumbnail
 * @param {string} assetID
 * @param {Blob} data
 * @returns {Promise}
 */
export const addThumbnail = (assetID, data) => {
  const formData = new FormData();
  formData.append('thumbnail', data);

  return api.post(`/images/${assetID}/thumbnail/`, {
    data: formData,
    contentType: false,
    processData: false,
  });
};

/** Get qualities for video */
export const getVideoQualities = (userId, assetId, revisionId = 'head') => api.get(
  `${picsioConfig.proxy.BASE_URL}/info?userId=${userId}&assetId=${assetId}&revisionId=${revisionId}`,
);

/** Get permissions for assets */
export const getAssetPermissions = (ids, permissionNames) => api.post('/images/getAssetsPermissions', {
  data: { ids, permissionNames },
});

/**
 * Export asset data to CSV
 * @param {string[]} assetIds
 * @param {string[]?} fields - to include in csv file,
 *                             if no fields -> all available fields will be included
 * @returns {Promise}
 */
export const exportCSV = (assetIds, fields = []) => api.post('/images/export/csv', { data: { assetIds, fields } });

/**
 * Remove meta field modified by user from DB
 * @param {string[]} assetIds
 * @param {string} fieldName
 * @returns {Promise}
 */
export const removeModifiedMetaFieldStatus = (assetIds, fieldName) => api.post('/images/removeModifiedMetaFieldStatus', {
  data: { assetIds, fieldName },
});

/**
 * Fetch linked assets groups
 * @param {string[]} assetIds
 * @returns {Promise}
 */
export const fetchLinkedAssets = (assetIds) => api.post('/linkedAssets/fetch', { data: { assetIds } });

/**
 * Link assets to group
 * @param {string[]} assetIds
 * @returns {Promise}
 */
export const linkedAssetsLink = (assetIds) => api.post('/linkedAssets/link', { data: { assetIds } });

/**
 * Unlink linked assets
 * @param {string[]} assetIds
 * @returns {Promise}
 */
export const linkedAssetsUnlink = (assetIds) => api.post('/linkedAssets/unlink', { data: { assetIds } });

/**
 * Unlink linked assets from asset
 * @param {string} assetId
 * @returns {Promise}
 */
export const linkedAssetsUnlinkFrom = (assetId) => api.post(`/linkedAssets/unlinkFrom/${assetId}`);

/**
 * Archive assets by ids and reason message
 * @param {object} data - { ids = [], reason = '' }
 * @returns {Promise}
 */
export const archiveAssets = (data) => api.post('/images/archive', { data });

/**
 * Unarchive assets by ids
 * @param {object} data - { ids = [] }
 * @returns {Promise}
 */
export const unarchiveAssets = (data) => api.post('/images/unarchive', { data });

/**
 * Re-run job for asset by ids and jobName
 * @param {object} data - { ids = [], jobName = '' }
 * @returns {Promise}
 */
export const rerunJob = (data) => api.post('/images/rerunJob', { data });

export const getSuggest = (data) => api.post('/searches/suggest', { data, timeout: 1000 * 15 });

/**
 * @returns {Promise}
 */
export const getWatermarks = () => api.get('/watermarks/');

/**
 * Create watermark by name
 * @param {string} name - name for watermark
 * @returns {Promise}
 */
export const createWatermark = (name) => api.post('/watermarks/', {
  data: {
    name,
  },
});

/**
 * Delete watermark by id
 * @param {string} watermarkId
 * @returns {Promise}
 */
export const deleteWatermark = (watermarkId, force) => api.delete(`/watermarks/${watermarkId}?force=${force}`);

/**
 * Update watermark
 * @param {string} name
 * @param {string} description
 * @param {string} type
 * @param {string} file
 * @param {string} text
 * @param {string} isDefault
 * @param {string} size
 * @param {string} opacity
 * @param {string} position
 * @param {string} watermarkId
 * @returns {Promise}
 */
export const updateWatermark = (watermarkId, data, force) => api.put(`/watermarks/${watermarkId}?force=${force}`, { data, contentType: 'multipart/form-data', processData: true });

/**
 * Attach watermark to asset by asset and watermark ids
 * @param {string[]} assetIDs
 * @param {string} watermarkId
 * @returns {Promise}
 */
export const attachWatermark = (assetIds, watermarkId, overwrite, force) => api.put(`/images/toggleWatermarks/?force=${force}&overwrite=${overwrite}`, {
  data: {
    assetIds,
    watermarkId,
  },
});

/**
 * Make watermark default
 * @param {string} watermarkId
 * @returns {Promise}
 */
export const setDefaultWatermark = (watermarkId) => api.post(`/watermarks/${watermarkId}/setDefault`, {
  data: {
    watermarkId,
  },
});
