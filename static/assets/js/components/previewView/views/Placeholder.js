import React from 'react';
import {
  object, oneOfType, string, func, bool,
} from 'prop-types';
import dayjs from 'dayjs';
import picsioConfig from '../../../../../../config';
import ToolbarPreviewLeft from '../../toolbars/ToolbarPreviewLeft';
import Icon from '../../Icon';
import * as utils from '../../../shared/utils';

const CONFIG_ERRORS = {
  204: {
    icon: 'broken',
    text: "file is empty and can't be used",
    iconColor: '#474747',
  },
  205: {
    icon: 'notSupportedVideo',
    text: 'This video format is not supported yet',
    iconColor: '#474747',
    selectable: true,
  },
  401: {
    icon: 'noAccessCatalogItem',
    text: 'insufficient rights <br />to access the preview',
    iconColor: '#474747',
  },
  404: {
    icon: 'notFoundCatalogItem',
    text: 'file not found <br />in Google Drive',
    iconColor: '#474747',
  },
  noPermissions: {
    icon: 'error',
    text: 'No permissions to access',
    iconColor: '#474747',
  },
  // this code is not returned by google drive but we can use it to handle situation when file is trashed, but exists in our database
  456: {
    icon: 'notFoundCatalogItem',
    text: 'file is trashed <br />in Google Drive',
    iconColor: '#474747',
  },
  500: {
    icon: 'notGeneratedCatalogItem',
    text: 'preview could not be <br />generated',
    iconColor: '#474747',
  },

  thumbnailing: {
    icon: 'generationThumbnailCatalogItem',
    text: 'generating thumbnail<br />please check back later',
    iconColor: '#474747',
  },

  transcoding: {
    icon: 'generationThumbnailCatalogItem',
    text: 'converting video<br />please check back later',
    iconColor: '#474747',
  },

  locked: {
    icon: 'lockedCatalogItem',
    text: 'picture <br />is locked',
    iconColor: '#474747',
  },
};

const CONFIG_FORMATS = {
  ai: {
    icon: 'aiCatalogItem',
    text: 'AI',
  },
  eps: {
    icon: 'epsCatalogItem',
    text: 'EPS',
  },
  mp3: {
    icon: 'mp3CatalogItem',
    text: 'MP3',
  },
  wav: {
    icon: 'wavCatalogItem',
    text: 'WAV',
  },
  aiff: {
    icon: 'mp3CatalogItem',
    text: 'AIFF',
  },
  sketch: {
    icon: 'sketchCatalogItem',
    text: 'generating <br />thumbnail',
    iconColor: '#FFCC00',
  },
  obj: {
    icon: 'file3d',
    text: 'OBJ',
  },
};

const DEFAULT_PLACEHOLDER = {
  icon: 'noPreviewCatalogItem',
  text: 'no preview <br />available',
  iconColor: '#474747',
};

class Placeholder extends React.Component {
  render() {
    const { props } = this;
    const extension = props.model.fileExtension;
    const fileName = props.model.name;
    const code = props.thumbnailingError && props.thumbnailingError.code ? props.thumbnailingError.code : null;
    let config = null;

    if (!props.model.hasAccess) {
      config = CONFIG_ERRORS.noPermissions;
    } else if (props.isSkipped) {
      config = DEFAULT_PLACEHOLDER;
    } else if (code !== null && code !== undefined) {
      config = CONFIG_ERRORS[code] || DEFAULT_PLACEHOLDER;
      // } else if (props.isThumbnailing || Date.create(props.model.updatedAt).hoursAgo() === 0) {
    } else if (props.isTranscoding) {
      config = CONFIG_ERRORS.transcoding;
    } else if (props.isThumbnailing || dayjs(props.model.updatedAt).diff(dayjs(), 'hour') === 0) {
      config = CONFIG_ERRORS.thumbnailing;
    } else {
      config = DEFAULT_PLACEHOLDER;
    }

    // config = Object.clone(config);
    config = { ...config };

    const formatConfig = CONFIG_FORMATS[extension];
    if (formatConfig && !props.isSkipped) {
      config.icon = formatConfig.icon || config.icon;
      config.iconColor = formatConfig.iconColor || config.iconColor;
      config.text = formatConfig.text || config.text;
    }

    const { iconColor } = config;
    const text = props.text || config.text;
    const icon = props.icon || config.icon;
    /** @type {boolean} */
    const showButtons = !props.model.trashed && props.model.hasAccess;
    const isRestricted = utils.isAssetRestricted(props.model.restrictSettings);

    return (
      <div className="placeholderMediaFile" draggable>
        {picsioConfig.isMainApp() && (
          <ToolbarPreviewLeft
            addRevision={showButtons && props.addRevision}
            openEditor={showButtons && props.openEditor}
            download={showButtons && props.handleDownload}
            moveToTrash={showButtons && props.moveToTrash}
            permissions={props.model.permissions}
            isRestricted={isRestricted}
            isRemoveForever={props.isRemoveForever}
          />
        )}
        <div className="innerPlaceholderMediaFile">
          <Icon name={icon} style={{ color: iconColor }} />
          <div className="text" dangerouslySetInnerHTML={{ __html: utils.sanitizeXSS(text) }} />
          <div className="fileName">{fileName}</div>
          {(code === 404 || code === 456) && (
            <span className="picsioDefBtn" onClick={props.deleteNotFoundFile}>
              Delete
            </span>
          )}
          {code === 204 && (
            <span className="picsioDefBtn" onClick={props.moveToTrash}>
              Delete
            </span>
          )}
          {!props.model.hasAccess && (
            <span className="picsioDefBtn" onClick={props.removeFromLightboard}>
              Remove from lightboard
            </span>
          )}
        </div>
      </div>
    );
  }
}

Placeholder.propTypes = {
  model: object.isRequired,
  isThumbnailing: bool,
  isTranscoding: bool,
  openEditor: func,
  addRevision: oneOfType([func, bool]),
  handleDownload: oneOfType([func, bool]),
  moveToTrash: oneOfType([func, bool]),
  thumbnailingError: oneOfType([string, object]),
  deleteNotFoundFile: func,
  text: string,
  icon: string,
};

export default Placeholder;
