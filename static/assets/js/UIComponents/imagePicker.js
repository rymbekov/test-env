import React from 'react';
import {
  string, bool, func, number,
} from 'prop-types';
import cn from 'classnames';
import localization from '../shared/strings';
import { pollImage } from '../helpers/images';
import { bytesToSize } from '../shared/utils';
import Logger from '../services/Logger';
import Icon from '../components/Icon';
import Spinner from './Spinner';
import Tooltip from '../components/Tooltip';
import { showErrorDialog } from '../components/dialog';

class ImagePicker extends React.Component {
  /** Prop types */
  static propTypes = {
    title: string,
    btnText: string,
    description: string,
    value: string,
    onChange: func,
    onRemove: func,
    icon: string,
    disabled: bool,
    showSpinner: bool,
    accept: string,
    maxFileSize: number,
  };

  static defaultProps = {
    onChange: Function.prototype,
    onRemove: Function.prototype,
    btnText: '',
    icon: '',
    accept: 'image/*',
  };

  state = {
    caption: this.props.value ? 'Change' : 'Upload',
    isRemoveBtnHover: false,
    isError: false,
  };

  componentWillUnmount() {
    if (this.poller) this.poller.stop();
  }

  handleMouseEnterRemove = (event) => {
    this.setState({ isRemoveBtnHover: true });
    event.preventDefault();
    event.stopPropagation();
  };

  handleMouseLeaveRemove = () => {
    this.setState({ isRemoveBtnHover: false });
  };

  handleError = async () => {
    if (this.props.value) {
      this.setState({ isError: true });
      this.poller = pollImage(this.props.value, 3000);
      try {
        await this.poller.promise;
        this.setState({ isError: false });
      } catch (err) {
        Logger.error(new Error('Error imagePicker image polling'), { error: err });
      }
      this.poller = null;
    }
  };

  handleLoad = () => {
    if (this.poller) this.poller.stop();
  };

  handleChange = (event) => {
    const { props } = this;
    const file = event.currentTarget.files[0];
    if (!file) return;

    if (props.maxFileSize && file.size > props.maxFileSize) {
      const { FILE_TO_LARGE } = localization.DIALOGS;
      showErrorDialog(
        FILE_TO_LARGE.TEXT(bytesToSize(props.maxFileSize), bytesToSize(file.size)),
        FILE_TO_LARGE.TITLE,
      );
    } else {
      this.props.onChange(file);
    }

    /** clear input value */
    event.currentTarget.value = '';
  };

  render() {
    const { state } = this;
    const {
      title,
      btnText,
      description,
      value,
      onRemove,
      icon,
      disabled,
      showSpinner,
      accept,
    } = this.props;

    const caption = this.props.value
      ? state.isRemoveBtnHover
        ? 'Delete'
        : 'Change'
      : `${btnText}`;
    const isIconUploadVisible = !state.isRemoveBtnHover || !value;

    return (
      <Tooltip content={description} placement="top" hideTooltip={state.isRemoveBtnHover}>
        <div
          className={cn('UIImagePicker', { UIImagePicker__uploaded: value, isDisabled: disabled })}
          data-tooltip={description}
        >
          <div className={cn(`UIImagePicker__preview icon-${icon}`, { chessBg: value })}>
            {(state.isError || showSpinner) && <Spinner />}
            {value && !state.isError ? (
              <div className="UIImagePicker__preview__img">
                <img
                  src={value}
                  width="100%"
                  height="100%"
                  onLoad={this.handleLoad}
                  onError={this.handleError}
                />
              </div>
            ) : (
              <Icon name={icon} />
            )}
            {!value && title && <div className="UIImagePicker__title">{title}</div>}
          </div>
          <div className="UIImagePicker__content">
            {isIconUploadVisible && <Icon name="upload" />}
            {state.caption && <div className="UIImagePicker__content__caption">{caption}</div>}
          </div>
          <div className="UIImagePicker__file">
            <input type="file" accept={accept} onChange={this.handleChange} />
          </div>
          {value && (
            <span
              className="UIImagePicker__remove"
              onClick={onRemove}
              onMouseEnter={this.handleMouseEnterRemove}
              onMouseLeave={this.handleMouseLeaveRemove}
            >
              <Icon name="close" />
            </span>
          )}
        </div>
      </Tooltip>
    );
  }
}

export default ImagePicker;
