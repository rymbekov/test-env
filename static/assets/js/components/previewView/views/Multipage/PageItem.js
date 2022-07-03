import React, { useEffect } from 'react'; // eslint-disable-line
import cn from 'classnames';
import Marker from '../Marker';
/**
 * List item
 * @param {Object} params
 * @param {boolean} params.isActive
 * @param {string} params.url
 * @param {string?} params.name
 * @param {number} params.number
 * @param {number} params.total
 * @param {Object[]} params.markers
 * @param {number[]} params.imagesLoaded
 * @param {Function} params.onClick
 * @param {Function} params.onImageLoaded
 * @param {Function} params.onImageLoadStart
 * @returns {JSX}
 */
export default function Item({
  isActive,
  url,
  name,
  number,
  total,
  markers,
  imagesLoaded,
  onClick,
  onImageLoaded,
  onImageLoadStart,
}) {
  const imageLoaded = imagesLoaded.includes(number);
  useEffect(() => {
    onImageLoadStart(number);
  }, [url]);

  return (
    <div className={cn('listPage', { listPageActive: isActive })} onClick={() => onClick(number)}>
      {markers.length > 0
				&& markers.map((marker) => <Marker key={marker.number} showTextContent={false} marker={marker} />)}
      <div className="listPageImage">
        {!imageLoaded && <div className="tmp" />}
        <img src={url} onLoad={() => onImageLoaded(number)} style={{ opacity: imageLoaded ? 1 : 0 }} />
      </div>
      <div className="listPageName">
        <div className="listPageNameText">
          {number}. {name || 'unnamed'}
        </div>
        <div className="listPageNameNum">
          {number} {isActive && <span> / {total}</span>}
        </div>
      </div>
    </div>
  );
}
