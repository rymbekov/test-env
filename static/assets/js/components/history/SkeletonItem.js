import React from 'react';
import Skeleton from 'react-loading-skeleton';
import WithSkeletonTheme from '../WithSkeletonTheme';

export default function SkeletonItem() {
  return (
    <WithSkeletonTheme>
      <div className="itemHistoryList">
        <div className="itemHistoryList__main">
          <div className="author">
            <div className="authorAvatar">
              <Skeleton circle height={35} width={35} />
            </div>
            <div className="authorText">
              <div className="authorName">
                <Skeleton />
              </div>
              <div className="authorAdditional">
                <Skeleton width={80} />
              </div>
            </div>
          </div>
        </div>
        <div className="itemHistoryList__main__text">
          <Skeleton count={1} />
        </div>
      </div>
    </WithSkeletonTheme>
  );
}
