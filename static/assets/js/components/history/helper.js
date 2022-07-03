import dayjs from 'dayjs';

import Q from 'q';
import * as api from '../../api/index';
import picsioConfig from '../../../../../config';
import Store from '../../store';

let allUsers = [];

export function getRevisions(assetId) {
  let url = `/images/${assetId}/revisions`;
  if (!picsioConfig.isMainApp()) url = `${picsioConfig.getApiBaseUrl()}/public${url}?alias=${window.websiteConfig.alias}`;

  return api.get(url);
}

function getComments(assetId) {
  let url = `/images/${assetId}/comments`;
  if (!picsioConfig.isMainApp()) url = `${picsioConfig.getApiBaseUrl()}/public${url}?alias=${window.websiteConfig.alias}`;

  return api.get(url);
}

export async function removeComment(assetId, commentId) {
  if (typeof commentId !== 'string' || commentId.length !== 24) {
    const error = new Error('Error deleting comment: commentId isnt ObjectId');
    throw error;
  }

  const url = `/images/${assetId}/comments/${commentId}`;

  try {
    return await Q(api.del(url));
  } catch (err) {
    throw err;
  }
}

/**
 * Get revisions and comments
 * @param {string} modelID
 * @returns {Promise}
 */
export async function fetchData(modelID, dontGetRevision) {
  try {
    if (picsioConfig.isMainApp()) {
      allUsers = Store.getState().teammates.items.map((user) => ({
        _id: user._id,
        name: user.displayName,
        descr: user.email,
        avatar: user.avatar,
      }));
    }
    return await Promise.all([dontGetRevision ? [] : getRevisions(modelID), getComments(modelID)]);
  } catch (error) {
    console.error('Can not fetch revisions or comments: ', error);
    throw error;
  }
}

/**
 * Add extra data to revisions, and normalize time
 * @param {Array} revisions
 * @param {number} timedrift
 */
export function normalizeRevisions(revisions) {
  let number = 1;
  revisions.forEach((revision) => {
    if (!revision.technical) {
      revision.revisionNumber = number++;
    } else {
      revision.revisionNumber = 0;
    }
  });
}

/**
 * Sort data by date
 * @param {Array} data
 */
export function sortData(data) {
  return data.sort((a, b) => {
    const dateA = dayjs(a.createdAt || a.modifiedTime);
    const dateB = dayjs(b.createdAt || b.modifiedTime);

    if (dateA.isBefore(dateB)) return -1;
    if (dateA.isAfter(dateB)) return 1;

    return 0;
  });
}

/**
 * Add comment
 * @param {string} assetId - image model _id
 * @param {Object} data
 *
 * @param {string} data.text
 * @param {Array} [data.markers]
 * @param {string} [data.proofingGuestName]
 *
 * @returns {Promise}
 */
export async function addComment(assetId, data) {
  try {
    let url = `/images/${assetId}/comments`;
    if (!picsioConfig.isMainApp()) url = `${picsioConfig.getApiBaseUrl()}/public${url}`;
    return await api.post(url, { data });
  } catch (error) {
    console.error(error);
  }
}

/**
 * Set marker numbers to comments
 * @param {Array} comments
 * @returns {number} next marker number
 */
export function setMarkersNumber(comments) {
  let number = 1;
  comments.forEach((comment) => {
    if (comment.markers && comment.markers.length > 0) {
      comment.markers.forEach((marker) => {
        marker.number = number;
        number += 1;
      });
    }
  });
  return number;
}

/**
 * Add revisionID field to Comment
 * @param {Array} data
 * @returns {Object} {revisionID: countComments with markers}
 */
export function setRevisionIdToComment(data) {
  let revisionID = null;
  const revisionsWithMarkers = {};

  data.forEach((item, index) => {
    // if revision
    if (item.revisionNumber !== undefined && ((item.technical && index === 0) || !item.technical)) {
      revisionID = item.id;
    } else {
      // if comment
      item.revisionID = revisionID;
      // if comment has marker(s) and revisionID not added
      if (item.markers && item.markers.length > 0) {
        if (revisionsWithMarkers[revisionID] === undefined) {
          revisionsWithMarkers[revisionID] = 1;
        } else {
          revisionsWithMarkers[revisionID] += 1;
        }
      }
    }
  });

  return revisionsWithMarkers;
}

/**
 * Add initial revision to the beginning
 * @param {Array} data
 * @param {boolean} canHaveRevisions
 * @returns {Array}
 */
export function addInitialRevision(data, canHaveRevisions) {
  data.unshift({
    id: '0',
    revisionNumber: 0,
    isInitial: true,
    technical: true,
    modifiedTime: new Date(),
    canHaveRevisions,
  });
}

/**
 * Replace mentions in comment
 * @param {string} text
 * @returns {Object}
 */
export function replaceMentions(text) {
  const mentions = [];
  const re = /<mention class="mentionedUserTextarea"(.*?)<\/mention>/gi;
  text = text.replace(re, (str) => {
    const dataId = str.match(/data-id="(.*?)"/gi)[0];
    const mention = str.match(/@(.*?)</gi)[0];
    const _id = dataId.substring(9, dataId.length - 1);
    const displayName = mention.substring(1, mention.length - 1);
    mentions.push({ _id, displayName });
    return `@${_id}`;
  });

  return { text, mentions };
}

/**
 * Normalize multiline comment
 * @param {string} text
 * @returns {string}
 */
export function multilineNormalize(text) {
  text = text.replace(/<div><br><\/div>/gi, '\n');
  text = text.replace(/<br>/gi, '\n');
  text = text.replace(/<div>/gi, '\n');
  text = text.replace(/<\/div>/gi, '');
  return text;
}

/**
 * Generate technical comment
 * @param {string} approved - true/false
 * @param {string} revisionId
 * @param {string} approvedBy - initiator
 * @param {string} timestamp - approved/disapproved date
 * @param {string} revNumber - revision number
 * @param {string} userAvatar - Optional avatar url
 * @param {string} userDisplayName - Optional user display name
 * @param {bool} isRemovable - param to hide 'delete comment' button
 * @param {bool} highlightNotification - Optional add css class for highlight element
 * @returns {Object} - generated
 */

export function makeTechComment(
  approved,
  revisionId,
  approvedBy,
  timestamp,
  revNumber,
  userAvatar,
  userDisplayName,
  highlightNotification,
) {
  const user = (allUsers.length && allUsers.find((user) => user._id === approvedBy)) || {
    name: 'Deleted teammate',
  };
  return {
    createdAt: timestamp,
    imageId: null,
    markers: [],
    revisionID: revisionId,
    text: '',
    updatedAt: timestamp,
    userAvatar: !picsioConfig.isMainApp() ? userAvatar : user.avatar,
    userDisplayName: !picsioConfig.isMainApp() ? userDisplayName : user.name,
    userEmail: '',
    userId: approvedBy,
    _id: Math.random() * 1000, // we don't receive unique id
    approved,
    revNumber,
    isRemovable: false,
    highlightNotification: highlightNotification || false,
  };
}

export async function addReactionToComment(assetId, commentId, userId, value, guestName = null) {
  const data = {
    user: {
      _id: userId,
    },
    guestName,
    value,
  };

  try {
    let url = `/images/${assetId}/comments/${commentId}/reactions`;

    if (!picsioConfig.isMainApp()) {
      url = `${picsioConfig.getApiBaseUrl()}/public${url}`;
    }
    await api.post(url, { data });

    return data;
  } catch (error) {
    throw new Error(error);
  }
}
