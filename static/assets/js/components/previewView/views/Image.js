import React from 'react';
import {
  string, object, array, number, func, oneOfType, bool,
} from 'prop-types';
import cn from 'classnames';
import picsioConfig from '../../../../../../config';
import ua from '../../../ua';
import { pollImage } from '../../../helpers/images';
import * as utils from '../../../shared/utils';
import Logger from '../../../services/Logger';

import Spinner from './Spinner'; // eslint-disable-line
import Marker from './Marker'; // eslint-disable-line
import ToolbarPreviewLeft from '../../toolbars/ToolbarPreviewLeft';
import ToolbarPreviewRightMobile from '../../toolbars/ToolbarPreviewRightMobile';
import store from '../../../store';
import getDownloadUrl from '../../../helpers/getDownloadUrl';
import { watermarkPositions } from '../../teammates/configs/watermarkPositions';

class Image extends React.Component {
  /** prop types */
  static propTypes = {
    data: object,
    revisionID: string,
    diffID: string,
    diffAsset: object,
    activeRevisionNumber: oneOfType([number, string]),
    diffRevisionNumber: oneOfType([number, string]),
    markers: array,
    tmpMarkers: array,
    addMarker: func,
    removeMarker: func,
    addRevision: oneOfType([func, bool]),
    moveToTrash: oneOfType([func, bool]),
    handleDownload: oneOfType([func, bool]),
    openEditor: func,
    modifyTmpMarkers: func,
    setUserOrientation: func,
  };

  /** default props */
  static defaultProps = {
    markers: [],
    tmpMarkers: [],
  };

  constructor(props) {
    super(props);

    this.minZoom = 1;
    this.maxZoom = this.minZoom * 5000;

    const { data } = props;
    // let dimensions = {};
    const { flipX, flipY, rotation = 0 } = data.userOrientation;

    this.state = {
      prevAssetId: data._id,
      url: null,
      isThumbnailLoaded: false,
      isDiffThumbnailLoaded: false,
      watermarkDetails: null,
      fit: true,
      scale: this.minZoom,
      translateX: 0,
      translateY: 0,
      flipX: flipX ? -1 : 1,
      flipY: flipY ? -1 : 1,
      rotation,
      diffPosition: 50,
      diffUrl: null,
    };
  }

  static getDerivedStateFromProps(props, prevState) {
    const { data, mainActions } = props;
    const { flipX, flipY, rotation = 0 } = data.userOrientation;
    let watermarkDetails = null;
    if (data.watermarkId && picsioConfig.isMainApp()) {
      watermarkDetails = store.getState().assets.watermarks.find((watermark) => watermark._id === data.watermarkId);
    } else if (data.watermarkId) {
      watermarkDetails = data.watermark;
    }
    let state = {
      flipX: flipX ? -1 : 1,
      flipY: flipY ? -1 : 1,
      rotation,
      watermarkDetails,
    };
    if (prevState.prevAssetId !== data._id) {
      /** if received new asset */
      state = {
        ...state,
        prevAssetId: data._id,
        isThumbnailLoaded: false,
        watermarkDetails,
        fit: true,
        scale: 1,
        translateX: 0,
        translateY: 0,
        diffPosition: 50,
      };
      mainActions.setAssetScale(1);
    }
    return state;
  }

  componentDidMount() {
    this.modifyToolbarFitBtn(this.state.fit);
    if (this.state.rotation === 90 || this.state.rotation === 270) this.normalizeMinZoom();
    window.addEventListener('resize', this.updateMarkersWrapper);
    window.addEventListener('resize', this.updateWatermarkFontSize);
    /** Set urls */
    this.setUrls();
    this.$imageWrapper.addEventListener('scroll', this.updateMarkersWrapper);
    this.$imageWrapper.addEventListener('scroll', this.updateWatermarkFontSize);
    window.addEventListener('preview:ui:resize', this.updateMarkersWrapper, false);
    window.addEventListener('preview:ui:resize', this.updateWatermarkFontSize, false);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.data._id !== this.props.data._id) {
      this.modifyToolbarFitBtn(true);
      if (this.poller) {
        this.poller.stop();
        this.poller = undefined;
      }
    }
    /** Update urls */
    if (
      prevProps.data._id !== this.props.data._id
      || prevProps.diffAsset !== this.props.diffAsset
      || prevProps.diffID !== this.props.diffID
      || prevProps.revisionID !== this.props.revisionID
      || prevProps.data.thumbnail !== this.props.data.thumbnail
      || prevProps.data.revisionsThumbnails !== this.props.data.revisionsThumbnails
    ) {
      this.setUrls();
    }
    this.updateMarkersWrapper();
    this.updateWatermarkFontSize();
    /* switch listener to add marker */
    if (this.props.listenToClick) {
      document.addEventListener('mousedown', this.setMarker);
    } else {
      document.removeEventListener('mousedown', this.setMarker);
    }

