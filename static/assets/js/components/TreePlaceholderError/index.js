import React from 'react';
import localization from '../../shared/strings';

import Icon from '../Icon';
import { Button } from '../../UIComponents';
import UpgradePlan from '../UpgradePlan';
import Spinner from './Spinner';
import '../TreePlaceholder/styles.scss';

/** Tree placeholder
 * @param {string} buttonId
 * @param {string} icon
 * @param {string} title
 * @param {string} description
 * @param {string} buttonText
 * @param {boolean} error
 * @param {boolean} isBusy
 * @param {Function?} validate
 * @param {Function} handleClick
 * @param {boolean?} isActionsAllowed
 * @param {boolean?} isFeatureAllowed
 */
export default function TreePlaceholderError({
  buttonId,
  icon,
  title,
  description,
  buttonText,
  error,
  isBusy,
  handleClick,
  isFeatureAllowed = true,
  isActionsAllowed = true,
}) {
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
        <Button
          id={`button-${buttonId}`}
          onClick={handleClick}
          disabled={isBusy}
          type="submit"
        >
          {buttonText}
        </Button>
      </If>
    </div>
  );
}
