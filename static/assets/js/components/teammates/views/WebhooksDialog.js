import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import localization from '../../../shared/strings';
import { Checkbox, Radio, Input } from '../../../UIComponents'; // eslint-disable-line
import Logger from '../../../services/Logger';
import Icon from '../../Icon';

class WebhooksDialog extends React.Component {
  constructor(props) {
    super(props);

    const data = props.data || {};

    this.state = {
      url: data.url || '',
      disabled: data.disabled || false,
      sendAll: !data.types,
      types: data.types || [],
    };
  }

  componentDidMount() {
    document.body.addEventListener('keydown', this.keyDownHandler);
    Logger.log('UI', 'WebhookDialog');
  }

  componentWillUnmount() {
    document.body.removeEventListener('keydown', this.keyDownHandler);
  }

	onOk = () => {
	  const { errors } = this.props;
	  const {
	    sendAll, url, types, disabled,
	  } = this.state;
	  // disable "Ok" button when user doesn't select any types
	  if (!url || (errors && errors.urlError) || (!sendAll && types.length === 0)) return;

	  const data = {
	    url,
	    disabled,
	  };

	  if (!sendAll) {
	    data.types = types;
	  }

	  Logger.log('User', 'WebhookDialogSave');
	  this.props.onOk(data);
	};

	onClose = () => {
	  Logger.log('User', 'WebhookDialogCancel');
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
	    this.props.validateUrl(event.target.value);
	    this.onOk();
	    break;
	  }
	  case 27: {
	    this.onClose();
	    break;
	  }
	  }
	};

	handleChangeUrl = (event) => {
	  this.setState({ url: event.target.value });
	};

	handleCheckType = (type) => {
	  let { types } = this.state;
	  if (types.includes(type)) {
	    types = types.filter((item) => item !== type);
	  } else {
	    types = [...types, type];
	  }

	  this.setState({ types });
	};

	handleSendAll = () => {
	  this.setState({ sendAll: true });
	};

	handleSendSelected = () => {
	  this.setState({ sendAll: false });
	};

	render() {
	  const {
	    title, style, textBtnOk, textBtnCancel, validateUrl, errors, webhookTypes,
	  } = this.props;
	  const { url, types, sendAll } = this.state;

	  return (
	    <div className="simpleDialog">
	      <div className="simpleDialogUnderlayer" />
	      <div className="simpleDialogBox" style={style}>
	        <div className="simpleDialogHeader">
	          <span className="simpleDialogTitle">{title}</span>
	          <span className="simpleDialogBtnCross" onClick={this.onClose}>
	            <Icon name="close" />
  </span>
  </div>
	        <div className="simpleDialogContent">
	          <div className="simpleDialogContentInner">
	            <div>
	              <Input
	                placeholder="http://domain.com"
	                label={localization.TEAMMATES.enterUrl}
	                value={url}
	                onChange={this.handleChangeUrl}
	                onBlur={(e, value) => validateUrl(value)}
	                error={errors && errors.urlError}
	                autoFocus
  />
  </div>
	            <div className="webhookFilter">
	              <Radio onChange={this.handleSendAll} value={sendAll} label={localization.TEAMMATES.sendAllTypes} />
	              <Radio
	                onChange={this.handleSendSelected}
	                value={!sendAll}
	                label={localization.TEAMMATES.sendSelectedTypes}
  />
  </div>
	            {!sendAll && (
  <div className="webhookTypes">
	                {webhookTypes.length === 0 && (
    <div className="webhookTypesIsEmpty">{localization.TEAMMATES.unableToLoadTypes}</div>
	                )}
	                {webhookTypes.map((item) => (
      <div className="webhookType" key={item}>
  <Checkbox
  onChange={(value) => this.handleCheckType(item, value)}
  value={types.includes(item)}
  label={item}
	                    />
	                  </div>
	                ))}
	              </div>
	            )}
  </div>
  </div>
	        <div className="simpleDialogFooter">
	          {textBtnCancel !== null && (
  <span className="simpleDialogFooterBtn simpleDialogFooterBtnCancel" onClick={this.onClose}>
	              {textBtnCancel}
	            </span>
	          )}
	          {textBtnOk !== null && (
  <span
	              className={cn('simpleDialogFooterBtn', {
	                disabled: !url || (errors && errors.urlError) || (!sendAll && types.length === 0),
	              })}
	              onClick={this.onOk}
	            >
	              {textBtnOk}
	            </span>
	          )}
  </div>
  </div>
  </div>
	  );
	}
}

/** Prop types */
WebhooksDialog.propTypes = {
  title: PropTypes.string,
  style: PropTypes.object,
  textBtnOk: PropTypes.string,
  textBtnCancel: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onOk: PropTypes.func,
  errors: PropTypes.object,
  webhookTypes: PropTypes.array,
};

/** Default props */
WebhooksDialog.defaultProps = {
  title: 'Undefined',
  style: {},
  textBtnOk: localization.DIALOGS.btnOk,
  textBtnCancel: localization.DIALOGS.btnCancel,
  onClose: () => {},
  onOk: () => {},
  errors: {},
  webhookTypes: [],
};

export default WebhooksDialog;
