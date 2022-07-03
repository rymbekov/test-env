import React, { memo } from 'react';
import { bool, shape, string } from 'prop-types';
import ToolbarScreenTop from '../toolbars/ToolbarScreenTop';
import localization from '../../shared/strings';
import ua from '../../ua';
import { back } from '../../helpers/history';

function Shortcuts({ schema, isMAC }) {
  const handleDestroy = () => back('/search');
  const { title } = localization.SHORTCUTS;
  const schemaForRender = Object.entries(schema).map(([categoryName, categoryValue]) => ({
    name: categoryName,
    shortcuts: Object.entries(categoryValue).map(([shortcutName, shortcutValue]) => {
      let { value } = shortcutValue;
      if (isMAC && ua.browser.family === 'Safari') {
        if (shortcutName.indexOf('Color') !== -1) {
          value = value.replace('command', 'option');
        }
      }
      return {
        name: shortcutName,
        value,
      };
    }),
  }));

  return (
    <div className="page pageShortcuts">
      <ToolbarScreenTop title={[title]} onClose={handleDestroy} />
      <div className="pageContent">
        <div className="pageInnerContent">
          <div className="containerColumnsPopup">
            <For each="category" of={schemaForRender}>
              <div className="category" key={category.name}>
                <span className="titleCategory">{category.name}</span>
                <div className="list">
                  <For each="shortcut" of={category.shortcuts}>
                    <div key={shortcut.name}>
                      <span>{shortcut.value.replace(' ', ' • ')}</span>
                      <i>{shortcut.name}</i>
                    </div>
                  </For>
                </div>
              </div>
            </For>
          </div>
        </div>
      </div>
    </div>
  );
}

Shortcuts.defaultProps = { isMAC: false };

Shortcuts.propTypes = {
  isMAC: bool,
  schema: shape({
    [string]: shape({
      [string]: shape({
        value: string,
      }),
    }),
  }).isRequired,
};

export default memo(Shortcuts);
