import React, {
  memo, useMemo, useState, useCallback, useRef,
} from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import {
  Menu, IconButton, MenuItem, MenuItemIcon, MenuItemText,
} from '@picsio/ui';
import Icon from '../../Icon';
import localization from '../../../shared/strings';
import Logger from '../../../services/Logger';

const LockMenu = (props) => {
  const {
    currentLock,
    toggleEditable,
    detailsPanelEditable,
    disabled,
  } = props;
  const ref = useRef();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const toggleMenu = useCallback(() => setMenuOpen((prevValue) => !prevValue), []);

  function generateButtons() {
    const controls = [];
    const lockText = currentLock ? localization.DETAILS.textUnlock : localization.DETAILS.textLock;
    const { unlockAlways, unlockLogout, lockAlways } = detailsPanelEditable;

    controls.push({
      id: 'menuLockUnlock',
      text: lockText,
      onClick: () => {
        toggleEditable('locked');
        Logger.log('User', 'InfoPanelChangeLock', lockText);
      },
      icon: () => <></>,
    });

    controls.push({
      id: 'menuUnlockAlways',
      text: localization.DETAILS.textUnlockAlways,
      onClick: () => {
        toggleEditable('unlockAlways');
        Logger.log('User', 'InfoPanelChangeLock', 'AlwaysUnlock');
      },
      // eslint-disable-next-line jsx-control-statements/jsx-use-if-tag
      icon: () => (unlockAlways ? <Icon name="ok" /> : <></>),
    });

    controls.push({
      id: 'menuUnlockLogout',
      text: localization.DETAILS.textUnlockLogout,
      onClick: () => {
        toggleEditable('unlockLogout');
        Logger.log('User', 'InfoPanelChangeLock', 'UnlockUntilLogout');
      },
      // eslint-disable-next-line jsx-control-statements/jsx-use-if-tag
      icon: () => (unlockLogout ? <Icon name="ok" /> : <></>),
    });

    controls.push({
      id: 'menuLockAlways',
      text: localization.DETAILS.textLockAlways,
      onClick: () => {
        toggleEditable('lockAlways');
        Logger.log('User', 'InfoPanelChangeLock', 'AlwaysLock');
      },
      // eslint-disable-next-line jsx-control-statements/jsx-use-if-tag
      icon: () => (lockAlways ? <Icon name="ok" /> : <></>),
    });

    return controls;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedControls = useMemo(() => generateButtons(), [currentLock, detailsPanelEditable]);

  return (
    <>
      <IconButton
        ref={ref}
        buttonSize="default"
        className={cn({ isActive: isMenuOpen })}
        color="default"
        component="button"
        disabled={disabled}
        id="lockMenuOpener"
        onClick={toggleMenu}
        size="md"
      >
        <Icon name={currentLock ? 'lock' : 'unlock'} />
      </IconButton>
      <Menu
        target={ref}
        arrow
        padding="s"
        placement="bottom-end"
        isOpen={isMenuOpen}
        onClose={toggleMenu}
        outsideClickListener
      >
        {memoizedControls.map((control) => {
          const {
            id, text, onClick, icon: ControlIcon,
          } = control;

          return (
            <MenuItem
              key={id}
              id={id}
              onClick={() => {
                onClick();
                toggleMenu();
              }}
              className="menuItemDefault menuItemLock"
            >
              <MenuItemIcon size="sm">
                <ControlIcon />
              </MenuItemIcon>
              <MenuItemText primary={text} />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

LockMenu.defaultProps = {
  currentLock: false,
  detailsPanelEditable: {
    unlockAlways: false,
    unlockLogout: false,
    lockAlways: false,
  },
  disabled: false,
};

LockMenu.propTypes = {
  detailsPanelEditable: PropTypes.shape({
    unlockAlways: PropTypes.bool,
    unlockLogout: PropTypes.bool,
    lockAlways: PropTypes.bool,
  }),
  currentLock: PropTypes.bool,
  toggleEditable: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default memo(LockMenu);
