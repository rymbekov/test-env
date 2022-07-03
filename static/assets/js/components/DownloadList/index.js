import React from 'react';
import cn from 'classnames';
import { Provider, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ErrorBoundary from '../ErrorBoundary';
import Logger from '../../services/Logger';
import * as utils from '../../shared/utils';
import localization from '../../shared/strings';
import Icon from '../Icon';
import store from '../../store';
import { addToDownloadList, removeFromDownloadList } from '../../store/actions/downloadList';
import { closeDownloadList } from '../../store/actions/main';
import DownloadListItem from './item';
import Button from '../toolbars/Button';
import { showDialog } from '../dialog';

class DownloadList extends React.Component {
  state = {
    // use for memoization
    totalSize: 0,
    totalCount: 0,
    itemsCount: 0,

    totalFileSize: 0,
    isItemsHasProgress: false,
  };

  static getDerivedStateFromProps(props, state) {
    if (props.storeDownloadList.totalCount !== state.totalCount) {
      return {
        totalCount: props.storeDownloadList.totalCount,
        isItemsHasProgress: DownloadList.checkItemsHasProgress(props),
      };
    }

    if (
      props.storeDownloadList.totalSize !== state.totalSize
      || props.storeDownloadList.items.length !== state.itemsCount
    ) {
      return {
        totalSize: props.storeDownloadList.totalSize,
        itemsCount: props.storeDownloadList.items.length,
        totalFileSize: DownloadList.countTotalSize(props),
      };
    }

    return null;
  }

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      const progress = this.getProgress();
      window.dispatchEvent(
        new CustomEvent('import:downloading:progress', {
          detail: { percantage: progress, ElParent: '#button-downloadList' },
        }),
      );
      window.dispatchEvent(
        new CustomEvent('import:downloading:progress', {
          detail: { percantage: progress, ElParent: '#button-downloadList-selected' },
        }),
      );
      window.dispatchEvent(
        new CustomEvent('import:downloading:progress', {
          detail: { percantage: progress, ElParent: '#button-previewDownloadList' },
        }),
      );
    }
  }

  handleRemoveAsset = (cid) => this.props.actions.removeFromDownloadList(cid);

  handleRetryAsset = (cid) => {
    const { actions, storeDownloadList } = this.props;

    const item = storeDownloadList.items.find((n) => n.cid === cid);
    delete item.error;

    actions.removeFromDownloadList(cid);
    actions.addToDownloadList([item]);
  };

  handleRemoveAssets = () => {
    const { actions, storeDownloadList } = this.props;
    Logger.log('UI', 'ConfirmRemoveAssetFromDownload');
    showDialog({
      title: localization.DOWNLOAD_PANEL.titleDialogConfirm,
      text: localization.DOWNLOAD_PANEL.textDialogConfirm,
      onOk: () => {
        actions.removeFromDownloadList(storeDownloadList.items.map((n) => n.cid));
        Logger.log('UI', 'ConfirmRemoveAssetFromDownloadSure');
      },
      onCancel: () => Logger.log('UI', 'ConfirmRemoveAssetFromDownloadCancel'),
      textBtnOk: localization.DOWNLOAD_PANEL.btnOkDialogConfirm,
    });
  };

  handleCloseClick = () => {
    this.props.mainActions.closeDownloadList();
    Logger.log('User', 'DownloadPanelClose');
  };

  static checkItemsHasProgress = (props) => props.storeDownloadList.items.every((item) => item.progress !== undefined);

  getProgress = () => {
    const { items, totalCount } = this.props.storeDownloadList;

    if (totalCount === 0) return 0;

    let progress = 0;
    let progressSumm = 0;
    if (this.state.isItemsHasProgress) {
      progressSumm = items.reduce((acc, item) => Number(acc) + Number(item.progress), 0);
      progress = ((progressSumm + totalCount - items.length) / totalCount) * 100;
    } else {
      progress = 100 - (100 / totalCount) * items.length;
    }

    return progress;
  };

  static countTotalSize = (props) => {
    const total = props.storeDownloadList.items.reduce((acc, item) => {
      if (item.fileSize) {
        return Number(acc) + Number(item.fileSize);
      }
    }, 0);

    return total;
  };

  render() {
    const { storeDownloadList, downloadListOpened } = this.props;

    return (
      <ErrorBoundary>
        <div className={cn('wrapperDownloadList', { showDownloadPanel: downloadListOpened })}>
          <div className="downloadPanel">
            <div className="downloadPanelInner">
              <div className="downloadPanelTop">
                {localization.DOWNLOAD_PANEL.titleDownloading}
                <Button
                  id="button-minimizeDownloadList"
                  icon="minimize"
                  additionalClass="importHideView"
                  onClick={this.handleCloseClick}
                  tooltip={localization.GLOBAL.tooltipMinimize}
                />
              </div>
              <div className="downloadPanelMain">
                {storeDownloadList.items.length ? (
                  <>
                    <div className={cn('downloadPanelAdditional', { hideBtn: storeDownloadList.items.length === 0 })}>
                      <span className="btnClearDownloadQueue" onClick={this.handleRemoveAssets}>
                        <Icon name="close" />
                      </span>
                      <span>
                        {storeDownloadList.items.length} {localization.DOWNLOAD_PANEL.textDownloadingProgress}{' '}
                        {Math.round(this.getProgress())}%
                      </span>
                    </div>
                    <div className="downloadPanelList">
                      {storeDownloadList.items.map((item) => (
                        <DownloadListItem
                          key={item.cid}
                          data={item}
                          onRemove={this.handleRemoveAsset}
                          onRetry={this.handleRetryAsset}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="downloadPanelPlaceholder">{localization.DOWNLOAD_PANEL.textDownloadingComplete}</div>
                )}
                {storeDownloadList.items.length > 0 && (
                  <div className={cn('downloadPanelButtons', { addRetryButton: false })}>
                    <div className="downloadPanelTotalSize">
                      {this.state.totalFileSize > 0
                        ? localization.DOWNLOAD_PANEL.textTotal + utils.bytesToSize(this.state.totalFileSize)
                        : `${storeDownloadList.items.length} ${localization.DOWNLOAD_PANEL.textFilesLeft}`}
                    </div>
                    <div className="picsioDefBtn btnRemove" onClick={this.handleRemoveAssets}>
                      {localization.DOWNLOAD_PANEL.btnRemoveAll}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }
}

const ConnectedDownloadList = connect(
  (store) => ({
    storeDownloadList: store.downloadList,
    downloadListOpened: store.main.downloadListOpened,
  }),
  (dispatch) => ({
    actions: bindActionCreators({ addToDownloadList, removeFromDownloadList }, dispatch),
    mainActions: bindActionCreators({ closeDownloadList }, dispatch),
  }),
)(DownloadList);

export default (props) => (
  <Provider store={store}>
    <ConnectedDownloadList {...props} />
  </Provider>
);
