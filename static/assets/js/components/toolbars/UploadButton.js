import React, { useRef, memo } from 'react';
import PropTypes from 'prop-types';
import localization from '../../shared/strings';
import Logger from '../../services/Logger';
import Button from './Button';

const UploadButton = (props) => {
  const inputAddRevision = useRef();
  const {
    addRevision, isDisabled, icon, iconSize,
  } = props;

  const onChangeAddRevision = () => {
    if (isDisabled) return;

    if (inputAddRevision) {
      Logger.log('User', 'PreviewAddRevision');
      const file = inputAddRevision.current.files[0];
      addRevision(file);
      inputAddRevision.current.value = '';
    }
  };

  const tooltipText = isDisabled
    ? localization.UPGRADE_PLAN.tooltipForButtons
    : localization.TOOLBARS.titleAddRevision;

  return (
    <Button
      id="button-revisionUpload"
      icon={icon}
      tooltip={tooltipText}
      tooltipPosition="left"
      additionalClass="buttonFileUpload"
      isDisabled={isDisabled}
      iconSize={iconSize}
    >
      <If condition={!isDisabled}>
        <input
          ref={inputAddRevision}
          onChange={onChangeAddRevision}
          type="file"
          className="cssDisplayHidden"
        />
      </If>
    </Button>
  );
};

UploadButton.propTypes = {
  addRevision: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool.isRequired,
};

export default memo(UploadButton);
