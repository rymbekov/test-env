import React from 'react';
import Skeleton from 'react-loading-skeleton';
import WithSkeletonTheme from '../../WithSkeletonTheme';

export default function SkeletonItem() {
  return (
    <WithSkeletonTheme>
      <div className="pageContainer">
        <div className="pageItem" style={{ maxWidth: '400px' }}>
          <div className="pageItemTitle">
            <Skeleton width={140} />
          </div>
          <div className="pageWebsites__inputsBlock__content">
            <div className="UIInput">
              <div className="UIInput__label">
                <Skeleton width={180} />
              </div>
              <div className="UIInput__input">
                <Skeleton height={30} />
              </div>
            </div>
            <div className="UIInput">
              <div className="UIInput__label">
                <Skeleton width={190} />
              </div>
              <div className="UIInput__input">
                <Skeleton height={30} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </WithSkeletonTheme>
  );
}
