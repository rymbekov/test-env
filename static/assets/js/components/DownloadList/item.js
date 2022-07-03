import React from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import * as utils from '../../shared/utils';
import localization from '../../shared/strings';
import Icon from '../Icon';
import Tooltip from '../Tooltip';

export default class DownloadListItem extends React.Component {
  handleRemove = () => {
    const { data, onRemove } = this.props;

    onRemove(data.cid);
  };

  render() {
    const { props } = this;

    if (props.data.isSkeleton) {
      return <div className="downloadListItem isDownloading">Preparing</div>;
    }

    const itemContent = (
      <>
        <div className="downloadListItemCell downloadListItemName">
          {props.data.isRemoving ? (
            <span className="downloadListItemBtnAction">
              <Icon name="ok" />
            </span>
          ) : (
            <Tooltip content={localization.DOWNLOAD_PANEL.textCancel} placement="top">
              <span
                className="downloadListItemBtnAction"
                onClick={this.handleRemove}
              >
                <Icon name="close" />
              </span>
            </Tooltip>
          )}
          <Icon name="addFileImport" />
          <span className="downloadListItemCurrentName">{props.data.name} </span>
          {(props.data.status || props.data.isRemoving) && (
            <span className="downloadListItemStatus">
              ({props.data.isRemoving ? localization.DOWNLOAD_PANEL.textDownloaded : props.data.status})
            </span>
          )}
        </div>
        {props.data.error && (
          <span className="downloadListItemButton" onClick={() => props.onRetry(props.data.cid)}>
            <Icon name="retry" />
            <span>{localization.DOWNLOAD_PANEL.textRetry}</span>
          </span>
        )}
        <div className="downloadListItemCell downloadListItemSize">
          {props.data.fileSize ? utils.bytesToSize(props.data.fileSize) : '? KB'}
        </div>
      </>
    );

    return (
      <div
        className={cn('downloadListItem', {
          error: props.data.error,
          isDownloading: !props.data.fileSize,
          isInProgress: props.data.progress > 0,
        })}
      >
        {itemContent}
        {!!props.data.progress && (
          <div className="downloadListItemProgress" style={{ width: `${props.data.progress * 100}%` }}>
            <div className="downloadListItemProgressBody" style={{ width: `${(1 / props.data.progress) * 100}%` }}>
              {itemContent}
            </div>
          </div>
        )}
      </div>
    );
  }
}

DownloadListItem.propTypes = {
  data: PropTypes.object,
  onRemove: PropTypes.func,
  onRetry: PropTypes.func,
};
