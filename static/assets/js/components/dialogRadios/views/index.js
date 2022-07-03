import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import localization from '../../../shared/strings';
import HelpButton from '../../toolbars/HelpButton';
import Icon from '../../Icon';

import { Radio, Checkbox } from '../../../UIComponents'; // eslint-disable-line

export default class DialogRadios extends React.Component {
  constructor(props) {
    super(props);

    const { checkbox } = props;

    const state = {};
    checkbox && (state.checkbox = checkbox.value || false);

    this.state = {
      ...state,
      checkedIndex: props.items.findIndex((item) => item.checked),
    };

    this.onOk = this.onOk.bind(this);
    this.keyDownHandler = this.keyDownHandler.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.keyDownHandler);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.keyDownHandler);
  }

  onOk() {
    const { items } = this.props;
    const { checkedIndex, checkbox } = this.state;
    this.props.onOk(items[checkedIndex].value, checkbox);
  }

	onChangeCheckbox = (value) => {
	  const { checkbox, disableOk } = this.props;

	  this.setState({ checkbox: value }, () => {
	    disableOk && this.setState({ isOkDisabled: disableOk(this.state) });
	  });

	  checkbox.onChange && checkbox.onChange(value);
	};

	/** Keydown handler
	 * @param {KeyboardEvent} event
	 */
	keyDownHandler(event) {
	  switch (event.keyCode) {
	  // Enter
	  case 13: {
	    this.onOk();
	    break;
	  }
	  // Esc
	  case 27:
	    this.props.onClose();
	    break;
	  }
	}

	render() {
	  const {
	    title, style, textBtnOk, textBtnCancel, onClose, onCancel, items, checkbox, helpLink, description, text,
	  } = this.props;
	  const { checkedIndex } = this.state;
	  return (
  <div className="simpleDialog">
  <div className="simpleDialogUnderlayer" />
  <div className="simpleDialogBox" style={style}>
  <div className="simpleDialogHeader">
  <span className="simpleDialogTitle">{title}</span>
  {helpLink && <HelpButton icon="question" tooltipPosition="bottom" component={helpLink} />}
  <span className="simpleDialogBtnCross" onClick={onClose}>
  <Icon name="close" />
	          </span>
	        </div>
  <div className="simpleDialogContent">
  <div className="simpleDialogContentInner">
  <If condition={text}>
  <div style={{ marginBottom: '15px' }}>{text}</div>
	            </If>
  {items && items.length > 0 && (
	              <ul className={cn('radiosDialog__list', { hasDescription: description })}>
    {items.map((item, index) => (
  <li key={index}>
  <div className="radiosDialog__icon">
  {item.classList && item.classList.length > 0 && <Icon name={item.classList.join(' ')} />}
	                    </div>
  <Radio
  label={`<b>${item.label}</b><br/>${item.description}`}
  value={index === checkedIndex}
  onChange={() => this.setState({ checkedIndex: index })}
	                    />
	                  </li>
	                ))}
  </ul>
	            )}
  {checkbox && <Checkbox {...checkbox} value={this.state.checkbox} onChange={this.onChangeCheckbox} />}
  <If condition={description}>
  <div className="simpleDialogDescription">
  {description}
	              </div>
	            </If>
	          </div>
	        </div>
  <div className="simpleDialogFooter">
  {textBtnCancel !== null && (
	            <span className="simpleDialogFooterBtn simpleDialogFooterBtnCancel" onClick={onCancel || onClose}>
    {textBtnCancel}
  </span>
	          )}
  {textBtnOk !== null && (
	            <span className="simpleDialogFooterBtn" onClick={this.onOk}>
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
DialogRadios.propTypes = {
  title: PropTypes.string,
  textBtnOk: PropTypes.string,
  textBtnCancel: PropTypes.string,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      checked: PropTypes.bool,
      classList: PropTypes.array,
      label: PropTypes.string,
      description: PropTypes.string,
      value: PropTypes.string,
    }),
  ),
  checkbox: PropTypes.object,
  style: PropTypes.object,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

/** Default props */
DialogRadios.defaultProps = {
  title: 'Undefined',
  textBtnOk: localization.DIALOGS.btnOk,
  textBtnCancel: localization.DIALOGS.btnCancel,
  style: {},
  onCancel: () => {},
  onOk: () => {},
};
