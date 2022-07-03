import React from 'react';
import useHover from '@react-hook/hover';
import cn from 'classnames';
import Avatar from '../Avatar';

/**
 * Creator
 * @param {Object} props
 * @param {string} props.text
 * @param {number} props.size
 * @param {Boolean} props.isActive
 * @param {Function} props.onCreate
 * @returns {JSX}
 */
export default function Creator({
  text, size = 50, onCreate, isActive,
}) {
  const target = React.useRef(null);
  const isHovering = useHover(target, { enterDelay: 0, leaveDelay: 0 });

  return (
    <div ref={target} className="creator" onClick={onCreate}>
      <Avatar
        size={size}
        className={cn({
          isActive,
          isHover: isHovering,
        })}
      />
      <div className="creatorText">
        <span className="picsioLink">{text}</span>
      </div>
    </div>
  );
}
