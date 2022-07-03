import React from 'react';
import cn from 'classnames';
import ErrorBoundary from '../ErrorBoundary';
import localization from '../../shared/strings';
import { ThemeConsumer } from '../../contexts/themeContext';
import { navigate } from '../../helpers/history';
import Tooltip from '../Tooltip';
import './styles.scss';

/**
 * Tag
 * @param {Object} props
 * @param {string?} props.text
 * @param {string?} props.className
 * @param {Function?} props.onClick
 * @param {string?} props.tooltip
 * @returns {JSX}
 */
const Tag = (props) => {
  const {
    text = localization.UPGRADE_PLAN.text,
    className,
    onClick = () => navigate('/billing?tab=overview'),
    tooltip = localization.UPGRADE_PLAN.tooltip,
    withWrapper = false,
  } = props;

  return (
    <ErrorBoundary>
      <ThemeConsumer>
        {({ themes }) => (
          <Choose>
            <When condition={withWrapper}>
              <div className="upgradePlan__wrapper">
                <Tooltip content={tooltip} placement="top">
                  <div
                    className={cn('upgradePlan', { [className]: Boolean(className) })}
                    style={{ backgroundColor: themes.upgradePlanBg }}
                    onClick={onClick}
                  >
                    <If condition={text}>
                      <span className="upgradePlanText">{text}</span>
                    </If>
                  </div>
                </Tooltip>
              </div>
            </When>
            <Otherwise>
              <Tooltip content={tooltip} placement="top">
                <div
                  className={cn('upgradePlan', { [className]: Boolean(className) })}
                  style={{ backgroundColor: themes.upgradePlanBg }}
                  onClick={onClick}
                >
                  <If condition={text}>
                    <span className="upgradePlanText">{text}</span>
                  </If>
                </div>
              </Tooltip>
            </Otherwise>
          </Choose>
        )}
      </ThemeConsumer>
    </ErrorBoundary>

  );
};

export default Tag;
