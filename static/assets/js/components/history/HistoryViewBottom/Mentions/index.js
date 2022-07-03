import React from 'react';
import { findDOMNode } from 'react-dom';
import ua from '../../../../ua';

import store from '../../../../store';
import * as utils from '../../../../shared/utils';

import UserItem from './Item';

const KEY_ENTER = 13;
const KEY_ARR_TOP = 38;
const KEY_ARR_BOTTOM = 40;

class Mentions extends React.Component {
  state = {
    isVisible: false,
    value: null,
    team: store.getState().teammates.items,
    activeIndex: 0,
  };

  componentDidMount() {
    this.$textarea = findDOMNode(this);

    this.$textarea.addEventListener('mousedown', this.onTextareaCursorMoved);
    this.$textarea.addEventListener('mouseup', this.onTextareaCursorMoved);
    this.$textarea.addEventListener('keydown', this.onKeydownTextarea);
    this.$textarea.addEventListener('keyup', this.onTextareaCursorMoved);
    this.$textarea.addEventListener('keyup', this.onKeyupTextarea);
  }

  componentWillUnmount() {
    this.$textarea.removeEventListener('mousedown', this.onTextareaCursorMoved);
    this.$textarea.removeEventListener('mouseup', this.onTextareaCursorMoved);
    this.$textarea.removeEventListener('keydown', this.onKeydownTextarea);
    this.$textarea.removeEventListener('keyup', this.onTextareaCursorMoved);
    this.$textarea.removeEventListener('keyup', this.onKeyupTextarea);
  }

  onTextareaCursorMoved = (e) => {
    if (this.state.isVisible && (e.keyCode === KEY_ARR_TOP || e.keyCode === KEY_ARR_BOTTOM || e.keyCode === KEY_ENTER)) { return; }

    const caretPosition = utils.getCaretPositionEditableDiv(this.$textarea);
    const indexOfSignAt = this.$textarea.innerHTML.slice(0, caretPosition).search(/@[^@]*$/);
    let textareaText = this.$textarea.innerHTML;
    if (ua.browser.family === 'Firefox') {
      // fix Firefox bugs with <br> in 'contenteditable'
      if (this.$textarea.innerHTML === ' <br>') {
        textareaText = textareaText.replace(' <br>', '');
      }
      textareaText = textareaText.replace('&nbsp; br&gt;', '');
      textareaText = textareaText.replace('@<br>', '@');
      textareaText = textareaText.replace('@ ', '@');
    }

    const value = textareaText.slice(indexOfSignAt + 1, caretPosition).toLowerCase();
    if (indexOfSignAt === -1 || value.includes(' ') || value.includes('&nbsp')) {
      this.setValue(null);
    } else {
      this.setValue(value);
    }
  };

  onKeydownTextarea = (e) => {
    const { state } = this;
    if (state.value === null || state.filteredTeam.length == 0) return;

    switch (e.keyCode) {
    case KEY_ARR_TOP: {
      e.preventDefault();
      if (state.activeIndex > 0) {
        this.setState({ activeIndex: state.activeIndex - 1 });
      }
      break;
    }
    case KEY_ARR_BOTTOM: {
      e.preventDefault();
      if (state.activeIndex < state.filteredTeam.length - 1) {
        this.setState({ activeIndex: state.activeIndex + 1 });
      }
      break;
    }
    case KEY_ENTER: {
      e.preventDefault();
      e.stopPropagation();
      this.submit();
    }
    }
  };

  onKeyupTextarea = (e) => {
    if (!e.currentTarget.textContent) {
      // hack to prevent auto adding font tag
      const tNode = document.createTextNode('');
      this.$textarea.appendChild(tNode);

      const range = document.createRange();
      const sel = window.getSelection();
      range.setStart(tNode, 0);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  setValue = (value) => {
    const { state } = this;
    if (value === state.value) return;

    let filteredTeam = state.team;
    if (value !== null && value !== '') {
      filteredTeam = state.team.filter(
        (member) => member.email.toLowerCase().includes(value)
          || member.displayName.toLowerCase().includes(value)
          || member.slackUserId.toLowerCase().includes(value),
      );
    }

    this.setState({ value, activeIndex: 0, filteredTeam });
  };

  submit = (_index) => {
    const { state } = this;

    const index = typeof _index === 'number' ? _index : state.activeIndex;
    const caretPosition = utils.getCaretPositionEditableDiv(this.$textarea);
    const indexOfSignAt = this.$textarea.innerHTML.slice(0, caretPosition).search(/@[^@]*$/);
    const userName = state.filteredTeam[index].displayName;
    const userId = state.filteredTeam[index]._id;

    const start = this.$textarea.innerHTML.slice(0, indexOfSignAt);
    const center = `<mention class="mentionedUserTextarea" data-id="${userId}">@${userName}</mention>&nbsp; `;
    const end = this.$textarea.innerHTML.slice(caretPosition);

    this.$textarea.innerHTML = start + center + end;

    this.setValue(null);

    const range = document.createRange();
    const sel = window.getSelection();
    range.setStart(this.$textarea.querySelector(`[data-id="${userId}"]`).nextSibling, 1);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);

    const observer = new MutationObserver((mutations) => {
      observer.disconnect();
      mutations.forEach((mutation) => {
        const tNode = document.createTextNode('@');
        mutation.target.parentElement.replaceWith(tNode);

        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(tNode, 1);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      });
    });

    observer.observe(this.$textarea.querySelector(`[data-id="${userId}"]`), {
      subtree: true,
      characterData: true,
    });
  };

  render() {
    const { state, props } = this;
    return [
      props.children,
      <div key="dropdown" className="mentionTeamMember">
        {state.value !== null
          && state.filteredTeam.map((member, index) => (
            <UserItem
              key={member._id}
              user={member}
              index={index}
              activeIndex={state.activeIndex}
              submit={this.submit}
            />
          ))}
      </div>,
    ];
  }
}

export default Mentions;
