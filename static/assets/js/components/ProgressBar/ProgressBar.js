import React from 'react';
import cn from 'classnames';

export default function ProgressBar({ percent = 0, text = 'Loading...' }) {
  return (
    <div className="picsioProgressBar">
      <div className="holder">
        <div className="text">{text}</div>
        <div className="bar">
          <div className={cn('percent', { pending: !percent })} style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
}
