import React from 'react';
import ReactDOM from 'react-dom';
import { bindActionCreators } from 'redux';
import UiBlocker from '../../services/UiBlocker';

import * as Api from '../../api/downloadList';
import store from '../../store';
import * as actions from '../../store/actions/downloadList';

import * as utils from '../../shared/utils';
import localization from '../../shared/strings';
import picsioConfig from '../../../../../config';
import Logger from '../../services/Logger';
import ua from '../../ua';

import getDownloadUrl from '../../helpers/getDownloadUrl';
import DownloadDialog from './DownloadDialog';
import { showDialog, showErrorDialog } from '../dialog';

const downloadListActions = bindActionCreators({ ...actions }, store.dispatch);
const LIMIT_FILES_SIZE = 20 * 1024 * 1024 * 1024; // 20Gb
const LIMIT_MOBILE_APP_FILES_SIZE = 40 * 1024 * 1024; // 40mb

async function handleMobileAppDownload(assets, resolution) {
  UiBlocker.block('Preparing download');
  const assetsLessLimitSize = [];
  const assetsMoreLimitSize = [];
  assets.forEach((asset) => {
    if (asset.fileSize < LIMIT_MOBILE_APP_FILES_SIZE) {
      assetsLessLimitSize.push(asset);
    } else {
      assetsMoreLimitSize.push(asset);
    }
  });

  const listFilesForDirectLinksDownload = assetsMoreLimitSize.map((asset) => ({
    _id: asset._id,
    name: asset.name,
    mimeType: asset.mimeType,
    fileSize: asset.fileSize,
    url: null,
  }));

  if (listFilesForDirectLinksDownload.length) {
    try {
      const urls = await Promise.all(
        listFilesForDirectLinksDownload.map(
          (file) => getDownloadUrl({ assetId: file._id, useProxy: true }),
        ),
      );

      const logger = (id, size) => {
        Logger.log('User', 'DirectDownloadLinkDialogLinkClick', {
          id,
          size: utils.bytesToSize(size),
        });
      };
      Logger.log('UI', 'DirectDownloadLinkDialog', {
        assets: listFilesForDirectLinksDownload.length,
      });

      showDialog({
        title: localization.DIRECT_LINK_DOWNLOAD_DIALOG.TITLE(
          listFilesForDirectLinksDownload.length,
        ),
        children: localization.DIRECT_LINK_DOWNLOAD_DIALOG.TEXT(
          listFilesForDirectLinksDownload,
          urls,
          logger,
        ),
        textBtnCancel: null,
      });
    } catch (err) {
      showErrorDialog(localization.DIRECT_LINK_DOWNLOAD_DIALOG.error);
      Logger.error(new Error(localization.DIRECT_LINK_DOWNLOAD_DIALOG.error), { error: err }, [
        'GetDirectDownloadLinkFailed',
        (err && err.message) || 'NoMessage',
      ]);
    }
  }

  const listFiles = assetsLessLimitSize.map((asset) => ({
    _id: asset._id,
    name: asset.name,
    mimeType: asset.mimeType,
    fileSize: asset.fileSize,
    url: null,
    resolution, /** to download video proxy version */
  }));

  UiBlocker.unblock();
  downloadListActions.addToDownloadList(listFiles);
}

/**
 * @param {Object[]} assets
 * @param {Object} config
 */
