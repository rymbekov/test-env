import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import dayjs from 'dayjs';
import { IconButton } from '@picsio/ui';
import {
  Compare,
  Download,
  Link as LinkIcon,
  Revert,
  EyeOpen,
  EyeClosed,
} from '@picsio/ui/dist/icons';
import picsioConfig from '../../../../../config';
import Logger from '../../services/Logger';
import localization from '../../shared/strings';
import { Author } from '../UserComponent';
import { checkDownloadConsent } from '../../store/helpers/assets';
import Tooltip from '../Tooltip';
import { showDialog } from '../dialog';
import copyTextToClipboard from '../../helpers/copyTextToClipboard';

class Revision extends React.Component {
  copyToClipboard = (e) => {
    e.stopPropagation();
    const { props } = this;
    const { origin, pathname } = window.location;

    /** Copy to clipboard */
    const revisionUrl = `${origin + pathname}#${props.data.id}`;
    const toastText = localization.HISTORY.textCopiedLink;
    copyTextToClipboard(revisionUrl, toastText);
  };

  onClickMain = () => {
    const {
      isActive, data, setActive, isSupportedForDiff,
    } = this.props;
    if (!data.canHaveRevisions) {
      if (data.isInitial) {
        showDialog({
          title: localization.HISTORY.switchDialogTitle,
          text: localization.HISTORY.initialRevisionDialogText,
          textBtnOk: localization.HISTORY.switchDialogOk,
          textBtnCancel: null,
        });
      } else if (!isActive && !data.technical && isSupportedForDiff) {
        setActive(data.id);
      }
      if (!isActive && !data.technical && !isSupportedForDiff) {
        const errorText = this.props.isDownloadable
          ? localization.HISTORY.textCantShowRevisionButDownload
          : localization.HISTORY.textCantShowRevision;
        Logger.log('UI', 'CanNotSwitchRevisionDialog', errorText);
        showDialog({
          title: localization.HISTORY.switchDialogTitleError,
          text: errorText,
          textBtnOk: localization.HISTORY.switchDialogOk,
          textBtnCancel: null,
        });
      }
    }
  };

  onClickDiff = (event) => {
    event.stopPropagation();
    this.props.setActiveDiff();
  };

  onClickEye = (event) => {
    event.stopPropagation();
    this.props.toggleRevisionComments(this.props.data.id);
  };

  download = async (event) => {
    event.stopPropagation();
    try {
      if (!picsioConfig.isMainApp()) {
        await checkDownloadConsent();
      }
    } catch (err) {
      // user click Cancel on Dialog
      return;
    }

    this.props.download(this.props.index);
  };

  onClickRevertRevision = (event) => {
    event.stopPropagation();
    this.props.revertRevision(this.props.data.id);
  };

