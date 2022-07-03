import React from 'react';
import { shape, bool, func } from 'prop-types';
import { Menu, IconButton, MenuItem, MenuItemIcon, MenuItemText, Icon } from '@picsio/ui';
import { SettingsAdvanced, CheckIcon } from '@picsio/ui/dist/icons';

const TEXT_FOR_OPTIONS = {
  phraseSearch: 'Phrase search',
  caseSensitive: 'Case sensitive',
  entireWord: 'Entire word',
  highlightAll: 'Highlight all',
};

function SearchOptions({ options, setOptions }) {
  const ref = React.useRef();
  const [showOptions, setShowOptions] = React.useState(false);

  const toggleOptions = () => setShowOptions(!showOptions);

  return (
    <>
      <IconButton ref={ref} onClick={toggleOptions}>
        <SettingsAdvanced />
      </IconButton>
      <Menu
        target={ref}
        isOpen={showOptions}
        onClose={toggleOptions}
        padding="s"
        placement="bottom-end"
        outsideClickListener
      >
        {Object.keys(options).map((name) => (
          <MenuItem
            key={name}
            onClick={() => setOptions({ ...options, [name]: !options[name] })}
            className="menuItemDefault"
          >
            <MenuItemIcon size="sm">
              <If condition={options[name]}>
                <Icon>
                  <CheckIcon />
                </Icon>
              </If>
              <If condition={!options[name]}>
                <></>
              </If>
            </MenuItemIcon>
            <MenuItemText primary={TEXT_FOR_OPTIONS[name]} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

SearchOptions.defaultProps = { setOptions: () => {} };

SearchOptions.propTypes = {
  options: shape({
    phraseSearch: bool,
    caseSensitive: bool,
    entireWord: bool,
    highlightAll: bool,
  }).isRequired,
  setOptions: func,
};

export default SearchOptions;
