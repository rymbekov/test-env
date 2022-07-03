import React from 'react';
import Keypress from '../../lib/keypress';
import * as utils from '../../shared/utils';
import ErrorBoundary from '../ErrorBoundary';
import catalogHotkeys from './catalog';
import previewHotkeys from './preview';
import previewPlayingVideoHotkeys from './previewPlayingVideo';
import screenHotkeys from './screen';
import selectionHotkeys from './selection';
import hotkeysSchema from './hotkeysSchema';
import treeEditHotkeys from './treeEdit';

import Shortcuts from './Shortcuts';

const keyListener = new Keypress.Listener();

let activeCategory;

const categories = {
  catalog: catalogHotkeys,
  selection: selectionHotkeys,
  preview: previewHotkeys,
  previewPlayingVideo: previewPlayingVideoHotkeys,
  screen: screenHotkeys,
  editTree: treeEditHotkeys,
};

const isMac = navigator.userAgent.toString().toLowerCase().includes('mac');

const getActiveCategory = () => {
  return activeCategory;
};

const createListener = (category, shortcut, event) => {
  let categoryName = category;
  if (categoryName === 'selection') categoryName = 'catalog';

  let keys = shortcut;

  if (!isMac) {
    if (shortcut.includes('command')) keys = shortcut.replace('command', 'ctrl');
    if (shortcut.includes('option')) keys = shortcut.replace('option', 'alt');
  }

  if (shortcut.includes('control')) shortcut.replace('control', 'command');

  const handler = () => {
    const customEvent = event || `hotkeys:${categoryName}:${utils.camelize(shortcut)}`;
    window.dispatchEvent(new Event(customEvent));
  };

  keyListener.register_combo({
    keys,
    on_keydown: () => false,
    on_keyup: handler,
    is_exclusive: true,
    is_solitary: true, // used only when click correct keys, without stuff
  });

  if (isMac && shortcut.includes('command')) {
    createListener(categoryName, shortcut.replace('command', 'control'), event);
  }
};

const bindHotkeys = (categoryName) => {
  if (getActiveCategory() === categoryName) return;

  activeCategory = categoryName;
  keyListener.reset();

  const { events } = categories[categoryName];

  Object.keys(events).forEach((shortcut) => {
    createListener(categoryName, shortcut, events[shortcut]);
  });
};

const copyPasteSwitcher = () => {
  if (window.getSelection().toString() === '') {
    keyListener.listen();
  } else {
    keyListener.stop_listening();
  }
};

export const initShortcuts = (defaultCategory) => {
  const types = ['text', 'date', 'number', 'password'];

  const focusable = ['INPUT', 'TEXTAREA', 'SELECT'];

  function isInput(e) {
    const event = window.e || e;
    if (event.target.isContentEditable) return true;
    if (focusable.includes(event.target.tagName)) return true;
    if (types.includes(event.target.type)) return true;
    return false;
  }

  function handleFocus(e) {
    if (isInput(e)) {
      keyListener.stop_listening();
      document.removeEventListener('mouseup', copyPasteSwitcher);
    }
  }

  function handleBlur(e) {
    if (isInput(e)) {
      keyListener.listen();
      document.addEventListener('mouseup', copyPasteSwitcher);
    }
  }

  document.addEventListener('focusin', handleFocus, false);
  document.addEventListener('focusout', handleBlur, false);
  document.addEventListener('mouseup', copyPasteSwitcher);

  window.addEventListener('screen:opened', bindHotkeys.bind(null, 'screen'), false);
  window.addEventListener('screen:closed', bindHotkeys.bind(null, 'catalog'), false);
  window.addEventListener('preview:opened', bindHotkeys.bind(null, 'preview'), false);
  window.addEventListener('preview:closed', bindHotkeys.bind(null, 'catalog'), false);
  window.addEventListener('selection:switched:on', bindHotkeys.bind(null, 'selection'), false);
  window.addEventListener('selection:switched:off', bindHotkeys.bind(null, 'catalog'), false);
  window.addEventListener('tree:edit:on', bindHotkeys.bind(null, 'editTree'), false);
  window.addEventListener('tree:edit:off', bindHotkeys.bind(null, 'catalog'), false);

  window.addEventListener(
    'preview:video:playing',
    bindHotkeys.bind(null, 'previewPlayingVideo'),
    false
  );
  window.addEventListener('preview:video:pausing', bindHotkeys.bind(null, 'preview'), false);

  if (defaultCategory) bindHotkeys(defaultCategory);
};

export default function ShortcutsScreen() {
  return (
    <div className="pageWrapper wrapperShortcuts">
      <ErrorBoundary className="errorBoundaryPage">
        <Shortcuts isMac={isMac} schema={hotkeysSchema} />
      </ErrorBoundary>
    </div>
  );
}
