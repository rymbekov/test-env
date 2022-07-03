import React, { useState } from 'react';
import localization from '../../shared/strings';

import Icon from '../Icon';
import { Button } from '../../UIComponents';
import UpgradePlan from '../UpgradePlan';
import Spinner from './Spinner';
import './styles.scss';

/** Tree placeholder
 * @param {string} buttonId
 * @param {string} icon
 * @param {string} title
 * @param {string} description
 * @param {string} createButtonText
 * @param {boolean} error
 * @param {boolean} isBusy
 * @param {Function?} validate
 * @param {Function} add
 * @param {boolean?} isActionsAllowed
 * @param {boolean?} isFeatureAllowed
 * @param {string?} additionalButtonId
 * @param {string?} additionalButtonText
 * @param {Function?} additionalButtonAction
 * @param {string?} additionalButtonClassName
 */
export default function TreePlacholder({
  buttonId,
  icon,
  title,
  description,
  createButtonText,
  error,
  isBusy,
  validate,
  add,
  isActionsAllowed = true,
  isFeatureAllowed = true,
  additionalButtonId,
  additionalButtonText,
  additionalButtonAction,
  additionalButtonClassName,
}) {
  const [isValid, setIsValid] = useState(error);
  const [value, setValue] = useState('');

  /**
   * Handle on input
   * @param {InboxEvent} event
   */
  const handleInputKeyDown = (event) => {
    if (!isFeatureAllowed) return;
    const ENTER = 13;
    const ESC = 27;
    switch (event.keyCode) {
    case ENTER: {
      event.stopPropagation();
      const { value } = event.target;
      add(value);
      break;
    }
    case ESC: {
      event.stopPropagation();
      setIsValid(false);
      setValue('');
      break;
    }
    }
  };

  const handleInputChange = (event) => {
    if (!isFeatureAllowed) return;
    const { value } = event.target;
    validate && validate(value);
    setValue(value);
  };

  const addHandler = () => {
    if (value && isValid) {
      if (!isFeatureAllowed) return;
      add(value);
    } else {
      setIsValid(false);
    }
  };

  return (
    <div className="treePlaceholder">
      <If condition={isBusy}>
        <Spinner />
      </If>
      <div className="treePlaceholderTitle">
        {title} {!isFeatureAllowed && <UpgradePlan />}
      </div>
      <div className="treePlaceholderIcon">
        <Icon name={icon} />
      </div>
      <div className="treePlaceholderDescription">{description}</div>
      <If condition={isActionsAllowed}>
        <>
          <div className="treePlaceholderInput">
            <input
              value={value}
              className={!isValid ? 'error' : null}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              placeholder={localization.TREE_PLACEHOLDER.enterNewName}
              type="text"
              autoFocus
              disabled={!isFeatureAllowed}
            />
          </div>
          <Button
            id={`button-${buttonId}`}
            onClick={addHandler}
            disabled={!value || !isValid}
            type="submit"
          >
            {createButtonText || localization.TREE_PLACEHOLDER.createNew}
          </Button>
          <If condition={additionalButtonId}>
            <Button
              id={`button-${additionalButtonId}`}
              className={additionalButtonClassName}
              onClick={additionalButtonAction}
              type="submit"
            >
              {additionalButtonText}
            </Button>
          </If>
        </>
      </If>
    </div>
  );
}
