import React, { useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Icon from '../../Icon';
import ErrorBoundary from '../../ErrorBoundary';
import * as assetActions from '../../../store/actions/assets';
import Logger from '../../../services/Logger';
import sendEventToIntercom from '../../../services/IntercomEventService';
import localization from '../../../shared/strings';
import CreateButton from './CreateButton';
import configAddWatermark from '../dialogs/addRole';
import WatermarkingDetailed from './WatermarkingDetailed';
import UpgradePlan from '../../UpgradePlan';
import { navigate } from '../../../helpers/history';
import { showDialog, showErrorDialog } from '../../dialog';

const Watermarking = (props) => {
  const {
    actions, watermarks, subscriptionFeatures, permissions,
  } = props;
  const [newWatermarks, setNewWatermarks] = useState(watermarks && watermarks.length);
  const [selectedWatermark, setSelectedWatermark] = useState(watermarks && watermarks[0]);
  const canNotManageWatermarks = !permissions.role.permissions.manageWatermarks;
  const isNotAllowed = subscriptionFeatures.watermarksLimit <= watermarks.length;
  useEffect(() => {
    if (selectedWatermark === undefined) {
      actions.getWatermarks();
      setSelectedWatermark(watermarks[0]);
    } else {
      const newWtrmrk = watermarks.find((item) => item._id === selectedWatermark._id);
      setSelectedWatermark(newWtrmrk);
    }
  }, [watermarks]);

  if (newWatermarks !== watermarks.length) {
    actions.getWatermarks();
    setNewWatermarks(watermarks.length);
    setSelectedWatermark(watermarks[0]);
  }

  useEffect(() => {
    sendEventToIntercom('Watermark settings');
    Logger.log('User', 'SettingsMyTeamWatermarking');
  }, []);

  const addWatermark = async () => {
    const config = configAddWatermark;
    if (subscriptionFeatures.watermarksLimit > watermarks.length) {
      config.onOk = async ({ input }) => {
        Logger.log('User', 'WatermarkCreateNew');
        const value = input && input.trim();

        if (!value) {
          const errorMessageForUser = localization.WATERMARKS.errorNameEmpty;
          Logger.log('UI', 'CantAddWatermarkDialog', { errorMessageForUser });
          showErrorDialog(errorMessageForUser);
          return;
        }

        const isWatermarkExists = watermarks.find(
          (n) => n.name.toLowerCase() === value.toLowerCase(),
        );
        if (isWatermarkExists) {
          const errorMessageForUser = localization.WATERMARKS.dialogTextWatermarkHaveAlready;
          Logger.log('UI', 'CantAddWatermarkDialog', { errorMessageForUser });
          showErrorDialog(errorMessageForUser);
          return;
        }

        await actions.createWatermark(value);
        const newState = newWatermarks + 1;
        setNewWatermarks(newState);
        setSelectedWatermark(watermarks[watermarks.length - 1]);
      };

      config.onCancel = () => Logger.log('User', 'SettingsMyTeamAddWatermarkDialogCancel');

      Logger.log('UI', 'SettingsMyTeamAddWatermarkDialog');
      showDialog({
        ...config,
        title: localization.WATERMARKS.titleNewWatermark,
        input: { placeholder: localization.WATERMARKS.textPlaceholderTypeWatermark },
      });
    } else {
      Logger.log('User', 'NewUpgradeDialogSeePlans');
      showDialog({
        onOk: () => navigate('/billing?tab=overview'),
        text: 'Using custom watermarks is only available for plans starting from Small. Upgrade to Small or higher to proceed with custom watermarks.',
        textBtnCancel: null,
        title: 'Upgrade required!',
        textBtnOk: 'See all plans',
      });
    }
  };

  const selectWatermark = (id) => {
    Logger.log('User', 'SettingsMyTeamSelectWatermark');
    const selected = watermarks.find((item) => item._id === id);
    setSelectedWatermark(selected);
  };

  const deleteWatermark = ({ _id }) => {
    Logger.log('User', 'SettingsMyTeamWatermarkRemove');
    actions.deleteWatermark(_id);
  };

  const renameWatermark = (arg) => {
    Logger.log('User', 'SettingsMyTeamWatermarkRename');
    const config = configAddWatermark;
    config.onOk = ({ input }) => {
      const value = input && input.trim();

      if (!value) {
        showErrorDialog(localization.WATERMARKS.errorNameEmpty);
        return;
      }

      const isWatermarkExists = watermarks.find(
        (n) => n.name.toLowerCase() === value.toLowerCase(),
      );
      if (isWatermarkExists) {
        showErrorDialog(localization.WATERMARKS.dialogTextWatermarkHaveAlready);
        return;
      }

      actions.updateWatermark({ ...arg, name: value });
    };

    showDialog({
      ...config,
      title: localization.WATERMARKS.titleEditName(arg.name),
      input: {
        value: arg.name,
      },
    });
  };

  return (
    <div className="pageTabsContentRoles">
      <div className="pageTeam__leftSidebar" style={{ flexBasis: '330px' }}>
        {
          !canNotManageWatermarks
        && (
          <div className="pageTeam__leftSidebar__createLink">
            <div className={`pageTeam__leftSidebar__createRole ${isNotAllowed ? 'isNotAllowed' : ''}`} onClick={addWatermark}>
              <Icon name="roundPlus" />
              {localization.WATERMARKS.textCreateNewWatermark}
            </div>
            <If condition={isNotAllowed}>
              <UpgradePlan tooltip={localization.UPGRADE_PLAN.tooltipPlanLimitations} />
            </If>
          </div>
        )
        }
        <div className="pageTeam__leftSidebar__listRoles">
          {watermarks && watermarks.map((watermark) => (
            <ErrorBoundary key={watermark._id}>
              <CreateButton
                isDefault={watermark?.isDefault && watermarks.length > 1}
                isEditable={!watermark?.default && !canNotManageWatermarks}
                item={watermark}
                actItemId={selectedWatermark && selectedWatermark._id}
                selectItem={selectWatermark}
                removeItem={deleteWatermark}
                renameItem={renameWatermark}
              />
            </ErrorBoundary>
          ))}
        </div>
      </div>
      <div className="pageTeam__role">
        <ErrorBoundary>
          <If condition={selectedWatermark}>
            <WatermarkingDetailed
              canNotManageWatermarks={canNotManageWatermarks}
              watermark={selectedWatermark}
              assetActions={actions}
              watermarksLength={watermarks.length}
            />
          </If>
        </ErrorBoundary>
      </div>
    </div>
  );
};

Watermarking.propTypes = {
  actions: PropTypes.objectOf(PropTypes.any).isRequired,
  watermarks: PropTypes.arrayOf(PropTypes.any).isRequired,
  subscriptionFeatures: PropTypes.objectOf(PropTypes.any).isRequired,
  permissions: PropTypes.objectOf(PropTypes.any).isRequired,
};

const mapStateToProps = (state) => ({
  team: state.user.team,
  permissions: state.user,
  roles: state.roles.items,
  watermarks: state.assets.watermarks,
  subscriptionFeatures: state.user.subscriptionFeatures,
});
const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(assetActions, dispatch),
});
const ConnectedSettings = connect(mapStateToProps, mapDispatchToProps)(Watermarking);

export default (props) => <ConnectedSettings {...props} />;
