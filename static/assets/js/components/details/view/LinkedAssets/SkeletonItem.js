import React from 'react';
import Skeleton from 'react-loading-skeleton';
import WithSkeletonTheme from '../../../WithSkeletonTheme';

export default function SkeletonItem() {
  return (
    <div className="linkedAssetsGroup">
      <WithSkeletonTheme>
        <div className="linkedAsset is-selected">
          <i className="linkedAsset-status" />
          <div className="linkedAsset-name">
            <Skeleton width={60} />
          </div>
        </div>
        <div className="linkedAsset-placeholder">
          <Skeleton width={120} />
        </div>
      </WithSkeletonTheme>
    </div>
  );
}
