import React from 'react';
import { shape, number, string, func, bool, oneOfType } from 'prop-types';
import cn from 'classnames';
import * as utils from '../../../shared/utils';
import Tooltip from '../../Tooltip';

const mentionPattern = /\B@[a-z0-9_-]+/gi;

class Marker extends React.PureComponent {
  render() {
    const {
      marker,
      rotation = 0,
      flipX = 1,
      flipY = 1,
      onRemove,
      onMouseDown,
      onMouseDownResize,
      onAreaMouseDown,
      showTextContent = true
    } = this.props;

    const __html =
      marker.text &&
      marker.text.replace(mentionPattern, (mentionString) => {
        const mentionID = mentionString.substring(1);
        const mention = marker.mentions
          ? marker.mentions.find((mention) => mention._id === mentionID)
          : null;
        if (mention) {
          return `<span class="itemHistoryList__main__text__mentionedUser">@${mention.displayName}</span>`;
        }
        return mentionString;
      });

    const point = handleRotation(marker.x, marker.y, flipX, flipY, rotation);

    let point2;
    if (marker.x2 !== undefined && marker.y2 !== undefined) {
      point2 = handleRotation(marker.x2, marker.y2, flipX, flipY, rotation);
    }

    return (
      <div className={cn({ active: point2, tmpMarker: onRemove })}>
        <div
          className={cn('poi', { draggable: onAreaMouseDown })}
          onMouseDown={onAreaMouseDown}
          style={{
            left: `${
              (point2 && point2.offsetX < point.offsetX ? point2.offsetX : point.offsetX) * 100
            }%`,
            top: `${
              (point2 && point2.offsetY < point.offsetY ? point2.offsetY : point.offsetY) * 100
            }%`,
            right: point2
              ? `${
                  (point2.offsetX > point.offsetX ? 1 - point2.offsetX : 1 - point.offsetX) * 100
                }%`
              : 'auto',
            bottom: point2
              ? `${
                  (point2.offsetY > point.offsetY ? 1 - point2.offsetY : 1 - point.offsetY) * 100
                }%`
              : 'auto'
          }}
        >
          {onMouseDownResize && <div className="poiResizer" onMouseDown={onMouseDownResize} />}
        </div>
        <div
          className="itemHistoryMarker"
          style={{
            left: `${point.offsetX * 100}%`,
            top: `${point.offsetY * 100}%`
          }}
        >
          <div className="circleHistoryMarker" onMouseDown={onMouseDown}>
            {marker.number}
          </div>

          {showTextContent && (marker.userName || marker.text) && (
            <div
              className="commentHistoryMarker"
              style={{
                top: point.offsetY < 0.5 ? '50%' : 'auto',
                bottom: point.offsetY >= 0.5 ? '50%' : 'auto',
                left: point.offsetX < 0.5 ? '50%' : 'auto',
                right: point.offsetX >= 0.5 ? '50%' : 'auto'
              }}
            >
              <div className="authorHistoryMarker">{marker.userName}</div>
              <div
                className="textHistoryMarker"
                dangerouslySetInnerHTML={{ __html: utils.sanitizeXSS(__html) }}
              />
            </div>
          )}
          {onRemove && (
            <Tooltip content="Remove marker" placement="top">
              <i className="removeHistoryMarker" onClick={onRemove}>
                +
              </i>
            </Tooltip>
          )}
        </div>
      </div>
    );
  }
}

Marker.propTypes = {
  marker: shape({
    number: oneOfType([number, string]),
    x: number,
    y: number,
    x2: number,
    y2: number,
    userName: string,
    text: string
  }).isRequired,
  showTextContent: bool,
  rotation: number,
  flipX: number,
  flipY: number,
  onRemove: func,
  onMouseDown: func,
  onMouseDownResize: func,
  onAreaMouseDown: func
};

export default Marker;

function handleRotation(x, y, flipX, flipY, rotation) {
  let offsetX = x;
  let offsetY = y;

  if (rotation === 90) {
    offsetX = 1 - y;
    offsetY = x;
  }
  if (rotation === 180) {
    offsetX = 1 - x;
    offsetY = 1 - y;
  }
  if (rotation === 270) {
    offsetX = y;
    offsetY = 1 - x;
  }
  /* handle flip */
  if (flipX === -1) offsetX = 1 - offsetX;
  if (flipY === -1) offsetY = 1 - offsetY;

  return { offsetX, offsetY };
}
