import React, { memo } from 'react';
import PropTypes from 'prop-types';
import {
  DotsHorizontal,
  Ok,
} from '@picsio/ui/dist/icons';
import { Icon } from '@picsio/ui';
import localization from '../../../shared/strings';
import Tag from '../../Tag';
import Tooltip from '../../Tooltip';

const SecurityTeammateStatus = (props) => {
  const { teammate, onReset } = props;

  return (
    <div className="securityTeammateStatus">
      <div className="securityTeammateStatusUser">
        <Tag type="user" text={teammate.displayName} avatar={teammate.avatar} />
      </div>
      <div className="securityTeammateStatusIcon">
        <Choose>
          <When condition={teammate.twoFactorConfigured}>
            <Tooltip content={localization.TEAMMATES.status2FASuccess} placement="top">
              <Icon size="sm">
                <Ok />
              </Icon>
            </Tooltip>
          </When>
          <Otherwise>
            <Tooltip content={localization.TEAMMATES.status2FAInProgress} placement="top">
              <Icon size="lg">
                <DotsHorizontal />
              </Icon>
            </Tooltip>
          </Otherwise>
        </Choose>
      </div>
      <div className="securityTeammateStatusAction">
        <If condition={teammate.twoFactorConfigured}>
          <span className="picsioLink" onClick={onReset}>
            {localization.TEAMMATES.status2FAReset}
          </span>
        </If>
      </div>
    </div>
  );
};

SecurityTeammateStatus.defaultProps = {
  teammate: {
    avatar: '',
    twoFactorConfigured: false,
  },
};

SecurityTeammateStatus.propTypes = {
  teammate: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    twoFactorConfigured: PropTypes.bool,
  }),
  onReset: PropTypes.func.isRequired,
};

export default memo(SecurityTeammateStatus);
