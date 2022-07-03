import React from 'react';
import {
  array, func, bool, string,
} from 'prop-types';
import cn from 'classnames';

import uniq from 'lodash.uniq';
import union from 'lodash.union';
import throttle from 'lodash.throttle';
import Tag from '../Tag';
import { Input } from '../../UIComponents';
import localization from '../../shared/strings';
import * as utils from '../../shared/utils';

class TagList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isInputFocused: false,
      items: this.props.items || [],
      value: this.props.value || '',
      error: '',
    };

    this.handleKeyDown = throttle(this.handleKeyDown.bind(this), 160);
  }

  static getDerivedStateFromProps(props, state) {
    if (props.items && props.items !== state.items) {
      return {
        items: props.items,
      };
    }
    return null;
  }

	handleChange = (event) => {
	  this.setState({ value: event.target.value });
	};

	handleFocus = () => {
	  this.setState({ isInputFocused: true });
	};

	handleBlur = (event) => {
	  const { value } = this.state;

	  this.setState({ isInputFocused: false });

	  if (value) {
	    this.setValue(event);
	  }
	};

	handleCheckValid = (value) => this.props.validate(value);

	setValue = (event) => {
	  let { value } = event.currentTarget;
	  let { items } = this.state;
	  const { itemType } = this.props;
	  value = value.toLowerCase();

	  if (value === '') {
	    this.setState({ error: localization.TAGLIST.errorItemIsEmpty });
	  } else if (value.includes(',')) {
	    value = value.replace(/,  +/g, ',');
	    let values = value.split(',');
	    values = uniq(values);
	    // remove Whitespace-only Array Elements
	    values = values.map((item) => item.replace(/\s/g, ''));

	    items = union(items, values);

	    const validItems = [];
	    const notValidItems = [];
	    items.forEach((item) => {
	      if (!this.handleCheckValid(item)) {
	        notValidItems.push(item);

	        const stringItems =						notValidItems.length > 1
						  ? `${itemType}s ${notValidItems.join(', ')} are`
						  : `${itemType} ${notValidItems[0]} is`;
	        const errorString = localization.TAGLIST.errorItemsNotValid.replace('{types}', stringItems);
	        this.setState({ error: errorString });
	      } else {
	        validItems.push(item);
	      }
	    });
	    this.clearInput();
	    this.setState({ items: [...validItems] });
	    this.props.onSubmit(validItems);
	  } else if (!this.handleCheckValid(value)) {
	    this.setState({ error: localization.TAGLIST.errorItemNotValid.replace('{type}', itemType) });
	  } else if (items.includes(value)) {
	    this.setState({ error: localization.TAGLIST.errorItemAlreadyAdded.replace('{type}', itemType) });
	  } else {
	    this.setState({
	      error: '',
	    });

	    if (!items.includes(value)) {
	      const newItems = [...items, value];
	      this.clearInput();
	      this.setState({ items: newItems });
	      this.props.onSubmit(newItems);
	      this.props.onBlur(newItems);
	    }
	  }
	};

	removeItem = (item) => {
	  const {
	    items: [...items],
	  } = this.state;

	  if (!item) {
	    return;
	  }

	  const itemIndex = items.findIndex((el) => el === item);
	  if (itemIndex === -1) {
	    return;
	  }

	  items.splice(itemIndex, 1);
	  this.setState({ items });
	  this.props.onSubmit(items);
	};

	removeLastItem = () => {
	  const { value, items } = this.state;

	  if (value === '' || value === undefined) {
	    if (items.length > 0) {
	      this.removeItem(items[items.length - 1]);
	    }
	  }
	};

	handleKeyDown = (event) => {
	  if (this.state.error) {
	    this.setState({
	      error: '',
	    });
	  }
	  const keyCodes = {
	    BACKSPACE: 8,
	    ENTER: 13,
	    SPACE: 32,
	    COMMA: 180,
	    SEMICOLON: 186,
	    ESC: 27,
	  };

	  if (event.keyCode === keyCodes.BACKSPACE) {
	    this.removeLastItem();
	  }

	  if (
	    event.keyCode === keyCodes.ENTER
			|| event.keyCode === keyCodes.SPACE
			|| event.keyCode === keyCodes.COMMA
			|| event.keyCode === keyCodes.SEMICOLON
	  ) {
	    event.preventDefault();
	    this.setValue(event);
	  }

	  if (event.keyCode === keyCodes.ESC) {
	    if (this.state.value === '') {
	      return;
	    }
	    this.clearInput();
	  }
	};

	clearInput = () => {
	  this.setState({ value: '' });
	};

	renderItems = () => {
	  const { items } = this.state;

	  return items.map((item, index) => (
  <Tag
  type={this.props.itemType === 'email' && 'user'}
  key={item + index}
  text={item}
  onClose={() => this.removeItem(item)}
	    />
	  ));
	};

	render() {
	  const { state, props } = this;
	  const inputSize = props.placeholder.length || 10;

	  return (
	    <>
    {Boolean(props.label) && <div className="UIInput__label">{props.label}</div>}
    <div
  className={cn('tagList', {
	          tagListError: state.error || props.errors,
	          isInputFocused: state.isInputFocused,
	          isDisabled: this.props.disabled,
	          [props.className]: props.className,
	        })}
	      >
  <div className="tagListTags">
  {this.renderItems()}
  <div className="tagListFilter">
  <Input
  isDefault
  type="text"
  value={state.value}
  size={inputSize}
  placeholder={props.placeholder}
  onFocus={this.handleFocus}
  onChange={this.handleChange}
  onKeyDown={this.handleKeyDown}
  onBlur={this.handleBlur}
	            />
	          </div>
	        </div>
  {state.error && <div className="tagListErrorText">{state.error}</div>}
  {props.errors && (
	          <div className="tagListErrorText">
    {props.errors.map((error, index) => (
  <div key={index}>{error}</div>
	            ))}
  </div>
	        )}
	      </div>
  </>
	  );
	}
}

export default TagList;

/** Default props */
TagList.defaultProps = {
  itemType: 'email',
  validate: utils.isValidEmailAddress,
};

TagList.propTypes = {
  items: array,
  placeholder: string,
  itemType: string,
  value: string,
  error: string,
  errors: array,
  onSubmit: func,
  onBlur: func,
  validate: func,
  disabled: bool,
  className: string,
  label: string,
};
