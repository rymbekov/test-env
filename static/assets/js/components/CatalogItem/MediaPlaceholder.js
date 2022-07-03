import React, { memo } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import Icon from '../Icon';
import * as utils from '../../shared/utils';

const MediaPlaceholder = (props) => {
  const { thumbnailPlaceholder, onClickImage } = props;

  return (
    <div
      className={cn('placeholderMediaFile', {
        placeholderMediaFileFullWidth: thumbnailPlaceholder.fullWidth,
      })}
      onClick={
        thumbnailPlaceholder.onClick && !thumbnailPlaceholder.selectable ? null : onClickImage
      }
    >
      <div className="innerPlaceholderMediaFile">
        <Icon
          name={thumbnailPlaceholder.iconClass}
          style={{ color: thumbnailPlaceholder.iconColor }}
        />
        <div
          className="text"
          dangerouslySetInnerHTML={{ __html: utils.sanitizeXSS(thumbnailPlaceholder.text) }}
        />
        <div className="fileName">{thumbnailPlaceholder.fileName}</div>
        {thumbnailPlaceholder.btn && (
          <div className="btns">
            <span className="picsioDefBtn" onClick={thumbnailPlaceholder.onClick}>
              {thumbnailPlaceholder.btn}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

MediaPlaceholder.propTypes = {
  onClickImage: PropTypes.func.isRequired,
  thumbnailPlaceholder: PropTypes.shape({
    fullWidth: PropTypes.number,
    onClick: PropTypes.func,
    selectable: PropTypes.bool,
    iconClass: PropTypes.string,
    iconColor: PropTypes.string,
    fileName: PropTypes.string,
    text: PropTypes.string,
    btn: PropTypes.string,
  }).isRequired,
};

export default memo(MediaPlaceholder);