  render() {
    const {
      data,
      isActive,
      isActiveDiff,
      isSupportedForDiff,
      isDownloadable,
      commentsWithMarkersCount,
      activeMarkersCount,
      showMarkerIcon,
      isApproved,
      lastRevisionNumber,
      isAllowedImageUpload,
      isDiffAllowed,
      isLastRevisionTechnical,
      isVideo,
    } = this.props;
    const date = dayjs(data.modifiedTime).format('lll');
    const isMarkerIconEnabled = isActive && commentsWithMarkersCount === activeMarkersCount;
    const avatarSrc = data.uploader && data.uploader.avatar;

    const theSameAs = data.theSameAs || [];
    const textIsCopyOf = theSameAs.length > 0
      && theSameAs[0] < data.revisionNumber
      && localization.HISTORY.textRevisionIsACopyOf(theSameAs[0]);
    const isLastRevision = data.revisionNumber === lastRevisionNumber && !isLastRevisionTechnical;
    const showRevertRevisionButton = isAllowedImageUpload && !theSameAs.includes(lastRevisionNumber) && !isLastRevision;

    let authorAdditional = null;
    let authorName = null;
    if (data.technical) {
      authorName = data.isInitial
        ? localization.HISTORY.textInitialRevision
        : localization.HISTORY.textMetadataUpdated;
    } else {
      authorName = data.uploader.displayName;
    }

    if (!data.isInitial) {
      authorAdditional = (
        <>
          {date} {isApproved && <span className="approved">Approved</span>}
        </>
      );
    }

    return (
      <div
        id={data.id}
        className={cn('itemHistoryList', {
          typeFile: isActive || isSupportedForDiff,
          act: isActive,
          technical: data.technical,
          highlight: data.id === window.location.hash.substring(1),
          highlightFadeUp: data.highlightNotification,
        })}
        onClick={this.onClickMain}
        role="presentation"
      >
        <div className="itemHistoryList__main">
          <Author
            avatar={!data.technical && avatarSrc}
            name={authorName}
            additional={authorAdditional}
            avatarPicsio={data.technical}
          />
          <If condition={!data.technical}>
            <div className="itemHistoryList__main__text">
              {localization.HISTORY.textRevisionAdded(data.revisionNumber)} {textIsCopyOf}
            </div>
          </If>
        </div>
        <div className="itemHistoryList__footer">
          <div className="itemHistoryList__footer__buttons">
            <If condition={showRevertRevisionButton && !data.technical}>
              <Tooltip content={localization.HISTORY.textRevertRevision} placement="top">
                <IconButton
                  className="btnRevertRevision"
                  onClick={this.onClickRevertRevision}
                  size="md"
                >
                  <Revert />
                </IconButton>
              </Tooltip>
            </If>
            <If condition={!isActive && !data.technical && isSupportedForDiff}>
              <Tooltip
                content={
                  isDiffAllowed
                    ? localization.HISTORY.textSeeDifference
                    : `${localization.HISTORY.textSeeDifference}.<br>${localization.UPGRADE_PLAN.tooltipBasic}`
                }
                placement="top"
              >
                <IconButton
                  className={cn('btnRevisionDiff', { act: isActiveDiff, disabled: !isDiffAllowed })}
                  onClick={isDiffAllowed ? this.onClickDiff : (event) => event.stopPropagation()}
                  size="lg"
                >
                  <Compare />
                </IconButton>
              </Tooltip>
            </If>
            <If condition={showMarkerIcon && commentsWithMarkersCount > 0 && !isVideo}>
              <Tooltip
                content={
                  isMarkerIconEnabled
                    ? localization.HISTORY.textHideAllMarkers
                    : localization.HISTORY.textShowAllMarkers
                }
                placement="top"
              >
                <IconButton
                  className="btnShowMarkers"
                  onClick={this.onClickEye}
                  size="lg"
                >
                  <Choose>
                    <When condition={isMarkerIconEnabled}>
                      <EyeOpen />
                    </When>
                    <Otherwise>
                      <EyeClosed />
                    </Otherwise>
                  </Choose>
                </IconButton>
              </Tooltip>
            </If>
            <If condition={isDownloadable}>
              <Tooltip
                content={localization.HISTORY.textDownloadRevision}
                placement="top"
              >
                <IconButton
                  className="download"
                  onClick={this.download}
                  size="lg"
                >
                  <Download />
                </IconButton>
              </Tooltip>
            </If>
            <If condition={!data.technical}>
              <Tooltip
                content={localization.HISTORY.textCopyLink}
                placement="top"
              >
                <IconButton
                  onClick={this.copyToClipboard}
                  size="lg"
                >
                  <LinkIcon />
                </IconButton>
              </Tooltip>
            </If>
          </div>
        </div>
      </div>
    );
  }
}

Revision.defaultProps = {
  activeMarkersCount: 0,
  commentsWithMarkersCount: 0,
  lastRevisionNumber: undefined,
  data: {},
};
Revision.propTypes = {
  index: PropTypes.number.isRequired,
  activeMarkersCount: PropTypes.number,
  commentsWithMarkersCount: PropTypes.number,
  data: PropTypes.shape({
    id: PropTypes.string,
    highlightNotification: PropTypes.bool,
    keepForever: PropTypes.bool,
    lastModifyingUser: PropTypes.objectOf(PropTypes.any),
    md5Checksum: PropTypes.string,
    mimeType: PropTypes.string,
    modifiedTime: PropTypes.string,
    originalFilename: PropTypes.string,
    published: PropTypes.bool,
    revisionNumber: PropTypes.number,
    size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    theSameAs: PropTypes.arrayOf(PropTypes.number),
    uploader: PropTypes.shape({
      avatar: PropTypes.string,
      displayName: PropTypes.string,
    }),
    canHaveRevisions: PropTypes.bool,
    technical: PropTypes.bool,
    isInitial: PropTypes.bool,
  }),
  download: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired,
  isActiveDiff: PropTypes.bool.isRequired,
  isAllowedImageUpload: PropTypes.bool.isRequired,
  isApproved: PropTypes.bool.isRequired,
  isDiffAllowed: PropTypes.bool.isRequired,
  isDownloadable: PropTypes.bool.isRequired,
  isLastRevisionTechnical: PropTypes.bool.isRequired,
  isSupportedForDiff: PropTypes.bool.isRequired,
  isVideo: PropTypes.bool.isRequired,
  lastRevisionNumber: PropTypes.number,
  revertRevision: PropTypes.func.isRequired,
  setActive: PropTypes.func.isRequired,
  setActiveDiff: PropTypes.func.isRequired,
  showMarkerIcon: PropTypes.bool.isRequired,
  toggleRevisionComments: PropTypes.func.isRequired,
};

export default Revision;
