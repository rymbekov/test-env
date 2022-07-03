import React, { useRef, useEffect, useState } from 'react';
import cn from 'classnames';
import Tag from '../../Tag';
import ua from '../../../ua';

/**
 * UsersList
 * @param {Object} props
 * @param {Array} props.users
 * @param {Function} props.remove
 * @param {Boolean} props.isOpenClose
 * @param {String} props.className
 * @returns {JSX}
 */
export default function UsersList({
  users, remove, isOpenClose, className,
}) {
  const openCloseContent = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isOpen, setOpenClose] = useState(false);

  const isMobile = ua.browser.isNotDesktop();
  const openCloseHeight = isMobile ? 88 : 48;

  useEffect(() => {
    if (openCloseContent.current) {
      setDimensions({
        width: openCloseContent.current.offsetWidth,
        height: openCloseContent.current.offsetHeight,
      });
    }
  }, [users]);

  return (
    <div className={cn('openClose', { [className]: className })}>
      <div
        className="openCloseContent"
        style={
          isOpenClose && (isOpen ? null : dimensions.height > openCloseHeight ? { height: openCloseHeight } : null)
        }
      >
        <div className="usersList" ref={openCloseContent}>
          {users.map((user) => (
            <Tag
              type="user"
              key={user._id}
              text={user.displayName}
              avatar={user.avatar}
              onClose={remove ? () => remove(user._id) : null}
            />
          ))}
        </div>
      </div>
      {isOpenClose && dimensions.height > openCloseHeight && (
        <div className="openCloseOpener" onClick={() => setOpenClose(!isOpen)}>
          {isOpen ? 'Show less' : 'Show all'}
        </div>
      )}
    </div>
  );
}
