import React, { memo, forwardRef, useState } from 'react';
import cn from 'classnames';
import { FolderIcon } from '@picsio/ui/dist/icons';
import ErrorBoundary from '../ErrorBoundary';
import Avatar from '../Avatar';
import Icon from '../Icon';
import Tooltip from '../Tooltip';

import './style.scss';

const CURSOR_POINTER = { cursor: 'pointer' };
const classnamesList = {
  collection: 'tagCollection',
  lightboard: 'tagLightboard',
  inbox: 'tagCollection',
  keyword: 'tagKeyword',
  user: 'tagUser',
};
/**
 * Tag
 * @param {Object} props
 * @param {string?} props.text
 * @param {string?} props.avatar
 * @param {string?} props.className
 * @param {Function?} props.onClick
 * @param {Function?} props.onClose
 * @param {string?} props.tooltipText
 * @param {string?} props.type
 * @param {bool} props.showCloseOnHover
 * @returns {JSX}
 */
const Tag = forwardRef((props, ref) => {
  const {
    text,
    avatar,
    className,
    onClick,
    onClose,
    tooltipText = null,
    type,
    isCollection,
    isRole,
    showCloseOnHover = false,
  } = props;
  const [isHovering, setHovering] = useState(false);
  if (!text) return null;

  const style = onClick ? CURSOR_POINTER : null;
  const typeClass = classnamesList[type];

  const handleClick = (event) => {
    if (!isRole) {
      event.persist();
      onClick(event);
    }
  };
  return (
    <ErrorBoundary>
      <Choose>
        <When condition={tooltipText}>
          <Tooltip content={tooltipText} placement="top" hideTooltip={!isHovering}>
            <div
              ref={ref}
              className={cn('tag', {
                [className]: Boolean(className),
                [typeClass]: Boolean(typeClass),
              }, { noCursor: isRole })}
              style={!isRole ? style : null}
              onClick={handleClick}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
            >
              <If condition={avatar || type === 'user'}>
                <Avatar src={avatar} username={text} size={16} className="tagAvatar" />
              </If>
              <If condition={text}>
                <span className="tagTitleWrapper">
                  <span className="tagTitle">{text}</span>
                </span>
              </If>
              <Choose>
                <When condition={showCloseOnHover && isHovering && onClose}>
                  <span className="tagRemove" onClick={onClose}>
                    <Icon name="close" />
                  </span>
                </When>
                <When condition={!showCloseOnHover && onClose}>
                  <span className="tagRemove" onClick={onClose}>
                    <Icon name="close" />
                  </span>
                </When>
                <Otherwise>{null}</Otherwise>
              </Choose>
            </div>
          </Tooltip>
        </When>
        <Otherwise>
          {isCollection ? (
            <div
              ref={ref}
              className={cn('roleTag', {
                [className]: Boolean(className),
              })}
              style={style}
              onClick={handleClick}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
            >
              <FolderIcon size="xxl" className="folderIcon" />
              <If condition={text}>
                <span className="tagTitleWrapper">
                  <span className="tagTitle">{text}</span>
                </span>
              </If>
              <Choose>
                <When condition={showCloseOnHover && isHovering && onClose}>
                  <span className="tagRemove" onClick={onClose}>
                    <Icon name="close" />
                  </span>
                </When>
                <When condition={!showCloseOnHover && onClose}>
                  <span className="tagRemove" onClick={onClose}>
                    <Icon name="close" />
                  </span>
                </When>
                <Otherwise>{null}</Otherwise>
              </Choose>
            </div>
          ) : (
            <div
              ref={ref}
              className={cn('tag', {
                [className]: Boolean(className),
                [typeClass]: Boolean(typeClass),
              }, { noCursor: isRole })}
              style={!isRole ? style : null}
              onClick={handleClick}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
            >
              <If condition={avatar || type === 'user'}>
                <Avatar src={avatar} username={text} size={16} className="tagAvatar" />
              </If>
              <If condition={text}>
                <span className="tagTitleWrapper">
                  <span className="tagTitle">{text}</span>
                </span>
              </If>
              <Choose>
                <When condition={showCloseOnHover && isHovering && onClose}>
                  <span className="tagRemove" onClick={onClose}>
                    <Icon name="close" />
                  </span>
                </When>
                <When condition={!showCloseOnHover && onClose}>
                  <span className="tagRemove" onClick={onClose}>
                    <Icon name="close" />
                  </span>
                </When>
                <Otherwise>{null}</Otherwise>
              </Choose>
            </div>
          )}
        </Otherwise>
      </Choose>
    </ErrorBoundary>
  );
});

export default memo(Tag);
