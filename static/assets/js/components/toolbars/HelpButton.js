import React from 'react';
import PropTypes from 'prop-types';
import localization from '../../shared/strings';
import cn from 'classnames';

import Logger from '../../services/Logger';
import {
  QuestionTransparent,
} from '@picsio/ui/dist/icons';
import { IconButton } from '@picsio/ui';
import Tooltip from '../Tooltip';

/**
 * Help button component
 * @param {string} tooltipPosition
 * @param {string} component
 * @returns {JSX}
 */
const HelpButton = ({
  additionalClass, tooltipPosition, component, externalUrl, event,
}) => {
  const path = localization.HELP_CENTER[component]?.url;

  return (
    <Tooltip content={localization.HELP_CENTER[component]?.tooltip} placement={tooltipPosition}>
      <IconButton
        id="button-help"
        className={cn('toolbarButton', { [additionalClass]: additionalClass })}
        additionalClass={additionalClass}
        onClick={() => {
          window.open(`${path ? 'https://help.pics.io/' + path : externalUrl}`, '_blank');
          Logger.log('User', event, component);
        }}
        size="lg"
      >
        <QuestionTransparent />
      </IconButton>
    </Tooltip>
  );
};

HelpButton.defaultProps = {
  additionalClass: '',
  tooltipPosition: '',
  component: '',
  externalUrl: '',
  event: 'Help',
};
HelpButton.propTypes = {
  additionalClass: PropTypes.string,
  tooltipPosition: PropTypes.string,
  component: PropTypes.string,
  externalUrl: PropTypes.string,
  event: PropTypes.string,
};

export default HelpButton;
