import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon';
import localization from '../../shared/strings';

function PlaceholderAssetBusy(props) {
  const { isGoingToTrash, isGoingToDelete, isGoingToRestore, isGoingToMove, assetName } = props;

  return (
    <div className="placeholderMediaFile placeholderMediaFileFullWidth">
      <div className="innerPlaceholderMediaFile">
        <Icon
          name={
            isGoingToMove
              ? 'folderMoving'
              : isGoingToTrash
              ? 'trash'
              : isGoingToDelete
              ? 'deleteFromTrash'
              : 'restoreFromTrash'
          }
        />
        <div className="text">
          {isGoingToTrash && localization.CATALOG_ITEM.busyStatus.isGoingToTrash}
          {isGoingToDelete && localization.CATALOG_ITEM.busyStatus.isGoingToDelete}
          {isGoingToRestore && localization.CATALOG_ITEM.busyStatus.isGoingToRestore}
          {isGoingToMove && localization.CATALOG_ITEM.busyStatus.isGoingToMove}
        </div>
        <div className="fileName">{assetName}</div>
      </div>
    </div>
  );
}

PlaceholderAssetBusy.propTypes = {
  isGoingToTrash: PropTypes.bool.isRequired,
  isGoingToDelete: PropTypes.bool.isRequired,
  isGoingToRestore: PropTypes.bool.isRequired,
  isGoingToMove: PropTypes.bool.isRequired,
  assetName: PropTypes.string.isRequired,
};

export default memo(PlaceholderAssetBusy);
