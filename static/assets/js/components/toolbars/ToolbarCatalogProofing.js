import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { Provider, connect, useDispatch } from 'react-redux';
import store from '../../store';
import * as actions from '../../store/actions/main';
import { activeCollectionSelector } from '../../store/selectors/collections';
import ToolbarCatalogProofingTop from './ToolbarCatalogProofingTop';
import { getAssets } from '../../store/actions/assets';
import { showDialog } from '../dialog';
import { downloadWebsiteZip } from '../../api/assets';
import { checkDownloadConsent } from '../../store/helpers/assets';
import { showDownloadDialog } from '../../helpers/fileDownloader';
import Logger from '../../services/Logger';
import { LocalStorage } from '../../shared/utils';

async function downloadProofingAsZip(count, storageType) {
  try {
    await checkDownloadConsent();
  } catch (err) {
    // user click Cancel on Dialog
    return;
  }

  if (count > 300) {
    showDialog({
      title: 'Too many files',
      text:
        'This website contains more than 300 files. Due to technical limitations, downloading files as an archive is not available for this number of files.<br />You can still select and download individual assets if you like.',
      textBtnCancel: null,
    });
    Logger.log('UI', 'DownloadTooManyFilesDialog', `count: ${count}`);
    return;
  }

  downloadWebsiteZip(storageType);
}

const defaultSort = window.websiteConfig.sortType || { type: 'uploadTime', order: 'desc' };

const ToolbarCatalogProofing = (props) => {
  const {
    assets,
    downloadListItemsLength,
    downloadListOpened,
    mainActions,
    openedTree,
    selectedItemsLength,
    totalAssets,
  } = props;
  const dispatch = useDispatch();
  const asset = assets?.length && assets[0];
  const storageType = (asset && asset.storageType) || 'gd';
  const [sortType, setSortType] = useState(defaultSort);

  const handleToggleTree = useCallback(() => {
    mainActions.changeTree('collections');
  }, [mainActions]);

  const handleDownload = useCallback(() => {
    if (selectedItemsLength > 0) {
      showDownloadDialog();
    } else {
      downloadProofingAsZip(totalAssets, storageType);
    }
  }, [selectedItemsLength, totalAssets, storageType]);

  const handleDownloadList = useCallback(() => {
    Logger.log('User', 'DonwloadPanelShowClicked');
    mainActions.toggleDownloadList();
  }, [mainActions]);
  const handleChangeSort = useCallback((name, order) => {
    const newSortType = { type: name, order };
    setSortType(newSortType);
    window.websiteConfig.sortType = newSortType;
    dispatch(getAssets(true));
  }, [dispatch]);

  return (
    <div className="toolbarCatalog toolbarCatalogProofing">
      <ToolbarCatalogProofingTop
        downloadListItemsLength={downloadListItemsLength}
        downloadListOpened={downloadListOpened}
        handleDownload={handleDownload}
        handleDownloadList={handleDownloadList}
        handleToggleTree={handleToggleTree}
        handleChangeSort={handleChangeSort}
        openedTree={openedTree}
        selectedItemsLength={selectedItemsLength}
        sortType={sortType}
      />
    </div>
  );
};

ToolbarCatalogProofing.defaultProps = {
  totalAssets: 0,
  openedTree: 'collections',
  assets: [],
};

ToolbarCatalogProofing.propTypes = {
  totalAssets: PropTypes.number,
  downloadListItemsLength: PropTypes.number.isRequired,
  selectedItemsLength: PropTypes.number.isRequired,
  downloadListOpened: PropTypes.bool.isRequired,
  openedTree: PropTypes.string,
  assets: PropTypes.array,
  mainActions: PropTypes.shape({
    changeTree: PropTypes.func.isRequired,
    toggleDownloadList: PropTypes.func.isRequired,
  }).isRequired,
};

const ConnectedToolbarCatalogProofing = connect(
  (state) => ({
    activeCollection: activeCollectionSelector(state),
    assets: state.assets.items,
    downloadListItemsLength: state.downloadList.items?.length || 0,
    downloadListOpened: state.main.downloadListOpened,
    openedTree: state.main.openedTree,
    selectedItemsLength: state.assets.selectedItems?.length || 0,
    totalAssets: state.assets.total,
    location: state.router.location,
  }),
  (dispatch) => ({
    mainActions: bindActionCreators(actions, dispatch),
  }),
)(ToolbarCatalogProofing);

export default (props) => (
  <Provider store={store}>
    <ConnectedToolbarCatalogProofing {...props} />
  </Provider>
);
