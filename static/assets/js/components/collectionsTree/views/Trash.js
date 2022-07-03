import React, { memo } from 'react';
import cn from 'classnames';

const Trash = (props) => (
  <li>
    <div className={cn('treeList-title', { act: props.isActive })} onClick={props.onClick}>
      <div className="treeList-title-text">Trashed assets</div>
    </div>
  </li>
);

export default memo(Trash);
