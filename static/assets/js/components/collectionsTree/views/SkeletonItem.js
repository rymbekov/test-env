import React from 'react';
import Skeleton from 'react-loading-skeleton';
import Icon from '../../Icon';

export default function SkeletonItem({
  itemClassName, lvl, picsioConfig, ...props
}) {
  return (
    <li>
      <span className={itemClassName} style={{ paddingLeft: 36 + (lvl + 1) * 15 }}>
        <span className="iconHolder">
          {(() => {
            if (picsioConfig.isMainApp()) {
              if (!props.node.favorites && !props.node.website) return <Icon name="folder" />;
              if (props.node.favorites && !props.node.website) return <Icon name="favorite" />;
              if (props.node.website || props.node.websiteId) return <Icon name="folderPublic" />;
            }
          })()}
        </span>
        <span className="collectionTextValue">
          <Skeleton width={150} height={16} />
        </span>
      </span>
    </li>
  );
}
