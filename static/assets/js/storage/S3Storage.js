import Q from 'q';
import qlimit from 'qlimit';
import picsioUtils from '@picsio/utils';
import * as assetsApi from '../api/assets';

const sendFile = (url, file, storageId, revisionId, partNum, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = ({ loaded, total }) => onProgress(loaded, total, xhr);
    xhr.onload = () => {
      const etag = xhr.getResponseHeader('etag');
      if (!etag) return reject('Error getting ETag from response');

      return resolve({
        storageId,
        etag,
        partNum,
        headRevisionId: revisionId,
        fileSize: file.size.toString(),
      });
    };
    xhr.onabort = reject;
    xhr.onerror = reject;
    xhr.open('PUT', url, true);
    xhr.setRequestHeader('content-disposition', 'attachment');
    xhr.send(file);
  });
};

const repeat = async (fn, maxTries = 3, tryNumber = 1) => {
  try {
    return await fn();
  } catch (err) {
    const delay = 50 * (2 ** tryNumber);
    if (err.type === 'abort') throw err;
    if (tryNumber >= maxTries) {
      throw err;
    } else {
      console.log(`${err.message || 'Something went wrong'}, trying again in ${delay / 1000} sec...`);
      return Q.Promise(resolve => setTimeout(() => resolve(repeat(fn, maxTries, tryNumber + 1)), delay));
    }
  }
};

export default {
  /**
   * Upload file to the S3
   * @param {Object} params
   * @param {*} prams.file - file from filesystem
   * @param {string?} prams.collectionId
   * @param {string?} params.lightboardId
   * @param {Function?} params.onUploadProgress
   * @param {Function?} params.id - for updlaod revision
   * @returns {Promise}
   */
  async uploadFile({ file, collectionId, lightboardId, onUploadProgress = () => {}, id }) {
    const fileName = file.name;
    const fileSize = file.size;
    let mimeType = file.type;
    if (!mimeType) {
      mimeType =
        picsioUtils.lookupMimeType(file.name.split('.').pop()) || 'application/octet-stream';
    }
    const res = await assetsApi.getS3UploadUrl(
      fileName,
      fileSize,
      mimeType,
      collectionId,
      lightboardId,
      id
    );

    const { urls: urlsData, uploadId, storageId, revisionId, chunkNums } = res;

    const chunkSize = file.size / chunkNums;

    const fileBlobChunks = [...Array(chunkNums).keys()].map((num) => {
      const start = num * chunkSize;
      const end = (num + 1) * chunkSize;
      return num < chunkNums
        ? file.slice(start, end, file.type)
        : file.slice(start, undefined, file.type);
    });

    const chunkUploadLimit = qlimit(5);
    let initialPercentage = 0;
    let uploadAborted = false;
    const uploadProgress = {};

    const resAll = await Q.all(
      urlsData.map(
        chunkUploadLimit(async (urlObject, index) => {
          try {
            if (uploadAborted) throw new Error('Aborted');
            const chunk = fileBlobChunks[urlObject.partNum - 1];

            const uploadFunc = sendFile.bind(this, urlObject.url, chunk, storageId, revisionId, urlObject.partNum, (loaded, total, xhr) => {
              uploadProgress[index] = initialPercentage + (loaded / chunkNums / total) * 100;
              onUploadProgress({
                percentage: uploadProgress ? Object.values(uploadProgress).reduce((sum, num) => sum + num, 0) : 0,
                xhr,
              });
            });
            return await repeat(uploadFunc);
          } catch (err) {
            uploadAborted = true;
            uploadProgress[index] = 0;
            throw err;
          }
        })
      )
    );
    const parts = resAll.map((item) => ({
      ETag: item.etag,
      PartNumber: item.partNum,
    }));

    await assetsApi.completeMultipart(parts, uploadId, storageId);
    return { storageId, headRevisionId: revisionId, fileSize: fileSize.toString() };
  },
};
