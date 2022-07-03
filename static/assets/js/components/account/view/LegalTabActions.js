import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import Icon from '../../Icon';

import localization from '../../../shared/strings';

const LegalTabActions = (props) => {
  const { title, actions, permissions } = props;

  return (
    <div className="legalActions">
      <div className="legalTitle">{title}</div>
      <div className="youCan">
        {actions.map((action) => {
          const {
            id,
            href,
            link,
            text,
            description,
            permission,
            onClick,
            notAllowedOnMobile,
          } = action;
          const isAllow = permission ? permissions[permission] : true;

          return (
            <div key={id} className="youCanItem">
              <div className={cn("youCanItemName", { isNotAvailable: notAllowedOnMobile })}>
                <Choose>
                  <When condition={isAllow}>
                    <Choose>
                      <When condition={href}>
                        <Choose>
                          <When condition={notAllowedOnMobile}>
                            <div>{text}</div>
                            <div className="warning">
                              <div className="warningIcon">
                                <Icon name="warning" />
                              </div>
                              <div className="warningText">{localization.MOBILE_APP.IS_NOT_AVAILABLE}</div>
                            </div>
                          </When>
                          <Otherwise>
                            <a href={href} target="_blank" rel="noreferrer">
                              {text}
                            </a>
                          </Otherwise>
                        </Choose>
                      </When>
                      <When condition={link}>
                        <button className="youCanItemLink" onClick={onClick} type="button">
                          {link}
                        </button>
                      </When>
                      <Otherwise>{null}</Otherwise>
                    </Choose>
                  </When>
                  <Otherwise>
                    <span>{text}</span>
                  </Otherwise>
                </Choose>
              </div>
              <If condition={description}>
                <div className="description">{description}</div>
              </If>
            </div>
          );
        })}
      </div>
    </div>
  );
};

LegalTabActions.defaultProps = {
  title: localization.ACCOUNT.titleYouCan,
  permissions: {},
};
LegalTabActions.propTypes = {
  title: PropTypes.string,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      href: PropTypes.string,
      link: PropTypes.string,
      text: PropTypes.string,
      description: PropTypes.string,
      onClick: PropTypes.func,
      notAllowedOnMobile: PropTypes.bool,
    })
  ).isRequired,
  permissions: PropTypes.objectOf(PropTypes.any),
};

export default LegalTabActions;
