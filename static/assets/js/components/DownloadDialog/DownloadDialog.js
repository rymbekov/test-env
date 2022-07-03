import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { isMobile, isIOS } from 'react-device-detect';

import Icon from '../Icon';

import Logger from '../../services/Logger';
import localization from '../../shared/strings';
import picsioConfig from '../../../../../config';

import DownloadDialogPresets from './DownloadDialogPresets';
import DownloadDialogSettings from './DownloadDialogSettings';
import DownloadDialogAdditional from './DownloadDialogAdditional';
import withErrorBoundary from '../ErrorBoundary/withErrorBoundary';
import * as actions from './actions';
import { showDialog } from '../dialog';

import { defaultPresets, customPreset, getOptionDefaultValue } from './config';

const isMainApp = picsioConfig.isMainApp();
const isProofing = picsioConfig.isProofing();

class DownloadDialog extends React.Component {
  refBtnOk = React.createRef();

  state = {
    isLoading: false,
    hasCustomVideoPresets: false,
    isAssetsWithWatermark: false,
    presets: defaultPresets,
    selectedPreset: defaultPresets[0],
  };

  componentDidMount() {
    const { shouldFormatBeDisabled, countAssets, assets } = this.props;
    const isAssetsWithWatermark = assets.some((asset) => asset.watermarkId);

    if (isAssetsWithWatermark) {
      this.setState({ isAssetsWithWatermark });
    }

    // download more than 1 asset as archive on mobile iOS devices
    if (countAssets > 1 && isMobile && isIOS) {
      this.setState(({ selectedPreset }) => ({
        selectedPreset: {
          ...selectedPreset,
          data: { ...selectedPreset.data, isArchive: true, withoutWatermark: false },
        },
      }));
    }

    if (isMainApp && !shouldFormatBeDisabled) {
      this.getDownloadPresets();
    }
    /** add download qualities to presets for videos with proxy versions only */
    if (isMainApp && assets.every((a) => !!a.customVideo)) {
      const assetsQualities = assets.map((a) => {
        if (Array.isArray(a.customVideo.head)) {
          return a.customVideo.head.map((q) => q.quality);
        }
        return null;
      });
      if (!assetsQualities.includes(null)) {
        const diff = assetsQualities.reduce((acc, q, index) => {
          if (index === 0) return q;
          return acc.filter((i) => q.indexOf(i) > -1);
        }, []);
        if (diff.length > 0) {
          const videoPresets = diff.map((resolution) => ({
            _id: resolution.toString(),
            name: `${resolution}p`,
            data: {
              resolution,
              mimeType: 'original',
              isArchive: false,
              withoutWatermark: false,
              organizeByCollections: false,
            },
          }));
          this.setState(({ presets }) => ({
            presets: [...presets, ...videoPresets],
            hasCustomVideoPresets: true,
          }));
        } else {
          Logger.info('Download dialog: videos has no the same qualities');
        }
      } else {
        Logger.info('Download dialog: some video includes custom video without qualities');
      }
    }
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  setLoading = (isLoading) => this.setState({ isLoading });

  setPresets = (presets) => this.setState({ presets });

  setSelectedPreset = (preset) => this.setState({ selectedPreset: preset });

  setPreset = (preset) => this.setState(({ presets }) => {
    const isExist = presets.find(({ _id }) => _id === preset._id);
    const nextPresets = !isExist
      ? [...presets, preset]
      : presets.map((item) => {
        const { _id } = item;
        if (_id === preset._id) {
          return preset;
        }
        return item;
      });

    return { presets: nextPresets };
  });

  setPresetValue = (name, value) => this.setState(({ selectedPreset }) => ({
    selectedPreset: {
      ...selectedPreset,
      data: {
        ...selectedPreset.data,
        [name]: value,
      },
    },
  }));

  removePreset = (presetId) => {
    const { presets, selectedPreset } = this.state;
    const isSelected = selectedPreset._id === presetId;
    const presetIndex = presets.findIndex(({ _id }) => _id === presetId);
    const prevPreset = presets[presetIndex - 1];

    this.setState({
      selectedPreset: isSelected ? prevPreset : selectedPreset,
      presets: presets.filter(({ _id }) => _id !== presetId),
    });
  };

  handleChangePreset = (e) => {
    const {
      target: { value },
    } = e;
    const { presets } = this.state;
    const selectedPreset = presets.find(({ _id }) => _id === value);

    this.setSelectedPreset(selectedPreset);
  };

  handleChangeSettings = (e) => {
    const {
      target: {
        type, name, value, checked,
      },
    } = e;
    let validValue = value;

    switch (type) {
    case 'number':
      validValue = +value;
      break;
    case 'checkbox':
      validValue = checked;

      if (name === 'isArchive' && !checked) {
        this.setPresetValue('organizeByCollections', checked);
      }
      if (name === 'withoutWatermark' && !checked) {
        this.setPresetValue('organizeByCollections', checked);
      }
      break;
    default: {
      break;
    }
    }
    this.setPresetValue(name, validValue);
  };

  getDownloadPresets = async () => {
    try {
      this.setLoading(true);

      const presets = await actions.getDownloadPresets();

      this.setPresets([...defaultPresets, customPreset, ...presets]);
    } catch (e) {
      showDialog({
        title: localization.ERROR,
        text: localization.DOWNLOADDIALOG.getDownloadPresetError,
      });
    } finally {
      this.setLoading(false);
    }
  };

  saveDownloadPreset = async (name, shared, isNew) => {
    const { selectedPreset } = this.state;
    const { _id, data } = selectedPreset;

    try {
      this.setLoading(true);

      const requestData = {
        name,
        data,
        shared,
      };
      let preset;

      if (isNew) {
        preset = await actions.createDownloadPreset(requestData);
      } else {
        preset = await actions.updateDownloadPreset({ _id, ...requestData });
      }

      this.setPreset(preset);
      this.setSelectedPreset(preset);
    } catch (e) {
      showDialog({
        title: localization.ERROR,
        text: localization.DOWNLOADDIALOG.saveDownloadPresetError,
      });
    } finally {
      this.setLoading(false);
    }
  };

  handleSavePreset = async () => {
    const { selectedPreset } = this.state;
    const { _id, name, teamId: isShared } = selectedPreset;
    const isNew = _id === 'custom';
    const presetName = isNew ? '' : name;
    const title = isNew
      ? localization.DOWNLOADDIALOG.createDownloadPreset
      : localization.DOWNLOADDIALOG.saveDownloadPreset;

    showDialog({
      title,
      input: {
        label: 'Name',
        type: 'text',
        value: presetName,
      },
      checkbox: {
        value: !!isShared,
        label: 'Share with my team',
      },
      disableOk: ({ input }) => !input,
      onOk: ({ input: newName, checkbox: shared }) => {
        this.saveDownloadPreset(newName, shared, isNew);
      },
    });
  };

  removeDownloadPreset = async (presetId) => {
    try {
      this.setLoading(true);

      await actions.deleteDownloadPreset(presetId);

      this.removePreset(presetId);
    } catch (e) {
      showDialog({
        title: localization.ERROR,
        text: localization.DOWNLOADDIALOG.removeDownloadPresetError,
      });
    } finally {
      this.setLoading(false);
    }
  };

  handleRemovePreset = async (presetId, presetName) => {
    showDialog({
      title: localization.DOWNLOADDIALOG.removeDownloadPreset,
      text: localization.DOWNLOADDIALOG.removeDownloadPresetText(presetName),
      onOk: () => {
        this.removeDownloadPreset(presetId);
      },
    });
  };

  handleKeyDown = (e) => {
    switch (e.keyCode) {
    // if press Esc
    case 27:
      Logger.log('User', 'DownloadDialogCancel');
      this.props.close();
      break;
      // if press Enter
    case 13:
      this.handleSubmit();
      break;
    default:
      break;
    }
  };

  handleSubmit = () => {
    const { selectedPreset, isAssetsWithWatermark } = this.state;
    const { _id, data } = selectedPreset;
    const {
      mimeType,
      quality,
      density,
      units,
      resizing,
      width,
      isArchive,
      organizeByCollections,
      withoutWatermark,
      resolution,
    } = data;
    const isOriginalPreset = _id === 'original';
    const isDefaultFormat = mimeType === 'original';
    const isOriginal = isMainApp ? isOriginalPreset && isDefaultFormat : isDefaultFormat;
    const config = {
      mimeType, organizeByCollections, isArchive, withoutWatermark, resolution,
    };

    if (!isOriginal) {
      config.quality = quality;
      config.resizing = resizing;
      config.density = null;

      if (density !== getOptionDefaultValue('density')) {
        config.density = density;
        config.units = units;
      }
      if (resizing !== getOptionDefaultValue('resizing')) {
        config.width = width;
      }
    }
    if (isAssetsWithWatermark) {
      config.ignoreCache = true;
    }

    this.props.onDownload(config);
    if (isMainApp || isProofing) {
      setTimeout(this.runFlyingFiles, 100); // fix for flying download icon
    }
  };

  runFlyingFiles = () => {
    if (!this.refBtnOk || (this.refBtnOk && this.refBtnOk.current === null)) return;
    const { offsetLeft, offsetTop } = this.refBtnOk.current;

    const el = document.createElement('div');
    el.classList.add('flyingFiles');
    ReactDOM.render(<Icon name="files" />, el);
    el.style.left = `${offsetLeft}px`;
    el.style.top = `${offsetTop}px`;
    el.addEventListener('transitionend', el.remove, false);

    document.body.appendChild(el);

    const ElDestination = document.querySelector('.toolbarPreviewLeft .downloadList')
      || document.querySelector('.toolbarCatalogLeft .downloadList')
      || document.querySelector('.toolbarCatalogLeft .toolbarGroup .toolbarButton:last-child')
      || document.querySelector('.toolbarCatalogTop .downloadList')
      || document.querySelector('.toolbarSelectedAssetsTop .toolbarDownload')
      || document.querySelector('.toolbarCatalogProofing .toolbarCatalogTop #button-downloadList');

    if (ElDestination) {
      const {
        top, left, height, width,
      } = ElDestination.getBoundingClientRect();

      el.style.left = `${left + width * 0.5}px`; // increase to centrify position
      el.style.top = `${top + height}px`;
    }
  };

  render() {
    const {
      isLoading, presets, selectedPreset, hasCustomVideoPresets, isAssetsWithWatermark,
    } = this.state;
    const {
      close, shouldFormatBeDisabled, countAssets, assets,
    } = this.props;
    const isOpenSettings = !isMainApp || (selectedPreset._id !== 'original' && !hasCustomVideoPresets);
    const canDownloadWithoutWatermark = isMainApp
      && isAssetsWithWatermark
      && assets[0].permissions.downloadWithoutWatermark;

    const disablePdfFormat = isAssetsWithWatermark
      && selectedPreset.data.withoutWatermark === false;

    return (
      <div className="simpleDialog downloadDialog">
        <div className="simpleDialogUnderlayer" />
        <div className="simpleDialogBox">
          <div className="simpleDialogHeader">
            <h2 className="simpleDialogTitle">{localization.DOWNLOADDIALOG.titleDownload}</h2>
            <button
              className="simpleDialogBtnCross"
              onClick={() => {
                Logger.log('User', 'DownloadDialogCancel');
                close();
              }}
              type="button"
            >
              <Icon name="close" />
            </button>
          </div>
          <div className="simpleDialogContent">
            <div className="simpleDialogContentInner">
              <If condition={isMainApp}>
                <DownloadDialogPresets
                  isLoading={isLoading}
                  selectedPreset={selectedPreset}
                  presets={presets}
                  onChange={this.handleChangePreset}
                  onRemove={this.handleRemovePreset}
                  onSave={this.handleSavePreset}
                />
              </If>
              <If condition={isOpenSettings}>
                <DownloadDialogSettings
                  selectedSettings={selectedPreset.data}
                  onChange={this.handleChangeSettings}
                  isDisabledFormat={shouldFormatBeDisabled}
                  disablePdfFormat={disablePdfFormat}
                />
              </If>
              <DownloadDialogAdditional
                canDownloadWithoutWatermark={canDownloadWithoutWatermark}
                selectedSettings={selectedPreset.data}
                onChange={this.handleChangeSettings}
                countAssets={countAssets}
              />
            </div>
          </div>
          <div className="simpleDialogFooter">
            <button
              className="simpleDialogFooterBtn simpleDialogFooterBtnCancel"
              onClick={() => {
                Logger.log('User', 'DownloadDialogCancel');
                close();
              }}
              type="button"
            >
              {localization.DIALOGS.btnCancel}
            </button>
            <button
              ref={this.refBtnOk}
              className="simpleDialogFooterBtn"
              onClick={this.handleSubmit}
              type="button"
            >
              {localization.DOWNLOADDIALOG.textDownload}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

DownloadDialog.defaultProps = {
  countAssets: 0,
  shouldFormatBeDisabled: false,
};
DownloadDialog.propTypes = {
  countAssets: PropTypes.number,
  assets: PropTypes.array.isRequired,
  close: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  shouldFormatBeDisabled: PropTypes.bool,
};

export default withErrorBoundary(DownloadDialog, { className: 'errorBoundaryOverlay' });
