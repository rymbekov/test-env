import React from 'react';
import {
  bool, array, string, object, func, oneOfType,
} from 'prop-types';
import cn from 'classnames';
import localization from '../../../../shared/strings';
import Icon from '../../../Icon';

function Group({
  group, primaryAssetId, selectedAssets, unlink, unlinkFrom, onClickHandler,
}) {
  return (
    <div className="linkedAssetsGroup">
      <div className="linkedAsset is-selected">
        <i className="linkedAsset-status" />
        <div className="linkedAsset-name">{group.name}</div>
        {unlinkFrom && group.linkedAssets.length > 0 && (
          <span
            className="btnRemove"
            onClick={() => unlinkFrom(primaryAssetId)}
            title={localization.LinkedAssets.titleUnlinkFrom}
          >
            <Icon name="close" />
          </span>
        )}
      </div>
      {group.linkedAssets.map((asset) => {
        const linkedAsset = asset.pair.find((pairItem) => {
          if (pairItem._id !== primaryAssetId) {
            return pairItem;
          }
        });

        return (
          <div
            key={asset._id}
            className={cn('linkedAsset', { 'is-selected': selectedAssets.includes(linkedAsset._id) })}
          >
            <i className="linkedAsset-status" />
            <div className="linkedAsset-name" onClick={() => onClickHandler(linkedAsset._id)}>
              {linkedAsset.name}
            </div>
            {unlink && (
              <span
                className="btnRemove"
                onClick={() => unlink([primaryAssetId, linkedAsset._id])}
                title={localization.LinkedAssets.titleUnlink}
              >
                <Icon name="close" />
              </span>
            )}
          </div>
        );
      })}
      {group.linkedAssets.length === 0 ? (
        <div className="linkedAsset-placeholder">{localization.LinkedAssets.textNoLinkedAssets}</div>
      ) : null}
    </div>
  );
}

Group.propTypes = {
  group: object,
  primaryAssetId: string,
  selectedAssets: array,
  unlink: oneOfType([func, bool]),
  unlinkFrom: oneOfType([func, bool]),
  onClickHandler: func,
};

export default Group;
