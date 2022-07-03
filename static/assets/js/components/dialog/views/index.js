import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Input from '../../../UIComponents/input'; // eslint-disable-line
import Textarea from '../../../UIComponents/textarea';
import Checkbox from '../../../UIComponents/checkbox';
import Swipeable from '../../Swipeable';
import localization from '../../../shared/strings';
import Icon from '../../Icon';
import sanitizeXSS from '../../../shared/sanitizeXSS';

export default class Dialog extends React.Component {
  constructor(props) {
    super(props);

    const { icon, text, input, textarea, checkbox, disableOk, children } = props.data;

    if (!textarea && !input && !text && !children) {
      throw new Error('at least "text" or "children" is required for Alert');
    }

    if ((textarea || input) && icon) {
      throw new Error('"icon" is denied for prompts');
    }

    const state = {};
    input && (state.input = input.value);
    textarea && (state.textarea = textarea.value);
    checkbox && (state.checkbox = checkbox.value || false);
    disableOk && (state.isOkDisabled = disableOk(state));
    this.state = state;
  }

  componentDidMount() {
    this.ElInput && this.ElInput.focus();

    document.addEventListener('keydown', this.keyDownHandler);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.keyDownHandler);
  }

  onChangeInput = (e, value) => {
    const { input, disableOk } = this.props.data;

    this.setState({ input: value }, () => {
      disableOk && this.setState({ isOkDisabled: disableOk(this.state) });
    });

    input.onChange && input.onChange(e, value);
  };

  onChangeTextarea = (e, value) => {
    const { textarea, disableOk } = this.props.data;

    this.setState({ textarea: value }, () => {
      disableOk && this.setState({ isOkDisabled: disableOk(this.state) });
    });

    textarea.onChange && textarea.onChange(e, value);
  };

  onChangeCheckbox = (value) => {
    const { checkbox, disableOk } = this.props.data;

    this.setState({ checkbox: value }, () => {
      disableOk && this.setState({ isOkDisabled: disableOk(this.state) });
    });

    checkbox.onChange && checkbox.onChange(value);
  };

  onOk = () => {
    const { onOk } = this.props.data;

    if (!this.state.isOkDisabled) {
      this.destroy();

      onOk && onOk(this.state);
    }
  };

  onCancel = () => {
    const { onCancel } = this.props.data;

    this.destroy();

    onCancel && onCancel(this.state);
  };

  onClose = () => {
    const { onClose } = this.props.data;

    this.destroy();

    onClose && onClose(this.state);
  };

  destroy = () => {
    const { parentEl } = this.props;

    ReactDOM.unmountComponentAtNode(parentEl);
  };

  /** Keydown handler
   * @param {KeyboardEvent} event
   */
  keyDownHandler = (event) => {
    switch (event.keyCode) {
      // Enter
      case 13: {
        const inputIsntFocused = !['textarea'].includes(
          document.activeElement.tagName.toLowerCase()
        );
        inputIsntFocused && this.onOk();
        break;
      }
      // Esc
      case 27:
        this.onCancel();
        break;
    }
  };

  handleSwipeUp = (eventData) => {
    const { absY, dir, velocity } = eventData;
    if (absY > 50 && dir === 'Up' && velocity > 0.7) {
      const { onClose } = this.props.data;
      if (onClose) {
        this.onClose();
      } else {
        this.onCancel();
      }
    }
  };

  render() {
    const {
      title = 'Undefined',
      className = '',
      icon,
      text,
      input,
      textarea,
      checkbox,
      style,
      textBtnCancel = localization.DIALOGS.btnCancel,
      textBtnOk = localization.DIALOGS.btnOk,
      onClose,
      children,
      id,
    } = this.props.data;

    return (
      <Swipeable className="SwipeableDialog" onSwipedUp={this.handleSwipeUp}>
        <div className={`simpleDialog ${className}`}>
          <div className="simpleDialogUnderlayer" />
          <div className="simpleDialogBox" style={style && style}>
            <div className="simpleDialogHeader">
              <span className="simpleDialogTitle">{title}</span>
              <If condition={textBtnCancel !== null || textBtnOk !== null}>
                <span
                  className="simpleDialogBtnCross"
                  onClick={onClose ? this.onClose : this.onCancel}
                >
                  <Icon name="close" />
                </span>
              </If>
            </div>
            <div className="simpleDialogContent">
              <If condition={icon}>
                <div className="simpleDialogIcon">
                  <Icon name={icon} />
                </div>
              </If>
              <div className="simpleDialogContentInner">
                <If condition={children}>
                  <div className="simpleDialogDescription">{children}</div>
                </If>
                <If condition={text}>
                  <div
                    className="simpleDialogDescription"
                    dangerouslySetInnerHTML={{ __html: sanitizeXSS(text) }}
                  />
                </If>
                <If condition={input}>
                  <Input
                    {...input}
                    value={this.state.input}
                    onChange={this.onChangeInput}
                    customRef={(el) => {
                      this.ElInput = el;
                    }}
                  />
                </If>
                <If condition={textarea}>
                  <Textarea
                    {...textarea}
                    value={this.state.textarea}
                    onChange={this.onChangeTextarea}
                  />
                </If>
                <If condition={checkbox}>
                  <Checkbox
                    {...checkbox}
                    value={this.state.checkbox}
                    onChange={this.onChangeCheckbox}
                  />
                </If>
              </div>
            </div>
            <If condition={textBtnCancel !== null || textBtnOk !== null}>
              <div className="simpleDialogFooter">
                <If condition={textBtnCancel !== null}>
                  <span
                    className="simpleDialogFooterBtn simpleDialogFooterBtnCancel"
                    onClick={this.onCancel}
                  >
                    {textBtnCancel}
                  </span>
                </If>
                <If condition={textBtnOk !== null}>
                  <span
                    className={`simpleDialogFooterBtn ${this.state.isOkDisabled ? 'disabled' : ''}`}
                    onClick={this.onOk}
                    id={id}
                  >
                    {textBtnOk}
                  </span>
                </If>
              </div>
            </If>
          </div>
        </div>
      </Swipeable>
    );
  }
}

/** Prop types */
Dialog.propTypes = {
  data: PropTypes.shape({
    className: PropTypes.string,
    title: PropTypes.string,
    icon: PropTypes.string,
    text: PropTypes.string,
    input: PropTypes.object,
    textarea: PropTypes.object,
    checkbox: PropTypes.object,
    style: PropTypes.object,
    textBtnCancel: PropTypes.string, // to hide button "Cancel" use null
    textBtnOk: PropTypes.string, // to hide button "Ok" use null
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    onClose: PropTypes.func,
    disableOk: PropTypes.func,
    id: PropTypes.string, // needs to pass ID for Intercom init
  }),
  parentEl: PropTypes.instanceOf(Element),
};
