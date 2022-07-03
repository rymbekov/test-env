import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import { Radio, Checkbox } from '../../../UIComponents'; // eslint-disable-line
import { getRadios, text, checkboxText } from '../config'; // eslint-disable-line
import localization from '../../../shared/strings';
import Logger from '../../../services/Logger';
import Icon from '../../Icon';
import Store from '../../../store';
import UpgradePlan from '../../UpgradePlan';

export default class ResolveDuplicatesDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      radios: getRadios(Store.getState().user.team.storageType === 's3', props.showRenameOption, props.showAddRevision),
      applyToAll: false,
      imageSrc: null,
    };

    this.onChangeRadio = this.onChangeRadio.bind(this);
    this.submit = this.submit.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  async componentDidMount() {
    Logger.log('UI', 'ResolveDuplicatesDialog');
    let smallThumbnailUrl;
    try {
      const [thumbnail] = await this.props.getThumbnailUrls();
      smallThumbnailUrl = thumbnail.thumbnailLink;
    } catch (err) {
      Logger.error(new Error('ResolveDuplicatesDialog: can not get thumbnail'), { error: err });
    }

    this.setState({ imageSrc: smallThumbnailUrl });
    document.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  /**
	 * On keydown
	 * @param {KeyboardEvent} event
	 */
  onKeyDown(event) {
    switch (event.keyCode) {
    // if press Esc
    case 27:
      this.props.close();
      break;

      // if press Enter
    case 13:
      this.submit();
    }
  }

  /**
	 * On click on Radio
	 * @param {number} _index
	 */
  onChangeRadio(_index) {
    const { radios } = this.state;
    radios.forEach((radio, index) => {
      if (index === _index) {
        radio.checked = true;
      } else {
        radio.checked = false;
      }
    });

    this.setState({ radios });
  }

  submit() {
    const { radios, applyToAll } = this.state;
    const { submit, close, showApplyAll } = this.props;

    Logger.log('User', 'ResolveDuplicatesDialogSubmit');
    close();
    submit(radios.find((radio) => radio.checked).value, showApplyAll && applyToAll);
  }

  handleClose() {
    Logger.log('User', 'ResolveDuplicatesDialogCancel');
    this.props.close();
  }

  render() {
    const { subscriptionFeatures } = Store.getState().user;
    const { showApplyAll, fileInfo } = this.props;
    const { radios, applyToAll, imageSrc } = this.state;

    return (
      <div className="simpleDialog duplicatesDialog">
        <div className="simpleDialogUnderlayer" />
        <div className="simpleDialogBox">
          {/* header */}
          <div className="simpleDialogHeader">
            <span className="simpleDialogTitle">{localization.RESOLVEDUPLICATESDIALOG.titleFileAlreadyExists}</span>
            <span className="simpleDialogBtnCross" onClick={this.handleClose}>
              <Icon name="close" />
            </span>
          </div>

          {/* content */}
          <div className="simpleDialogContent">
            <div className="simpleDialogContentInner">
              {/* file info */}
              <div className="duplicatesDialog__fileInfo">
                <div className="duplicatesDialog__name">{fileInfo.name}</div>
                <div className="duplicatesDialog__preview">
                  {imageSrc != null ? <img src={imageSrc} /> : <Icon name="files" />}
                </div>
                <div className="duplicatesDialog__data">
                  <div className="duplicatesDialog__dataItem">
                    <Icon name="duplicateCreated" />
                    {/* {Date.create(fileInfo.createdAt).short()} */}
                    {dayjs(fileInfo.createdAt).format('l')}
                  </div>
                  {fileInfo.tags && fileInfo.tags.length > 0 && (
                    <div className="duplicatesDialog__dataItem">
                      <Icon name="duplicateTags" />
                      {fileInfo.tags.map((t) => t.path).join(',')}
                    </div>
                  )}
                </div>
              </div>
              {/* text */}
              <div className="duplicatesDialog__text">
                <p>{text}</p>
                <ul className="duplicatesDialog__radioList">
                  {radios.map((radio, index) => {
                    let isNotAllowed = false;
                    if (radio.dependentOn) {
                      isNotAllowed = !subscriptionFeatures[[radio.dependentOn]];
                    }
                    return (
                      <li key={index}>
                        <Radio
                          label={radio.label}
                          value={radio.checked}
                          onChange={() => this.onChangeRadio(index)}
                          disabled={isNotAllowed}
                        />
                        <If condition={isNotAllowed}>
                          <UpgradePlan tooltip={localization.UPGRADE_PLAN.tooltipPlanLimitations} />
                        </If>
                      </li>
                    );
                  })}
                </ul>
                {showApplyAll && (
                  <Checkbox
                    value={applyToAll}
                    label={checkboxText}
                    onChange={() => this.setState({ applyToAll: !applyToAll })}
                  />
                )}
              </div>
            </div>
          </div>

          {/* footer */}
          <div className="simpleDialogFooter">
            <span className="simpleDialogFooterBtn simpleDialogFooterBtnCancel" onClick={this.handleClose}>
              {localization.DIALOGS.btnCancel}
            </span>
            <span className="simpleDialogFooterBtn" onClick={this.submit}>
              {localization.DIALOGS.btnOk}
            </span>
          </div>
        </div>
      </div>
    );
  }
}

/** Prop types */
ResolveDuplicatesDialog.propTypes = {
  fileInfo: PropTypes.object.isRequired,
  showRenameOption: PropTypes.bool,
  showAddRevision: PropTypes.bool,
  submit: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  getThumbnailUrls: PropTypes.func.isRequired,
  showApplyAll: PropTypes.bool,
};

/** Default props */
ResolveDuplicatesDialog.defaultProps = {
  showApplyAll: false,
};
