import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import * as InboxesApi from '../../api/inboxes';
import localization from '../../shared/strings';
import picsioConfig from '../../../../../config';
import Icon from '../Icon';
import Logger from '../../services/Logger';
import Toast from '../Toast';
import { navigate } from '../../helpers/history';

const AssetsLimitExceededDialog = (props) => {
  const { destroy } = props;
  const { subscriptionFeatures = {}, team = {} } = useSelector((state) => state.user);
  const { assetsLimit = 50000, planName } = subscriptionFeatures;
  const { trialEnds } = team;
  const isTrialUser = picsioConfig.isMainApp() && !(new Date() > new Date(trialEnds)) && !planName;

  useEffect(() => {
    Logger.log('UI', picsioConfig.isInboxApp() ? 'AssetsLimitInboxDialog' : 'AssetsLimitDialog');
  }, []);

  const cancel = () => {
    Logger.log(
      'User',
      picsioConfig.isInboxApp() ? 'AssetsLimitInboxDialogCancel' : 'AssetsLimitDialogCancel'
    );
    destroy();
  };

  const submit = async () => {
    Logger.log(
      'User',
      picsioConfig.isInboxApp() ? 'AssetsLimitInboxDialogOk' : 'AssetsLimitDialogOk'
    );
    if (picsioConfig.isInboxApp()) {
      try {
        await InboxesApi.notifyAboutAssetsLimit(window.inbox._id);
        Toast(localization.DIALOGS.ASSETS_LIMIT_INBOX.TEXT_SUCCESS);
      } catch (err) {
        Logger.error(new Error('Cant notify inbox owner about assets limit'), { error: err }, [
          'NotifyInboxOwnerFailed',
          (err && err.message) || 'NoMessage',
        ]);
      }
    } else {
      navigate('/billing?tab=overview');
    }
    destroy();
  };

  const dialogTexts = picsioConfig.isInboxApp()
    ? localization.DIALOGS.ASSETS_LIMIT_INBOX
    : localization.DIALOGS.ASSETS_LIMIT_APP;

  const { TITLE, TEXT, TEXT_CANCEL, TEXT_OK } = dialogTexts;

  return (
    <div className="simpleDialog revisionFieldsDialog">
      <div className="simpleDialogUnderlayer" />
      <div className="simpleDialogBox">
        <div className="simpleDialogHeader">
          <span className="simpleDialogTitle">{TITLE}</span>
          <span className="simpleDialogBtnCross" onClick={cancel}>
            <Icon name="close" />
          </span>
        </div>
        <div className="simpleDialogContent">
          <div className="simpleDialogContentInner">{TEXT(assetsLimit, isTrialUser)}</div>
        </div>
        <div className="simpleDialogFooter">
          <If condition={TEXT_CANCEL}>
            <span className="simpleDialogFooterBtn simpleDialogFooterBtnCancel" onClick={cancel}>
              {TEXT_CANCEL}
            </span>
          </If>
          <span className="simpleDialogFooterBtn" onClick={submit}>
            {TEXT_OK}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AssetsLimitExceededDialog;
