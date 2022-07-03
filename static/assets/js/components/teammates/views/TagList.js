import React from 'react';
import {
  array, func, bool, string,
} from 'prop-types';
import cn from 'classnames';
import uniq from 'lodash.uniq';
import union from 'lodash.union';
import throttle from 'lodash.throttle';
import * as utils from '../../../shared/utils';

import localization from '../../../shared/strings';
import Tag from '../../Tag';
import { Input } from '../../../UIComponents';

class TagList extends React.Component {
  constructor(props) {
    super(props);

    this.isPasting = null;

    this.state = {
      isInputFocused: false,
      items: this.props.items || [],
      value: this.props.value || '',
      error: '',
    };

    this.handleKeyDown = throttle(this.handleKeyDown.bind(this), 160);
  }

  static getDerivedStateFromProps(props, state) {
    if (props.items !== state.items) {
      return {
        items: props.items,
      };
    }
    return null;
  }

	handleChange = (event) => {
	  if (this.isPasting) return;
	  this.setState({ value: event.target.value });
	};

	handleFocus = () => {
	  this.setState({ isInputFocused: true });
	};

	handleBlur = (event, value) => {
	  this.setState({ isInputFocused: false });
	  if (value) {
	    this.setValue(event);
	  }
	};

	handleCheckValid = (value) => this.props.validate(value);

	setValue = (event, valueFromClipboard) => {
	  let { value } = event.currentTarget;
	  if (!value && valueFromClipboard) {
	    value = valueFromClipboard;
	  }
	  let { items } = this.state;
	  const { itemType } = this.props;
	  value = value.toLowerCase();

	  if (value === '') {

	  } else if (value.includes(',')) {
	    value = value.replace(/,  +/g, ',');
	    let values = value.split(',');
	    values = uniq(values);
	    // remove Whitespace-only Array values
	    values = values.map((item) => item.replace(/\s/g, '')).filter(Boolean);

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
	    this.setState({ items: validItems });
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
	      items.push(value);
	      this.clearInput();
	      this.setState({ items });
	      this.props.onSubmit(items);
	    }
	  }
	};

	removeItem = (item) => {
	  const { items } = this.state;

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

	  const { items, value } = this.state;
	  if (event.keyCode === keyCodes.ENTER && value === '' && items.length) {
	    return this.props.onSubmit(items, true);
	  }

	  if (event.keyCode === keyCodes.ENTER || event.keyCode === keyCodes.SPACE || event.keyCode === keyCodes.SEMICOLON) {
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

	handlePaste = (event) => {
	  const value = event.clipboardData.getData('Text');
	  if (this.handleCheckValid(value)) {
	    this.isPasting = true;
	    this.setValue(event, value);
	    setTimeout(() => (this.isPasting = null), 500);
	  }
	};

	clearInput = () => {
	  this.setState({ value: '' });
	};

	renderItems = () => {
	  const { state, props } = this;

	  return state.items.map((item) => {
	    const gSuiteUser = props.users.find((user) => user.email === item);
	    if (gSuiteUser) {
	      return (
	        <Tag type="user" avatar={gSuiteUser.avatar} key={item} text={item} onClose={() => this.removeItem(item)} />
	      );
	    }
	    return <Tag type="user" key={item} text={item} onClose={() => this.removeItem(item)} />;
	  });
	};

	render() {
	  const { state, props } = this;
	  const inputSize = props.placeholder.length || 10;

	  return (
	    <div
	      className={cn('tagList', {
	        tagListError: state.error,
	        isInputFocused: state.isInputFocused,
	        isDisabled: props.disabled,
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
	            onPaste={this.handlePaste}
  />
  </div>
  </div>
	      {state.error && <div className="tagListErrorText">{state.error}</div>}
  </div>
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
  validate: func,
  disabled: bool,
  className: string,
};
