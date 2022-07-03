import RetryHandler from './RetryHandler';
import Logger from '../services/Logger';
import picsioConfig from '../../../../config';
import * as api from '../api/assets';
import * as utils from '../shared/utils';
import ua from '../ua';

const fn = function (RetryHandler) {
  /**
	 * Helper class for resumable uploads using XHR/CORS. Can upload any Blob-like item, whether
	 * files or in-memory constructs.
	 *
	 * @example
	 * var content = new Blob(["Hello world"], {"type": "text/plain"});
	 * var uploader = new GDriveUploader({
	 *   file: content,
	 *   onComplete: function(data) { ... }
	 *   onError: function(data) { ... }
	 * });
	 * uploader.upload();
	 *
	 * @constructor
	 * @param {object} options - Hash of options
	 * @param {blob} options.file - Blob-like item to upload
	 * @param {string} [options.fileId] - ID of file if replacing
	 * @param {object} [options.params] - Additional query parameters
	 * @param {string} [options.contentType] - Content-type, if overriding the type of the blob.
	 * @param {object} [options.metadata] - File metadata
	 * @param {function} [options.onComplete] - Callback for when upload is complete
	 * @param {function} [options.onError] - Callback if upload fails
	 */
  const GDriveUploader = function (options) {
    const noop = function () {};
    this.file = options.file;
    this.fileId = options.fileId;
    this.assetIdToReplace = options.assetIdToReplace; // may be undefined
    // TODO: fix it when mimetype bug will be fixed by GoogleDrive team
    // http://stackoverflow.com/questions/19769000/google-drive-uploading-file-size-limit/20101384
    // this.contentType = 'application/octet-stream';
    this.contentType = options.contentType || this.file.type || 'application/octet-stream';
    this.metadata = options.metadata || {
      // title: this.file.name || options.filename,
      // should be name property for API v3, but API v3 has strange problems with upload revisions, it returns 404 for PUT request
      // 'name': this.file.name || options.filename,
      mimeType: this.contentType,
    };

    // if upload a new file (not revision)
    if (!this.fileId) {
      this.metadata.title = this.file.name || options.filename;
    }

    if (options.parents) {
      this.metadata.parents = options.parents.map((n) => ({ id: n }));
    }

    this.onComplete = options.onComplete || noop;
    this.onError = options.onError || noop;
    this.onProgress = options.onProgress || noop;
    this.offset = options.offset || 0;
    this.chunkSize = options.chunkSize || 0;
    this.delay = 45 * 1000; /* NEW: 45 - time waiting onProgress */ // OLD: 15 - seconds delays before retries
    this.retryHandler = new RetryHandler(); // TODO: What is this handler use for????

    this.delayURI = null;
    this.url = options.url;

    if (!this.url) {
      const params = options.params || {};
      params.uploadType = 'resumable';
      params.supportsTeamDrives = true;
      this.url = this.buildUrl_(this.fileId, params);
    }
    this.httpMethod = this.fileId ? 'PUT' : 'POST';

    return this;
  };

  GDriveUploader.prototype.upload = function () {
    return this.newUpload();
  };

  GDriveUploader.prototype.newUpload = async function () {
    let result;
    try {
      result = await api.getGDUploadUrl(
        this.fileId,
        this.metadata,
        this.file.size,
        this.contentType,
        this.assetIdToReplace,
      );
    } catch (err) {
      const errorMessage = utils.getDataFromResponceError(err, 'msg') || 'Get upload link error';
      throw new Error(errorMessage);
    }

    this.url = result.url;
    this.token = result.token;
    this.sendFile_();
  };

  /**
	 * Send the actual file content.
	 */
  GDriveUploader.prototype.sendFile_ = async function () {
    let content = this.file;
    let end = this.file.size;

    if (this.offset || this.chunkSize) {
      // Only bother to slice the file if we're either resuming or uploading in chunks
      if (this.chunkSize) {
        end = Math.min(this.offset + this.chunkSize, this.file.size);
      }
      content = content.slice(this.offset, end);
    }

    let { url } = this;
    if (ua.isMobileApp() && ua.getPlatform() === 'ios' && picsioConfig.ENV !== 'development') {
      url = `https://cors-anywhere.pics.io/${url}`;
    }
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = this.onContentUploadProgress_.bind(this, xhr);
    xhr.onload = this.onContentUploadSuccess_.bind(this);
    xhr.onabort = this.onAbort_.bind(this);
    xhr.onerror = xhr.ontimeout = function () {
      Logger.info('onerror');
      this.nextWatcher(xhr);
      this.onContentUploadError_();
    }.bind(this);
    xhr.timeout = 1000 * 60 * 15; // 15 minutes timeout to upload file
    xhr.open('PUT', url, true);
    xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
    xhr.setRequestHeader('Content-Type', this.contentType);
    xhr.setRequestHeader('Content-Range', `bytes ${this.offset}-${end - 1}/${this.file.size}`);
    xhr.setRequestHeader('X-Upload-Content-Type', this.file.type);
    xhr.send(content);
    this.watchDelayLimit(xhr);
  };

  GDriveUploader.prototype.watchDelayLimit = function (xhr) {
    this.delayURI = setTimeout(this.onContentUploadDelayError_.bind(this, xhr), this.delay);
  };

  GDriveUploader.prototype.onContentUploadDelayError_ = function (xhr) {
    xhr.abort();
  };

  GDriveUploader.prototype.clearDelayWatcher = function () {
    clearTimeout(this.delayURI);
  };

  GDriveUploader.prototype.nextWatcher = function (xhr) {
    this.clearDelayWatcher();
    this.watchDelayLimit(xhr);
  };

  /**
	 * Query for the state of the file for resumption.
	 *
	 * @private
	 */
  GDriveUploader.prototype.resume_ = function () {
    let { url } = this;
    if (ua.isMobileApp() && ua.getPlatform() === 'ios' && picsioConfig.ENV !== 'development') {
      url = `https://cors-anywhere.pics.io/${url}`;
    }
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url, true);
    xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
    xhr.setRequestHeader('Content-Range', `bytes */${this.file.size}`);
    xhr.setRequestHeader('X-Upload-Content-Type', this.file.type);
    xhr.timeout = 1000 * 30; // resume upload timeot
    xhr.onload = this.onContentUploadSuccess_.bind(this);
    xhr.onerror = xhr.ontimeout = this.onContentUploadError_.bind(this);
    xhr.send();
  };

  /**
	 * Extract the last saved range if available in the request.
	 *
	 * @param {XMLHttpRequest} xhr - Request object
	 */
  GDriveUploader.prototype.extractRange_ = function (xhr) {
    const range = xhr.getResponseHeader('Range');
    if (range) {
      this.offset = parseInt(range.match(/\d+/g).pop(), 10) + 1;
    }
  };

  /**
	 * Handle successful responses for uploads. Depending on the context,
	 * may continue with uploading the next chunk of the file or, if complete,
	 * invokes the caller's callback.
	 *
	 * @private
	 * @param {object} e - XHR event
	 */
  GDriveUploader.prototype.onContentUploadSuccess_ = function (e) {
    if (e.target.status == 200 || e.target.status == 201) {
      this.onComplete(e.target.response);
      this.clearDelayWatcher();
    } else if (e.target.status == 308) {
      this.extractRange_(e.target);
      // this.retryHandler.reset();
      this.sendFile_();
    } else {
      // if (e.target.status == 500) {
      let response;
      if (typeof e.target.response === 'string') {
        response = JSON.parse(e.target.response);
      } else {
        response = {
          code: e.target.status,
          reason: e.target.response.reason,
          message: e.target.response.error.message,
        };
      }
      this.onError(response);
    }
  };

  /**
	 * Handles errors for uploads. Either retries or aborts depending
	 * on the error.
	 *
	 * @private
	 * @param {object} e - XHR event
	 */
  GDriveUploader.prototype.onContentUploadError_ = function (e) {
    Logger.info('onContentUploadError_', 'happend');
    this.clearDelayWatcher();
    this.retryHandler.retry(this.resume_.bind(this), this.onError.bind(this));
  };

  GDriveUploader.prototype.onContentUploadProgress_ = function (xhr, evt) {
    if (evt.lengthComputable && xhr.readyState === 1) {
      this.onProgress(evt.loaded, evt.total, xhr);
    }
    this.nextWatcher(xhr);
  };

  /**
	 * Handles errors for the initial request.
	 *
	 * @private
	 * @param {object} e - XHR event
	 */
  GDriveUploader.prototype.onUploadError_ = function (e) {
    this.onError(e?.target?.response); // TODO - Retries for initial upload
  };

  /**
	 * Handles onabort
	 * @private
	 * @param {object} event - XHR event
	 */
  GDriveUploader.prototype.onAbort_ = function (event) {
    this.onError({
      code: 403,
      reason: 'xhrAborted',
      message: 'Slow connecion, xhr aborted',
    });
  };

  /**
	 * Construct a query string from a hash/object
	 *
	 * @private
	 * @param {object} [params] - Key/value pairs for query string
	 * @return {string} query string
	 */
  GDriveUploader.prototype.buildQuery_ = function (params) {
    params = params || {};
    return Object.keys(params)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
  };

  /**
	 * Build the drive upload URL
	 *
	 * @private
	 * @param {string} [id] - File ID if replacing
	 * @param {object} [params] - Query parameters
	 * @return {string} URL
	 */
  GDriveUploader.prototype.buildUrl_ = function (id, params = {}) {
    let url = 'https://www.googleapis.com/upload/drive/v2/files/';
    if (id) {
      /** if upload revision */
      url += id;
    } else {
      /** if upload new file */
      params = { ...params, keepRevisionForever: true };
    }
    const query = this.buildQuery_(params);
    if (query) {
      url += `?${query}`;
    }
    return url;
  };

  return GDriveUploader;
};

export default fn(RetryHandler);