export default function renderDownloadDialog(assets, config) {
  Logger.log('UI', 'ShowDownloadDialog', `${assets.length}`);
  const shouldFormatBeDisabled = assets.some((n) => !n.isConvertibleFormat);
  const parentEl = document.querySelector('.wrapperDownloadDialog');

  const handleCloseDialog = () => {
    if (parentEl) ReactDOM.unmountComponentAtNode(parentEl);
  };

  const addSkeletonToDownloadList = (data) => {
    if (data.isArchive) {
      downloadListActions.addToDownloadList([{ isSkeleton: true }]);
    } else if (ua.isMobileApp()) {
      const assetsLessLimitSize = assets.filter(
        (asset) => asset.fileSize < LIMIT_MOBILE_APP_FILES_SIZE,
      );
      downloadListActions.addToDownloadList(assetsLessLimitSize.map(() => ({ isSkeleton: true })));
    } else {
      downloadListActions.addToDownloadList(assets.map(() => ({ isSkeleton: true })));
    }
  };

  const handleDownload = async (data) => {
    Logger.log('User', 'DownloadDialogSubmit', {
      assetsCount: assets.length,
      organizeByCollections: data.organizeByCollections,
      isArchive: data.isArchive,
      resolution: data.resolution,
    });
    const storageType = assets[0].storageType || 'gd';
    const collectionId = assets[0].collectionId || null;
    const isOriginal = data.mimeType === 'original';
    const watermarkedAssets = [];
    let regularAssets = [];

    /** Get watermarked assets in order to use zipper for them */
    if ((isOriginal || data.resolution) && !data.isArchive) {
      assets.forEach((asset) => {
        if (asset.watermarkId && !data.withoutWatermark) watermarkedAssets.push(asset);
        else regularAssets.push(asset);
      });
    }

    /** Download from user storage */
    if (regularAssets.length && (isOriginal || data.resolution) && !data.isArchive) {
      addSkeletonToDownloadList(data);
      (async () => {
        if (collectionId || config.loadedItems.length < regularAssets.length) {
          /** if selected assets more then loaded to store */
          try {
            UiBlocker.block('Preparing');
            let images = [];

            if (collectionId) {
              // case when we download collection
              images = regularAssets;
            } else {
              // case when we download selected assets
              const result = await Api.getDownloadOriginalData({
                fields: ['_id', 'googleId', 'storageId', 'name', 'mimeType', 'fileSize'],
              });
              images = result.images;
            }
            // TODO: need to fix function params reassign
            // eslint-disable-next-line
            regularAssets = regularAssets.map((asset) => images.find((n) => n._id === asset._id));
          } catch (err) {
            showErrorDialog(localization.DOWNLOADDIALOG.errorCantCreateArchive);
          }
          UiBlocker.unblock();
        }
        if (ua.isMobileApp()) {
          await handleMobileAppDownload(regularAssets, data.resolution);
        } else {
          const listFiles = regularAssets.map((asset) => ({
            _id: asset._id,
            name: asset.name,
            mimeType: asset.mimeType,
            fileSize: asset.fileSize,
            url: null,
            resolution: data.resolution, /** to download video proxy version */
          }));

          downloadListActions.addToDownloadList(listFiles);
        }
      })();

      setTimeout(handleCloseDialog, 300); // fix for flying download icon

      if (!watermarkedAssets.length) return;
    }

    if (isOriginal && watermarkedAssets.length) {
      assets = watermarkedAssets;
      data.ignoreCache = true;
    }

    /** Download from Zipper */
    const assetsTotalSize = assets.reduce(
      (totalSize, asset) => totalSize + Number(asset.fileSize),
      0,
    );

    if (assetsTotalSize > LIMIT_FILES_SIZE) {
      Logger.log('UI', 'ArchiveSizeExceedsDownloadDialog', {
        assetsTotalSize,
        filesCount: assets.length,
      });
      const { TITLE, TEXT } = localization.DIALOGS.DOWNLOAD_ASSETS_SIZE_LIMITATIONS;
      showDialog({
        title: TITLE,
        text: TEXT,
        textBtnCancel: null,
      });
      return;
    }

    // TODO: need to fix function params reassign
    /* eslint-disable */
    data.ids = assets.map((asset) => asset._id);
    data.user = store.getState().user._id;

    if (config.collectionId) {
      data.collectionId = config.collectionId;
    }
    if (picsioConfig.isProofing()) {
      data.websiteId = picsioConfig.access._id;
    }
    /* eslint-enable */

    let urls;
    try {
      UiBlocker.block('Preparing');
      handleCloseDialog();
      urls = await Api.getZipUrls(data, storageType);
    } catch (err) {
      showErrorDialog(localization.DOWNLOADDIALOG.errorCantCreateArchive);
    }
    UiBlocker.unblock();

    if (urls) {
      const pollUrl = urls.zipUrl.replace(/\.zip$/, '.json');

      if (data.isArchive) {
        downloadListActions.addToDownloadList([
          {
            name: urls.zipUrl.replace(/(.*|\/)\//, ''),
            mimeType: 'application/zip',
            url: urls.zipUrl,
            pollUrl,
          },
        ]);
      } else {
        const listFiles = assets.map((asset) => ({
          _id: asset._id,
          name: urls.fileUrls[asset._id].replace(/(.*|\/)\//, ''),
          mimeType: data.mimeType,
          url: urls.fileUrls[asset._id],
          pollUrl,
        }));

        downloadListActions.addToDownloadList(listFiles);
      }
    }
  };

  ReactDOM.render(
    <DownloadDialog
      countAssets={assets.length}
      assets={assets}
      close={handleCloseDialog}
      onDownload={handleDownload}
      shouldFormatBeDisabled={shouldFormatBeDisabled}
    />,
    parentEl,
  );
}