    if (prevState.rotation !== this.state.rotation) this.normalizeMinZoom();
  }

  setUrls = async () => {
    const { props } = this;
    this.setState({ isThumbnailLoaded: false, isDiffThumbnailLoaded: false });
    const url = await getUrl(props.data, props.revisionID, props.assetActions);
    /** diff url for diff asset */
    let diffUrl = await getUrl(props.diffAsset, null, props.assetActions);
    if (props.diffID && !diffUrl) {
      /** diff url for diff revision */
      diffUrl = await getUrl(props.data, props.diffID, props.assetActions);
    }

    const state = { url, diffUrl };
    if (url === this.state.url) state.isThumbnailLoaded = true;
    if (diffUrl === this.state.diffUrl) state.isDiffThumbnailLoaded = true;

    this.setState(state);
  };

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateMarkersWrapper);
    this.$imageWrapper.removeEventListener('scroll', this.updateMarkersWrapper);
    this.$imageWrapper.removeEventListener('scroll', this.updateWatermarkFontSize);
    window.removeEventListener('preview:ui:resize', this.updateMarkersWrapper, false);
    window.removeEventListener('resize', this.updateWatermarkFontSize);
    window.removeEventListener('preview:ui:resize', this.updateWatermarkFontSize, false);
    document.removeEventListener('mousedown', this.setMarker);
    if (this.poller) {
      this.poller.stop();
      this.poller = undefined;
    }
  }

  normalizeMinZoom = () => {
    const {
      props, state, image, container,
    } = this;
    if (!image) return;
    if (state.rotation === 90 || state.rotation === 270) {
      /** image rotated: width <-> height */
      let imageWidth = image.naturalHeight;
      let imageHeight = image.naturalWidth;
      if (props.data.imageMediaMetadata && (!imageHeight || !imageWidth)) {
        /** use meta fields if no image dimensions */
        imageWidth = props.data.imageMediaMetadata.width;
        imageHeight = props.data.imageMediaMetadata.height;
      }
      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      if (imageWidth < containerWidth && imageHeight < containerHeight) {
        /** image smaller than container */
        this.minZoom = 1;
      } else {
        const diffWidth = imageWidth - containerWidth;
        const diffHeight = imageHeight - containerHeight;
        const browserScale = (() => {
          if (imageHeight < containerWidth && imageWidth < containerHeight) {
            /** image smaller than container */
            return 1;
          }
          const diffWidth = imageHeight - containerWidth;
          const diffHeight = imageHeight - containerHeight;
          if (diffWidth > diffHeight) return 1 + (containerWidth - imageHeight) / imageHeight;
          return 1 + (containerHeight - imageWidth) / imageWidth;
        })();
        if (diffWidth > diffHeight) {
          /** scale by width */
          imageWidth *= browserScale;
          this.minZoom = 1 + (containerWidth - imageWidth) / imageWidth;
        } else {
          /** scale by height */
          imageHeight *= browserScale;
          this.minZoom = 1 + (containerHeight - imageHeight) / imageHeight;
        }
      }
    } else {
      /** image dimensions isn't changed */
      this.minZoom = 1;
    }
    this.setState({ scale: this.minZoom }, () => props.mainActions.setAssetScale(this.minZoom));
  };

  updateMarkersWrapper = () => {
    if (!this.image) return;
    const imageRect = this.image.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();

    this.markersContainer.style.left = `${imageRect.left - containerRect.left}px`;
    this.markersContainer.style.top = `${imageRect.top - containerRect.top}px`;
    this.markersContainer.style.width = `${imageRect.width}px`;
    this.markersContainer.style.height = `${imageRect.height}px`;
  };

  updateWatermarkFontSize = () => {
    if (!this.markersContainer || !this.watermark) return;
    const { state } = this;
    const { watermarkDetails } = state;
    const container = this.markersContainer.getBoundingClientRect();
    let fontSize;
    let imageWidth;
    let imageHeight;
    if (watermarkDetails && watermarkDetails.type === 'text') {
      if (watermarkDetails && watermarkDetails.text.length > 2) {
        fontSize = (watermarkDetails && watermarkDetails.size) * (container.width / 100) / (watermarkDetails && watermarkDetails.text.length);
      } else {
        fontSize = (watermarkDetails && watermarkDetails.size) * (container.width / 100) / 2;
      }
    } else if (watermarkDetails && watermarkDetails.type === 'image') {
      imageWidth = container.width * (watermarkDetails && watermarkDetails.size) / 100;
      imageHeight = container.height * (watermarkDetails && watermarkDetails.size) / 100;
    }
    this.watermark.style.height = `${imageHeight}px`;
    this.watermark.style.width = `${imageWidth}px`;
    this.watermark.style.fontSize = `${fontSize}px`;
  }

  rotateCkw = () => {
    // let userOrientation = Object.clone(this.props.data.userOrientation);
    const userOrientation = { ...this.props.data.userOrientation };
    userOrientation.rotation = userOrientation.rotation + 90 === 360 ? 0 : userOrientation.rotation + 90;
    this.props.setUserOrientation([this.props.data._id], userOrientation);
  };

  rotateAntiCkw = () => {
    // let userOrientation = Object.clone(this.props.data.userOrientation);
    const userOrientation = { ...this.props.data.userOrientation };
    userOrientation.rotation = userOrientation.rotation - 90 < 0 ? 270 : userOrientation.rotation - 90;
    this.props.setUserOrientation([this.props.data._id], userOrientation);
  };

  horizontalFlip = () => {
    // let userOrientation = Object.clone(this.props.data.userOrientation);
    const userOrientation = { ...this.props.data.userOrientation };
    userOrientation.flipX = !userOrientation.flipX;
    this.props.setUserOrientation([this.props.data._id], userOrientation);
  };

  verticalFlip = () => {
    // let userOrientation = Object.clone(this.props.data.userOrientation);
    const userOrientation = { ...this.props.data.userOrientation };
    userOrientation.flipY = !userOrientation.flipY;
    this.props.setUserOrientation([this.props.data._id], userOrientation);
  };

  fitImage = () => {
    const currentScale = this.state.scale;
    const fit = !this.state.fit;
    const { image } = this;
    const scale = image.naturalWidth / (image.getBoundingClientRect().width / currentScale);
    const newScale = fit ? this.minZoom : scale;

    this.setState({
      translateX: 0,
      translateY: 0,
      fit,
      scale: newScale,
    }, () => this.props.mainActions.setAssetScale(newScale));

    this.modifyToolbarFitBtn(fit);
  };

  /**
   * Modify fit button on left toolbar
   * @param {Boolean} fit
   */
  modifyToolbarFitBtn = (fit) => {
    this.setState({ fit });
  };

  /**
   * Set marker from event click
   * @param {MouseEvent} event
   * @param {Number} event.clientX
   * @param {Number} event.clientY
   */
  setMarker = ({ clientX, clientY }) => {
    if (!this.image) return;
    const imageRect = this.image.getBoundingClientRect();
    const { flipX, flipY, rotation } = this.state;

    /* if pointer outside the image - do nothing */
    if (
      !(
        clientX > imageRect.left
        && clientX < imageRect.left + imageRect.width
        && clientY > imageRect.top
        && clientY < imageRect.top + imageRect.height
      )
    ) {
      return this.props.addMarker(null);
    }

    const left = (clientX - imageRect.left) / imageRect.width;
    const top = (clientY - imageRect.top) / imageRect.height;

    let offsetX = left;
    let offsetY = top;

    /* handle rotation */
    if (rotation === 90) {
      offsetX = top;
      offsetY = 1 - left;
    }
    if (rotation === 180) {
      offsetX = 1 - left;
      offsetY = 1 - top;
    }
    if (rotation === 270) {
      offsetX = 1 - top;
      offsetY = left;
    }
    /* handle flip */
    if (flipX === -1) offsetX = 1 - offsetX;
    if (flipY === -1) offsetY = 1 - offsetY;

    const markerData = {
      x: offsetX,
      y: offsetY,
      createdAt: Date.now(),
    };

    /* save marker */
    this.props.addMarker(markerData);
    document.removeEventListener('click', this.setMarker);
  };

  /**
   * On comment added
   */
  onHistoryCommentAdded() {
    this.setState({ tmpMarkers: [] });
  }

  zoomIn = () => {
    const scale = this.state.scale * 1.25;
    this.setState({ scale, fit: true }, () => this.props.mainActions.setAssetScale(scale));
  };

  zoomOut = () => {
    let newScale = this.state.scale * 0.75;
    if (newScale < this.minZoom) {
      newScale = this.minZoom;
    }
    this.setState({ scale: newScale, fit: true }, () => this.props.mainActions.setAssetScale(newScale));
  };

  /**
   * mousewheel on image
   * @param {MouseEvent} event
   */
  onWheel = (event) => {
    const INCREASE = 0.04;
    if (!this.state.isThumbnailLoaded || !this.image) return;

    const {
      width, height, left, top,
    } = this.image.getBoundingClientRect();
    let {
      translateX, translateY, rotation, scale, flipX, flipY,
    } = this.state;

    const { clientX, clientY } = event.nativeEvent;
    let offsetX;
    let offsetY;
    let x = clientX - left;
    let y = clientY - top;
    /* handle rotation */
    if (rotation === 90) {
      x = clientY - top;
      y = left + width - clientX;
    }
    if (rotation === 180) {
      x = width - x;
      y = height - y;
    }
    if (rotation === 270) {
      x = top + height - clientY;
      y = clientX - left;
    }
    /* handle flip */
    if (flipX === -1) {
      x = width - x;
    }
    if (flipY === -1) {
      y = height - y;
    }

    /* old implementation x
    const eOffsetX = event.nativeEvent.offsetX || event.nativeEvent.layerX;
    */

    /* old implementation y
    const eOffsetY = event.nativeEvent.offsetY || event.nativeEvent.layerY;
    */

    const diffWidth = width / 25;
    const diffHeight = height / 25;
    const halfDiffWidth = diffWidth / 2;
    const halfDiffHeight = diffHeight / 2;

    if (event.deltaY > 0) {
      scale -= scale * INCREASE;

      if (scale < this.minZoom) {
        return this.setState({
          scale: this.minZoom,
          translateX: 0,
          translateY: 0,
        }, () => this.props.mainActions.setAssetScale(this.minZoom));
      }
      if (rotation === 0 || rotation === 180) {
        offsetX = x;
        offsetY = y;

        translateX += diffWidth * (offsetX / width) - halfDiffWidth;
        translateY += diffHeight * (offsetY / height) - halfDiffHeight;
      } else {
        offsetX = y;
        offsetY = x;

        translateX += diffHeight * (offsetY / height) - halfDiffHeight;
        translateY += diffWidth * (offsetX / width) - halfDiffWidth;
      }
    }
    if (event.deltaY < 0) {
      const nextState = scale + scale * INCREASE;

      if (nextState < this.maxZoom) {
        scale = nextState;

        if (rotation === 0 || rotation === 180) {
          offsetX = x;
          offsetY = y;

          translateX -= diffWidth * (offsetX / width) - halfDiffWidth;
          translateY -= diffHeight * (offsetY / height) - halfDiffHeight;
        } else {
          offsetX = y;
          offsetY = x;

          translateX -= diffHeight * (offsetY / height) - halfDiffHeight;
          translateY -= diffWidth * (offsetX / width) - halfDiffWidth;
        }
      }
    }

    const newState = {
      scale,
      translateX,
      translateY,
    };
    this.setState(newState, () => this.props.mainActions.setAssetScale(scale));
  };

  /**
   * Mouse down on image
   * @param {MouseEvent} event
   */
  onImgMouseDown = (event) => {
    if (!ua.browser.isNotDesktop()) {
      event.preventDefault();
    }
    if (!ua.isMobileApp()) {
      event.stopPropagation();
    }
    const start = {
      x: event.pageX,
      y: event.pageY,
    };

    if (event.touches && event.touches.length === 1) {
      start.x = event.touches[0].pageX;
      start.y = event.touches[0].pageY;
    }

    const mousemoveHandler = (e) => {
      if (!this.image) return;
      const { x, y } = start;
      const {
        translateX, translateY, scale, flipY, flipX, rotation,
      } = this.state;
      if (scale <= 1) return;
      let { pageX, pageY } = e;
      if (e.touches && e.touches.length === 1) {
        pageX = e.touches[0].pageX;
        pageY = e.touches[0].pageY;
      }

      const imgRect = this.image.getBoundingClientRect();
      const img = {
        left: imgRect.left,
        top: imgRect.top,
        right: imgRect.left + imgRect.width,
        bottom: imgRect.top + imgRect.height,
      };

      const containerRect = this.container.getBoundingClientRect();
      const container = {
        left: containerRect.left,
        top: containerRect.top,
        right: containerRect.left + containerRect.width,
        bottom: containerRect.top + containerRect.height,
      };

      let diffX = (pageX - x) * scale;
      let diffY = (pageY - y) * scale;
      const directionX = diffX < 0 ? 'left' : diffX > 0 ? 'right' : null;
      const directionY = diffY < 0 ? 'top' : diffY > 0 ? 'bottom' : null;

      /* handle rotation */
      if (rotation === 90) {
        diffX = diffY;
        diffY = -(pageX - x) * scale;
      }
      if (rotation === 180) {
        diffX = -diffX;
        diffY = -diffY;
      }
      if (rotation === 270) {
        diffX = -diffY;
        diffY = (pageX - x) * scale;
      }
      /* handle flip */
      if (flipY === -1) {
        diffY = -diffY;
      }
      if (flipX === -1) {
        diffX = -diffX;
      }

      let newX = null;
      let newY = null;

      /** hadle move direction */
      switch (directionX) {
      /* move left */
      case 'left':
        if (img.left >= container.left || img.right >= container.right) {
          if (rotation === 0 || rotation === 180) {
            newX = translateX + diffX / scale;
          } else {
            newY = translateY + diffY / scale;
          }
        }
        break;
        /* move right */
      case 'right':
        if (img.right <= container.right || img.left <= container.left) {
          if (rotation === 0 || rotation === 180) {
            newX = translateX + diffX / scale;
          } else {
            newY = translateY + diffY / scale;
          }
        }
        break;
      }
      switch (directionY) {
      /* move up */
      case 'top':
        if (img.top >= container.top || img.bottom >= container.bottom) {
          if (rotation === 0 || rotation === 180) {
            newY = translateY + diffY / scale;
          } else {
            newX = translateX + diffX / scale;
          }
        }
        break;
        /* move down */
      case 'bottom':
        if (img.bottom <= container.bottom || img.top <= container.top) {
          if (rotation === 0 || rotation === 180) {
            newY = translateY + diffY / scale;
          } else {
            newX = translateX + diffX / scale;
          }
        }
        break;
      }

      if (newX !== null || newY !== null) {
        this.setState({
          translateX: newX !== null ? newX : translateX,
          translateY: newY !== null ? newY : translateY,
        });

        start.x = pageX;
        start.y = pageY;
      }
    };

    const mouseupHandler = (e) => {
      e.stopPropagation();
      document.removeEventListener('mousemove', mousemoveHandler);
      document.removeEventListener('mouseup', mouseupHandler);
      document.removeEventListener('touchmove', mousemoveHandler);
      document.removeEventListener('touchend', mouseupHandler);
    };

    document.addEventListener('mousemove', mousemoveHandler);
    document.addEventListener('mouseup', mouseupHandler);
    document.addEventListener('touchmove', mousemoveHandler);
    document.addEventListener('touchend', mouseupHandler);
  };

  onImgLoad = () => {
    this.setState({ isThumbnailLoaded: true });
  };

  onImgError = () => {
    if (this.props.data.customThumbnail) {
      this.poller = pollImage(this.props.data.thumbnail.big);
      /* forceUpdate needs for re initialize image inside DOM */
      this.poller.promise.then(this.forceUpdate).catch(this.forceUpdate);
    }
  };

  onDiffImgLoad = () => {
    this.setState({ isDiffThumbnailLoaded: true });
  };

  /**
   * Click on image
   * @param {MouseEvent} event
   */
  onImgClick = (event) => {
    if (ua.browser.isNotDesktop()) {
      event.preventDefault();
      this.fitImage();
    }
  };

  /**
   * Mouse down on separator line
   * @param {MouseEvent} event
   */
  onLineMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();

    /**
     * Mouse move
     * @param {MouseEvent} e
     */
    const mouseMove = (e) => {
      e.stopPropagation();

      const rect = this.container.getBoundingClientRect();
      let position = (e.pageX - rect.left) / (rect.width / 100);
      if (position < 0) position = 0;
      if (position > 100) position = 100;

      this.setState({ diffPosition: position });
    };
    /**
     * Mouse up
     * @param {MouseEvent} e
     */
    const mouseUp = (e) => {
      e.stopPropagation();
      document.removeEventListener('mousemove', mouseMove);
      document.removeEventListener('mouseup', mouseUp);
    };

    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);
  };

  onLineTouchStart = (event) => {
    event.persist();
    event.stopPropagation();

    /**
     * Touch move
     * @param {MouseEvent} env
     */
    const touchMove = (evt) => {
      const touches = evt.changedTouches;
      const { clientX } = touches[0];

      const rect = this.container.getBoundingClientRect();
      let position = (clientX - rect.left) / (rect.width / 100);
      if (position < 0) position = 0;
      if (position > 100) position = 100;
      this.setState({ diffPosition: position });
    };
    /**
     * Touch end
     * @param {MouseEvent}
     */
    const touchEnd = () => {
      document.removeEventListener('touchmove', touchMove);
      document.removeEventListener('touchend', touchEnd);
    };

    document.addEventListener('touchmove', touchMove, { passive: false });
    document.addEventListener('touchend', touchEnd, { passive: false });
  }

  onLineDoubleClick = () => {
    if (this.state.diffPosition !== 50) this.setState({ diffPosition: 50 });
  };

  /**
   * Mouse down on tmp marker
   * @param {MouseEvent} event
   * @param {Number} index
   */
  onMarkerMouseDown = (event, index) => {
    event.stopPropagation();

    const { tmpMarkers } = this.props;
    const marker = tmpMarkers[index];

    if (marker) {
      const { flipY, flipX, rotation } = this.state;

      const mousemoveHandler = (e) => {
        if (!this.image) return;
        e.stopPropagation();
        const clientX = e.pageX;
        const clientY = e.pageY;
        const imageRect = this.image.getBoundingClientRect();

        /* if pointer outside the image - do nothing */
        if (
          !(
            clientX > imageRect.left
            && clientX < imageRect.left + imageRect.width
            && clientY > imageRect.top
            && clientY < imageRect.top + imageRect.height
          )
        ) {
          return;
        }

        const left = (clientX - imageRect.left) / imageRect.width;
        const top = (clientY - imageRect.top) / imageRect.height;

        let offsetX = left;
        let offsetY = top;

        /* handle rotation */
        if (rotation === 90) {
          offsetX = top;
          offsetY = 1 - left;
        }
        if (rotation === 180) {
          offsetX = 1 - left;
          offsetY = 1 - top;
        }
        if (rotation === 270) {
          offsetX = 1 - top;
          offsetY = left;
        }
        /* handle flip */
        if (flipX === -1) offsetX = 1 - offsetX;
        if (flipY === -1) offsetY = 1 - offsetY;

        // if rectangle selection - move 2 points
        if (marker.x2 !== undefined && marker.y2 !== undefined) {
          // handle x and x2
          const newX2 = marker.x2 + offsetX - marker.x;
          if (newX2 <= 1) {
            marker.x = offsetX;
            marker.x2 = newX2;
          } else {
            marker.x = offsetX + 1 - newX2;
            marker.x2 = 1;
          }

          // handle y and y2
          const newY2 = marker.y2 + offsetY - marker.y;
          if (newY2 <= 1) {
            marker.y2 = newY2;
            marker.y = offsetY;
          } else {
            marker.y = offsetY + 1 - newY2;
            marker.y2 = 1;
          }
        } else {
          // if single marker
          marker.x = offsetX;
          marker.y = offsetY;
        }

        this.props.modifyTmpMarkers(tmpMarkers);
      };
      const mouseupHandler = () => {
        document.removeEventListener('mousemove', mousemoveHandler);
        document.removeEventListener('mouseup', mouseupHandler);
      };

      document.addEventListener('mousemove', mousemoveHandler);
      document.addEventListener('mouseup', mouseupHandler);
    }
  };

  /**
   * Mouse down on tmp marker resize
   * @param {MouseEvent} event
   * @param {Number} index
   */
  onMarkerMouseDownResize = (event, index) => {
    event.preventDefault();
    event.stopPropagation();

    const { tmpMarkers } = this.props;
    const marker = tmpMarkers[index];

    if (marker) {
      const { flipY, flipX, rotation } = this.state;

      const mousemoveHandler = (e) => {
        if (!this.image) return;
        e.stopPropagation();
        const clientX = e.pageX;
        const clientY = e.pageY;
        const imageRect = this.image.getBoundingClientRect();

        /* if pointer outside the image - do nothing */
        if (
          !(
            clientX > imageRect.left
            && clientX < imageRect.left + imageRect.width
            && clientY > imageRect.top
            && clientY < imageRect.top + imageRect.height
          )
        ) {
          return;
        }

        const left = (clientX - imageRect.left) / imageRect.width;
        const top = (clientY - imageRect.top) / imageRect.height;

        let offsetX = left;
        let offsetY = top;

        /* handle rotation */
        if (rotation === 90) {
          offsetX = top;
          offsetY = 1 - left;
        }
        if (rotation === 180) {
          offsetX = 1 - left;
          offsetY = 1 - top;
        }
        if (rotation === 270) {
          offsetX = 1 - top;
          offsetY = left;
        }
        /* handle flip */
        if (flipX === -1) offsetX = 1 - offsetX;
        if (flipY === -1) offsetY = 1 - offsetY;

        marker.x2 = marker.x > offsetX ? marker.x : offsetX;
        marker.y2 = marker.y > offsetY ? marker.y : offsetY;

        this.props.modifyTmpMarkers(tmpMarkers);
      };
      const mouseupHandler = () => {
        document.removeEventListener('mousemove', mousemoveHandler);
        document.removeEventListener('mouseup', mouseupHandler);
      };

      document.addEventListener('mousemove', mousemoveHandler);
      document.addEventListener('mouseup', mouseupHandler);
    }
  };

  render() {
    const { state, props } = this;
    const showButtons = !props.data.trashed;
    const extension = props.data.fileExtension && props.data.fileExtension.toLowerCase();
    const isTransparentImageLoaded = state.isThumbnailLoaded && (extension === 'png' || extension === 'svg' || extension === 'gif');
    const isRestricted = utils.isAssetRestricted(props.data.restrictSettings);
    const { watermarkDetails } = state;
    return (
      <div ref={(node) => (this.container = node)} className="innerContainerMediaFile">
        <If condition={!this.props.diffAsset}>
          <If condition={picsioConfig.isMainApp()}>
            <ToolbarPreviewLeft
              assetId={props.data._id}
              hasWatermark={Boolean(props.data.watermark)}
              addRevision={props.addRevision}
              download={props.handleDownload}
              moveToTrash={props.moveToTrash}
              rotateckw={showButtons && this.rotateCkw}
              rotateantickw={showButtons && this.rotateAntiCkw}
              flipx={showButtons && this.horizontalFlip}
              flipy={showButtons && this.verticalFlip}
              openEditor={showButtons && props.openEditor}
              originalSizeImg={
                showButtons && {
                  handler: this.fitImage,
                  fit: state.fit,
                }
              }
              isRestricted={isRestricted}
              permissions={props.data.permissions}
              isRemoveForever={props.isRemoveForever}
              isArchived={props.data.archived}
            />
          </If>

          <ToolbarPreviewRightMobile
            originalSizeImg={
              showButtons && {
                handler: this.fitImage,
                fit: state.fit,
              }
            }
            zoomIn={this.zoomIn}
            zoomOut={this.zoomOut}
          />
        </If>
        <div
          ref={(node) => (this.markersContainer = node)}
          onWheel={this.onWheel}
          className="markersContainer"
        >
          <If condition={watermarkDetails && watermarkDetails.type === 'text'}>
            <div
              className="watermarkText"
              ref={(el) => (this.watermark = el)}
              style={{
                ...watermarkPositions[watermarkDetails && watermarkDetails.position],
                zIndex: '5',
                opacity: watermarkDetails.opacity / 100,
              }}
            >
              {watermarkDetails.text}
            </div>
          </If>
          <If condition={watermarkDetails && watermarkDetails.type === 'image'}>
            <div
              ref={(el) => (this.watermark = el)}
              style={{
                ...watermarkPositions[watermarkDetails && watermarkDetails.position],
                zIndex: '5',
                opacity: watermarkDetails.opacity / 100,
              }}
            >
              <img src={watermarkDetails.imageUrl || URL.createObjectURL(watermarkDetails.file)} style={{ width: 'inherit', height: 'inherit', objectFit: 'contain' }} />
            </div>
          </If>
          {/* Comment markers */}
          {props.markers.length > 0
            && props.markers.map((markersItem) => markersItem.markers.map((marker, index) => (
              <Marker
                key={marker.number || index}
                marker={marker}
                flipX={state.flipX}
                flipY={state.flipY}
                rotation={state.rotation}
                onAreaMouseDown={this.onImgMouseDown}
              />
            )))}
          {/* Tmp Markers */}
          {props.tmpMarkers.length > 0
            && props.tmpMarkers.map((marker, index) => (
              <Marker
                key={marker.number}
                marker={marker}
                flipX={state.flipX}
                flipY={state.flipY}
                rotation={state.rotation}
                onRemove={() => props.removeMarker(index)}
                onMouseDown={(event) => this.onMarkerMouseDown(event, index)}
                onMouseDownResize={(event) => this.onMarkerMouseDownResize(event, index)}
                onAreaMouseDown={this.onImgMouseDown}
              />
            ))}
        </div>

        <div
          className={cn('theMediaFile', {
            chessBg: isTransparentImageLoaded,
          })}
          ref={(node) => (this.$imageWrapper = node)}
        >
          <img
            style={{
              visibility: state.isThumbnailLoaded ? 'visible' : 'hidden',
              transform: `
                      rotate(${state.rotation}deg)
                      scaleX(${state.flipX})
                      scaleY(${state.flipY})
                      scale(${state.scale})
                      translate(${(state.translateX / state.scale).toFixed(6)}px, ${(state.translateY / state.scale).toFixed(6)}px)`,
            }}
            onLoad={this.onImgLoad}
            onError={this.onImgError}
            onWheel={this.onWheel}
            onMouseDown={this.onImgMouseDown}
            onTouchStart={this.onImgMouseDown}
            onClick={this.onImgClick}
            src={state.url}
            alt={props.data.name}
            ref={(el) => (this.image = el)}
          />
          {(!state.isThumbnailLoaded || !props.data.thumbnail) && <Spinner title="Loading image..." />}
        </div>
        {/* diff vertical line */}
        {state.diffUrl && (
          <div
            style={{ left: `${state.diffPosition}%` }}
            className="diffLine"
            onMouseDown={this.onLineMouseDown}
            onDoubleClick={this.onLineDoubleClick}
            onTouchStart={this.onLineTouchStart}
          >
            <span>{props.activeRevisionNumber}</span>
            <span>{props.diffRevisionNumber}</span>
          </div>
        )}
        {/* diff */}
        {state.diffUrl && (
          <div className="diffContainer" style={{ right: `${100 - state.diffPosition}%` }}>
            <div className="diffContainerInner" style={{ width: `${(100 / state.diffPosition) * 100}%` }}>
              {!state.isDiffThumbnailLoaded && <Spinner />}
              <img
                src={state.diffUrl}
                alt={props.data.name}
                style={{
                  visibility: state.isDiffThumbnailLoaded ? 'visible' : 'hidden',
                  transform: `
                    rotate(${state.rotation}deg)
                    scale(${state.scale})
                    translate(${(state.translateX / state.scale).toFixed(6)}px,${(state.translateY / state.scale).toFixed(6)}px)`,
                }}
                onLoad={this.onDiffImgLoad}
                onWheel={this.onWheel}
                onMouseDown={this.onImgMouseDown}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

/**
 * @param {Object} asset - asset data
 * @param {string?} revisionID
 */
async function getUrl(asset, revisionID, assetActions) {
  if (!asset || !asset.thumbnail) return null;
  const thumbnailSize =		(store.getState().user && store.getState().user.settings && store.getState().user.settings.previewThumbnailSize)
    || 'default';
  const canShowRevisions = picsioConfig.formats.SUPPORTED_DIFF_FORMATS.includes(asset.mimeType);

  if (revisionID && canShowRevisions) {
    const { customThumbnail } = asset;

    if (customThumbnail && customThumbnail[revisionID]) {
      if (asset.revisionsThumbnails && asset.revisionsThumbnails[revisionID]) {
        return asset.revisionsThumbnails[revisionID].thumbnail[thumbnailSize];
      }
      assetActions.getRevisionsThumbnails(asset._id);
      return null;
    }
    try {
      return await getDownloadUrl({ assetId: asset._id, revisionId: revisionID, allowDownloadByGS: false });
    } catch (err) {
      Logger.error(new Error('Can not get url for revision'), { error: err, assetId: asset._id, revisionID });
      return null;
    }
  } else {
    return asset.thumbnail[thumbnailSize];
  }
}

export default Image;
