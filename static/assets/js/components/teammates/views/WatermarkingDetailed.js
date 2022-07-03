import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import Logger from '../../../services/Logger';
import {
  Input, Textarea, Radio, InputRange,
} from '../../../UIComponents';
import localization from '../../../shared/strings';
import WatermarkPosition from './WatermarkPosition';
import { watermarkPositions } from '../configs/watermarkPositions';
import { showDialog } from '../../dialog';

const WatermarkingDetailed = (props) => {
  const {
    watermark, assetActions, watermarksLength, canNotManageWatermarks,
  } = props;
  const [nameError, setNameError] = useState('');
  const [textError, setTextError] = useState('');
  const [fileError, setFileError] = useState(false);
  const [state, setState] = useState(watermark);
  const [file, setFile] = useState(watermark?.file);

  useEffect(() => {
    setState(watermark);
    setFile(watermark?.file);
    setNameError('');
    setTextError('');
    setFileError(false);
  },
  [watermark]);

  const handleWatermarkApply = () => {
    let error = false;
    if (state?.name.trim().length === 0) {
      setNameError(localization.WATERMARKS.errorWatermarkName);
      error = true;
    } if (state?.type === 'text' && state?.text.trim().length === 0) {
      setTextError(localization.WATERMARKS.errorWatermarkText);
      error = true;
    } if (state?.type === 'image' && !file && !watermark.imageUrl) {
      setFileError(true);
      error = true;
    }
    if (!error) {
      setFileError(false);
      assetActions.updateWatermark(state);
      Logger.log('User', 'WatermarkNewApply');
    }
  };

  const handleChange = (arg) => {
    const { value } = arg;
    switch (value) {
    case 'isDefault': {
      const { isDefault } = arg;
      setState({
        ...state,
        isDefault,
      });
      break;
    }
    case 'nameInput': {
      const name = arg.name.target.value;
      setState({
        ...state,
        name,
      });
      setNameError(false);
      break;
    }
    case 'descriptionInput': {
      const description = arg.description.target.value.trim();
      setState({
        ...state,
        description,
      });
      break;
    }
    case 'text': {
      const text = arg.text.target.value;
      setState({
        ...state,
        text,
      });
      setTextError(false);
      break;
    }
    case 'textRadio': {
      const { type } = arg;
      setState({
        ...state,
        type,
      });
      setFileError(false);
      break;
    }
    case 'fileRadio': {
      const { type } = arg;
      setState({
        ...state,
        type,
      });
      setTextError('');
      break;
    }
    case 'imgSize': {
      const { size } = arg;
      setState({
        ...state,
        size,
      });
      break;
    }
    case 'opacity': {
      const { opacity } = arg;
      setState({
        ...state,
        opacity,
      });
      break;
    }
    case 'position': {
      const { position } = arg;
      setState({
        ...state,
        position,
      });
      break;
    }
    default: {
      const files = arg.file;
      const { imageUrl } = arg;
      setState({
        ...state,
        file: files,
        imageUrl,
      });
    }
    }
  };
  let fontSize;
  if (state && state.text.length > 4) {
    fontSize = `${Number(state && state.size) * 0.35 / Number(state && state.text.length)}rem`;
  } else if (state && state.text.length > 5) {
    fontSize = `${Number(state && state.size) * 0.25 / Number(state && state.text.length)}rem`;
  } else if (state && state.text.length > 8) {
    fontSize = `${Number(state && state.size) * 0.18 / Number(state && state.text.length)}rem`;
  } else if (state && state.text.length === 1) {
    fontSize = `${Number(state && state.size) * 0.21 / Number(state && state.text.length)}rem`;
  } else {
    fontSize = `${Number(state && state.size) * 0.2 / Number(state && state.text.length)}rem`;
  }

  const handleFileUpload = (event) => {
    const image = event.target.files && event.target.files[0];
    if (image.size > 5000000 || image.type !== 'image/png') {
      showDialog({
        title: localization.WATERMARKS.watermarkImageUploadErrorTitle,
        text: localization.WATERMARKS.watermarkImageUploadText,
        textBtnCancel: null,
        onOk() {},
      });
      Logger.log('User', 'WatermarkNewImageUploadFailed', { fileSize: image.size / 1000000, fileExtension: image.type });
    } else {
      setFile(image);
      setFileError(false);
      const imageUrl = URL.createObjectURL(image);
      Logger.log('User', 'WatermarkNewImageUploadSuccess');
      handleChange({ file: image, value: 'file', imageUrl });
    }
  };

  return (
    <div>
      <div className={cn('watermarkDetails', { disabled: canNotManageWatermarks })}>
        <div className="pageItem">
          <Input
            label={localization.WATERMARKS.labelSettingsWatermarkName}
            className="mediumInput"
            value={state?.name}
            onChange={(event) => {
              handleChange({ name: event, value: 'nameInput' });
            }}
            disabled={watermark?.default}
            name="name"
            error={nameError}
          />
          <Textarea
            label={localization.WATERMARKS.labelSettingsWatermarkDescription}
            className="mediumInput"
            value={state?.description || ''}
            height={86}
            onChange={(event) => {
              handleChange({ description: event, value: 'descriptionInput' });
            }}
            disabled={watermark?.default}
            name="description"
            placeholder="Description"
          />
          <div className={`${watermark?.default ? 'disabled' : ''}`}>
            <Radio
              onChange={() => handleChange({ type: 'text', value: 'textRadio' })}
              value={state?.type === 'text'}
              label="Text"
            />
            <Input
              className="mediumInput"
              onChange={(event) => {
                handleChange({ text: event, value: 'text' });
              }}
              name="text"
              error={textError}
              value={state?.text}
              disabled={state?.type !== 'text'}
            />
          </div>
          <div className={`${watermark?.default ? 'disabled' : ''}`}>
            <Radio
              onChange={() => handleChange({ type: 'image', value: 'fileRadio' })}
              value={state?.type === 'image'}
              label="Image"
            />
            <div className={`pageItemButtons watermarkUpload ${state?.type !== 'image' ? 'disabled' : ''}`}>
              <div className="picsioDefBtn watermarkUploadButton">
                <label>Upload</label>
                <input className="btnCollectionUpload" style={{ maxWidth: '100%', left: '0' }} type="file" onChange={handleFileUpload} />
              </div>
              <span className={`${fileError ? 'error' : ''}`}>
                {file?.name || localization.WATERMARKS.watermarkImageUploadText}
              </span>
            </div>
          </div>
          <InputRange
            label={localization.WATERMARKS.labelSettingsWatermarkSize}
            value={state?.size}
            onChange={(size) => handleChange({ size, value: 'imgSize' })}
            onSliderClick={() => Logger.log('User', 'WatermarkNewImageSizeChanged')}
            min={0}
            max={100}
            disabled={false}
          />
          <InputRange
            label={localization.WATERMARKS.labelSettingsWatermarkOpacity}
            value={state?.opacity}
            onChange={(opacity) => handleChange({ opacity, value: 'opacity' })}
            onSliderClick={() => Logger.log('User', 'WatermarkNewImageOpacityChanged')}
            min={0}
            max={100}
            disabled={false}
          />
          <div className="watermarkSubmitButton">
            <If condition={true || watermarksLength > 1}>
              <div className="defaultButton">
                <span className="picsioDefBtn" onClick={() => assetActions.setDefaultWatermark(watermark._id)}>
                  {localization.WATERMARKS.makeDefaultWatermark}
                </span>
              </div>
            </If>
            <div
              className={cn('picsioDefBtn btnCallToAction saveButton')}
              onClick={handleWatermarkApply}
            >
              Save
            </div>
          </div>
        </div>
        <div className="exampleItem">
          <div>
            <div>
              Example
            </div>
            <div className="chessBg watermarkExampleWindow">
              <div style={{ ...watermarkPositions[state && state.position] }}>
                <div
                  className="watermarkText"
                  style={{
                    fontSize, opacity: `${state && state.opacity}%`,
                  }}
                >
                  <If condition={state.type === 'text'}>
                    {state && state.text}
                  </If>
                  <If condition={state.type === 'image' && (file || state.imageUrl)}>
                    <img
                      style={{ objectFit: 'contain' }}
                      alt={file?.name || 'Pics.io'}
                      src={(file?.name && URL.createObjectURL(file)) || watermark.imageUrl}
                      width={`${300 * (state && state.size) / 100}px`}
                      height={`${250 * (state && state.size) / 100}px`}
                    />
                  </If>
                </div>
              </div>
            </div>
          </div>
          <WatermarkPosition
            handleChange={handleChange}
            positions={watermarkPositions}
            selected={state && state.position}
          />
        </div>
      </div>
    </div>
  );
};
WatermarkingDetailed.propTypes = {
  watermark: PropTypes.shape({
    isDefault: PropTypes.bool,
    name: PropTypes.string,
    opacity: PropTypes.number,
    position: PropTypes.string,
    size: PropTypes.number,
    text: PropTypes.string,
    type: PropTypes.oneOf(['text', 'image']),
    userId: PropTypes.string,
    _id: PropTypes.string,
    file: PropTypes.string,
    default: PropTypes.bool,
    imageUrl: PropTypes.string,
  }).isRequired,
  assetActions: PropTypes.objectOf(PropTypes.any).isRequired,
  watermarksLength: PropTypes.number.isRequired,
  canNotManageWatermarks: PropTypes.bool.isRequired,
};

export default WatermarkingDetailed;
