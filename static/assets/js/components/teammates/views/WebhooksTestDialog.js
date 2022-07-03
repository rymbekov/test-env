import React from 'react';
import PropTypes from 'prop-types';
import localization from '../../../shared/strings';
import { Select } from '../../../UIComponents'; // eslint-disable-line
import Logger from '../../../services/Logger';
import Icon from '../../Icon';

class WebhooksTestDialog extends React.Component {
  constructor(props) {
    super(props);

    const options = this.props.webhookTypes.map((item) => ({ text: item, value: item }));

    this.state = {
      url: props.url,
      options,
      type: options[0].value,
    };
  }

  componentDidMount() {
    document.body.addEventListener('keydown', this.keyDownHandler);
    Logger.log('UI', 'WebhookTestDialog');
  }

  componentWillUnmount() {
    document.body.removeEventListener('keydown', this.keyDownHandler);
  }

  onOk = () => {
    const { url, type } = this.state;
    Logger.log('User', 'WebhookTestDialogSend');
    this.props.onOk({ url, type });
  };

  onClose = () => {
    Logger.log('User', 'WebhookTestDialogCancel');
    this.props.onClose();
  };

  /** Keydown handler listen for
   * @param {KeyboardEvent} event
   */
  keyDownHandler = (event) => {
    event.stopPropagation();
    switch (event.keyCode) {
    // Enter
    case 13: {
      this.onOk();
      break;
    }
    // Esc
    case 27: {
      this.onClose();
      break;
    }
    }
  };

  handleChangeSelectType = (type) => {
    this.setState({ type });
  };

  render() {
    const { state, props } = this;

    return (
      <div className="simpleDialog">
        <div className="simpleDialogUnderlayer" />
        <div className="simpleDialogBox" style={props.style}>
          <div className="simpleDialogHeader">
            <span className="simpleDialogTitle">{props.title}</span>
            <span className="simpleDialogBtnCross" onClick={this.onClose}>
              <Icon name="close" />
            </span>
          </div>
          <div className="simpleDialogContent">
            <div className="simpleDialogContentInner">
              <Select
                label={localization.TEAMMATES.eventType}
                options={state.options}
                value={state.type}
                onChange={(event, value) => {
                  this.handleChangeSelectType(value);
                }}
              />
            </div>
          </div>
          <div className="simpleDialogFooter">
            {props.textBtnCancel !== null && (
              <span className="simpleDialogFooterBtn simpleDialogFooterBtnCancel" onClick={this.onClose}>
                {props.textBtnCancel}
              </span>
            )}
            {props.textBtnOk !== null && (
              <span className="simpleDialogFooterBtn" onClick={this.onOk}>
                {props.textBtnOk}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
}

/** Prop types */
WebhooksTestDialog.propTypes = {
  title: PropTypes.string,
  style: PropTypes.object,
  textBtnOk: PropTypes.string,
  textBtnCancel: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onOk: PropTypes.func,
  webhookTypes: PropTypes.array,
};

/** Default props */
WebhooksTestDialog.defaultProps = {
  title: 'Undefined',
  style: {},
  textBtnOk: localization.DIALOGS.btnOk,
  textBtnCancel: localization.DIALOGS.btnCancel,
  onClose: () => {},
  onOk: () => {},
  webhookTypes: [],
};

export default WebhooksTestDialog;
