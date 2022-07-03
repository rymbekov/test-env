import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'classnames';
import { CSSTransition } from 'react-transition-group';
import { IconButton } from '@picsio/ui';
import { Settings } from '@picsio/ui/dist/icons';
import { Checkbox, ReactSelect } from '../../../UIComponents';
import DialogRadios from '../../dialogRadios';
import Logger from '../../../services/Logger';
import localization from '../../../shared/strings';
import { navigate } from '../../../helpers/history';
import { showDialog } from '../../dialog';
import sendEventToIntercom from '../../../services/IntercomEventService';

const WatermarkAssetsTab = (props) => {
  const {
    selectedAssetsIds,
    isVisible,
    toggleVisibility,
    disabled,
    attach,
    allWatermarks,
    watermarkId,
    inProgress,
    canEditWatermarks,
  } = props;

  const options = allWatermarks.map(
    (watermark) => ({ ...watermark, label: watermark.name, value: watermark._id }),
  );

  const placeholder = options?.find(
    (item) => item._id === watermarkId,
  ) || options?.find((item) => item.isDefault);

  const [value, setValue] = useState(placeholder);
  const [checkbox, setCheckbox] = useState(watermarkId);
  const [overwrite, setOverwrite] = useState(true);

  const handleClick = () => {
    toggleVisibility('detailsAssetWatermarkVisibility');
  };

  useEffect(() => {
    setCheckbox(watermarkId);
  }, [watermarkId]);

  const handleChangeValue = (event) => {
    const isItOld = watermarkId === event._id;
    if (!isItOld && watermarkId) {
      if (selectedAssetsIds?.length === 1) {
        attach(true, true, selectedAssetsIds, event && event._id);
        setValue(event);
      } else {
        new DialogRadios({
          title: localization.WATERMARKS.applyWatermark,
          text: 'Apply to',
          items: [
            {
              label: 'All assets',
              value: 'allAssets',
              checked: overwrite,
              description: '',
            },
            {
              label: 'Non-watermarked assets',
              value: 'nonWatermarkedAssets',
              checked: !overwrite,
              description: '',
            },
          ],
          description: localization.WATERMARKS.titleAttachWatermark(selectedAssetsIds?.length),
          cancelName: localization.DIALOGS.MOVE_ASSETS_DIALOG.CANCEL_TEXT,
          okName: localization.DIALOGS.MOVE_ASSETS_DIALOG.OK_TEXT,
          onOk: (value) => {
            if (value === 'allAssets') {
              attach(true, true, selectedAssetsIds, event && event._id);
            } else {
              attach(false, true, selectedAssetsIds, event && event._id);
            }
            setValue(event);
          },
        });
      }
      Logger.log('UI', 'WatermarkDialogShow');
    } else {
      setValue(event);
    }
  };

  const handleChangeCheckbox = () => {
    const isItOld = watermarkId === value?._id;
    if (isItOld) {
      if (selectedAssetsIds?.length === 1) {
        attach(true, true, selectedAssetsIds);
      } else {
        showDialog({
          title: localization.WATERMARKS.removeWatermark,
          text: localization.WATERMARKS.titleDetachWatermark(selectedAssetsIds.length),
          textBtnOk: localization.WATERMARKS.btnOkWatermark,
          onOk() {
            attach(true, true, selectedAssetsIds);
          },
          onCancel() {},
        });
      }
      setValue(placeholder);
    } else if (selectedAssetsIds?.length === 1) {
      attach(true, true, selectedAssetsIds, value && value._id);
    } else {
      new DialogRadios({
        title: localization.WATERMARKS.applyWatermark,
        text: 'Apply to',
        items: [
          {
            label: 'All assets',
            value: 'allAssets',
            checked: overwrite,
            description: '',
          },
          {
            label: 'Non-watermarked assets',
            value: 'nonWatermarkedAssets',
            checked: !overwrite,
            description: '',
          },
        ],
        description: localization.WATERMARKS.titleAttachWatermark(selectedAssetsIds?.length),
        cancelName: localization.DIALOGS.MOVE_ASSETS_DIALOG.CANCEL_TEXT,
        okName: localization.DIALOGS.MOVE_ASSETS_DIALOG.OK_TEXT,
        onOk: (val) => {
          if (val === 'allAssets') {
            attach(true, true, selectedAssetsIds, value && value._id);
          } else {
            attach(false, true, selectedAssetsIds, value && value._id);
          }
        },
      });
    }
    Logger.log('User', selectedAssetsIds?.length > 1 ? 'WatermarkMultipleAdded' : 'WatermarkSingleAdded', placeholder?.name);
    sendEventToIntercom('Watermark applied');
  };

  const openWatermarks = () => {
    navigate('/teammates?tab=watermarking');
  };

  return (
    <div
      data-qa="details-component-watermarks"
      className={clsx('detailsPanel__item', { act: isVisible, disabled })}
    >
      <div className="detailsPanel__title">
        <span
          className={clsx('detailsPanel__title_text')}
          onClick={handleClick}
          role="presentation"
        >
          {localization.DETAILS.titleWatermarks}
        </span>
        <If condition={canEditWatermarks}>
          <IconButton
            onClick={openWatermarks}
            size="md"
            className="picsioWatermarks"
          >
            <Settings />
          </IconButton>
        </If>
        <div className="detailsPanel__title_buttons">
          <If condition={!disabled}>
            <Checkbox
              value={checkbox}
              onChange={handleChangeCheckbox}
              slide
              inProgress={inProgress}
            />
          </If>
        </div>
      </div>
      <CSSTransition in={isVisible} timeout={300} classNames="fade" unmountOnExit>
        <div className="restrictSettings" style={{ position: 'relative', zIndex: '3' }}>
          <ReactSelect
            placeholder={placeholder && placeholder.name || 'Not selected'}
            disabled={disabled}
            options={options}
            isSearchable={false}
            value={value}
            onChange={(val) => handleChangeValue(val)}
          />
        </div>
      </CSSTransition>
    </div>
  );
};

WatermarkAssetsTab.defaultProps = {
  selectedAssetsIds: [],
  isVisible: false,
  disabled: false,
  allWatermarks: [],
  watermarkId: null,
};
WatermarkAssetsTab.propTypes = {
  selectedAssetsIds: PropTypes.arrayOf(PropTypes.string),
  isVisible: PropTypes.bool,
  toggleVisibility: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  attach: PropTypes.func.isRequired,
  allWatermarks: PropTypes.arrayOf(PropTypes.object),
  watermarkId: PropTypes.string,
  inProgress: PropTypes.bool.isRequired,
  canEditWatermarks: PropTypes.bool.isRequired,
};

export default WatermarkAssetsTab;
