import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '@picsio/ui';
import { Message } from '@picsio/ui/dist/icons';
import cn from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import localization from '../../shared/strings';
import Tooltip from '../Tooltip';
import { addLiveChatIconSeen } from '../../store/actions/user';

const LiveSupportButton = ({
  handleLiveSupport, chatSupport,
}) => {
  const dispatch = useDispatch();
  const liveChatIconSeen = useSelector((state) => state.user.achievements.liveChatIconSeen);

  useEffect(() => {
    setTimeout(() => {
      dispatch(addLiveChatIconSeen());
    }, 3000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenLiveSupport = useCallback(() => {
    if (liveChatIconSeen) {
      handleLiveSupport();
    } else {
      dispatch(addLiveChatIconSeen());
      handleLiveSupport();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveChatIconSeen]);

  const tooltipTextContent = chatSupport
    ? localization.TOOLBARS.titleLiveSupport
    : `${localization.TOOLBARS.titleLiveSupport}.<br>${localization.UPGRADE_PLAN.tooltipBasic}`;

  return (

    <div className="liveSupportRoot">
      {!liveChatIconSeen && (<div className="liveSupportBackdrop" />)}
      <div className="liveSupportContainer">
        {!liveChatIconSeen && (<p className="liveSupportSpeech">{localization.TOOLBARS.textLiveSupportSpeech}</p>)}
        <Tooltip
          content={liveChatIconSeen ? tooltipTextContent : null}
          placement="right"
        >
          <IconButton
            componentProps={{ 'data-testid': 'toolbarCatalogLeftLiveSupportButton' }}
            className={cn('toolbarButton', { liveSupportButton: !liveChatIconSeen })}
            onClick={handleOpenLiveSupport}
            size="lg"
            color={liveChatIconSeen && 'inherit'}
            disabled={!chatSupport}
            id="itemliveSupport"
          >
            <Message />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
};

LiveSupportButton.propTypes = {
  chatSupport: PropTypes.bool.isRequired,
  handleLiveSupport: PropTypes.func.isRequired,
};

export default LiveSupportButton;
