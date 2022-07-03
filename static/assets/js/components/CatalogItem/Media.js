import React, { memo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import Number from './Number';
import { watermarkPositions } from '../teammates/configs/watermarkPositions';

const Media = (props) => {
  const {
    description,
    fileExtension,
    handleClickImage,
    handleImgLoad,
    handleLoadImageError,
    imageMediaMetadata,
    isListViewMode,
    isSelected,
    isTransparentImageLoaded,
    makeTransformForImage,
    mouseOver,
    name,
    number,
    thumbnailLoaded,
    url,
    urlSmallThumb,
    userOrientation,
    videoThumbnail,
    width,
    watermark,
  } = props;
  const image = useRef(null);
  const watermarkContainer = useRef(null);
  const mediaContainer = useRef(null);
  const imageContainer = useRef(null);

  useEffect(() => {
    if (watermarkContainer && image && mediaContainer) {
      watermarkContainer.current.style.left = `${(mediaContainer.current.clientWidth - image.current.clientWidth) / 2}px`;
      watermarkContainer.current.style.width = `${image.current.clientWidth}px`;
      if (
        (userOrientation.rotation && userOrientation.rotation === 90)
        || userOrientation.rotation === 270
      ) {
        watermarkContainer.current.style.height = '100%';
      } else {
        watermarkContainer.current.style.height = `${image.current.clientHeight}px`;
      }
    }
    if (watermark && watermark.type === 'text') {
      if (watermark.text?.length > 2) {
        watermarkContainer.current.style.fontSize = `${(watermark && watermark.size) * (image.current.clientWidth / 55) / (watermark && watermark.text?.length)}px`;
      } else {
        watermarkContainer.current.style.fontSize = `${(watermark && watermark.size) * (image.current.clientWidth / 55) / (2)}px`;
      }
    } else if (watermark && watermark.type === 'image') {
      watermarkContainer.current.children[0].style.width = `${image.current.clientWidth * (watermark && watermark.size) / 100}px`;
      watermarkContainer.current.children[0].style.height = `${image.current.clientHeight * (watermark && watermark.size) / 100}px`;
    }
  });
  return (
    <div className={cn('catalogItem__media', { thumbnailLoaded })} onClick={handleClickImage}>
      <div
        className={cn('catalogItem__media-inner', {
          chessBg:
            (!isListViewMode && !isSelected && isTransparentImageLoaded)
            || (isListViewMode && isTransparentImageLoaded),
        })}
        ref={mediaContainer}
      >
        <div ref={watermarkContainer} style={{ position: 'absolute', height: '100%' }}>
          <If condition={watermark && watermark.type === 'text'}>
            <div
              className="watermarkText"
              style={{
                ...watermarkPositions[watermark && watermark.position], zIndex: '3', opacity: watermark.opacity / 100,
              }}
            >
              {watermark.text}
            </div>
          </If>
          <If condition={watermark && watermark.type === 'image'}>
            <div style={{
              ...watermarkPositions[watermark && watermark.position],
              zIndex: '3',
              opacity: watermark.opacity / 100,
            }}
            >
              <img alt="watermark" style={{ width: '100%', height: '100%', objectFit: 'contain' }} src={watermark?.imageUrl || URL.createObjectURL(watermark?.file)} />
            </div>
          </If>
        </div>
        <span
          className="catalogItem__media-smallPreview"
          style={{ ...makeTransformForImage(userOrientation, imageMediaMetadata), maxHeight: '100%' }}
          ref={imageContainer}
        >
          <img
            src={videoThumbnail && mouseOver ? videoThumbnail : url}
            alt={description}
            ref={image}
            style={{
              maxHeight:
                (userOrientation.rotation && userOrientation.rotation === 90)
                  || userOrientation.rotation === 270
                  ? '100%'
                  : '',
            }}
            onLoad={handleImgLoad}
            onError={handleLoadImageError}
          />
          <If condition={urlSmallThumb}>
            <img
              src={urlSmallThumb}
              style={{
                transform: `rotate(${userOrientation.rotation ? userOrientation.rotation : 0}deg)`,
              }}
              className="smallThumb"
            />
          </If>
        </span>
        <If condition={!thumbnailLoaded}>
          <Number
            number={number}
            width={width}
            name={name}
            fileExtension={fileExtension}
            isListViewMode={isListViewMode}
          />
        </If>
      </div>
    </div>
  );
};

Media.defaultProps = {
  imageMediaMetadata: null,
  fileExtension: null,
  url: null,
  urlSmallThumb: null,
  videoThumbnail: null,
  watermark: null,
  description: '',
};

Media.propTypes = {
  description: PropTypes.string,
  fileExtension: PropTypes.string,
  handleClickImage: PropTypes.func.isRequired,
  handleImgLoad: PropTypes.func.isRequired,
  handleLoadImageError: PropTypes.func.isRequired,
  imageMediaMetadata: PropTypes.shape({
    rotation: PropTypes.number,
    height: PropTypes.number,
    width: PropTypes.number,
  }),
  isListViewMode: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired,
  isTransparentImageLoaded: PropTypes.bool.isRequired,
  makeTransformForImage: PropTypes.func.isRequired,
  mouseOver: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  number: PropTypes.number.isRequired,
  thumbnailLoaded: PropTypes.bool.isRequired,
  url: PropTypes.string,
  urlSmallThumb: PropTypes.string,
  userOrientation: PropTypes.shape({
    rotation: PropTypes.number,
    flipX: PropTypes.bool,
    flipY: PropTypes.bool,
  }).isRequired,
  videoThumbnail: PropTypes.string,
  width: PropTypes.number.isRequired,
  watermark: PropTypes.shape({
    _id: PropTypes.string,
    isDefault: PropTypes.bool,
    name: PropTypes.string,
    opacity: PropTypes.number,
    position: PropTypes.string,
    size: PropTypes.number,
    text: PropTypes.string,
    type: PropTypes.oneOf(['text', 'image']),
    userId: PropTypes.string,
    imageUrl: PropTypes.string,
  }),
};

export default memo(Media);
