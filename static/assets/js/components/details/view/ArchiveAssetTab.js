import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'classnames';
import { CSSTransition } from 'react-transition-group';

import { Input, Checkbox } from '../../../UIComponents';
import localization from '../../../shared/strings';
import handleArchive from '../../../helpers/archiveAssets';

const ArchiveAssetTab = (props) => {
  const {
    selectedAssetsIds,
    isArchived,
    reason,
    isVisible,
    toggleVisibility,
    disabled,
  } = props;
  const [value, setValue] = useState(localization.DETAILS.defaultArchiveReason);

  useEffect(() => {
    if (reason) {
      setValue(reason);
    }
  }, [reason]);

  const handleClick = () => {
    toggleVisibility('detailsAssetArchiveVisibility');
  };

  const handleChangeValue = (event) => {
    const { target } = event;

    setValue(target.value);
  };

  return (
    <div
      data-qa="details-component-archive"
      className={clsx('detailsPanel__item archive', { act: isVisible, disabled })}
    >
      <div className="detailsPanel__title">
        <span
          className={clsx('detailsPanel__title_text')}
          onClick={handleClick}
          role="presentation"
        >
          {localization.DETAILS.titleArchive}
        </span>
        <div className="detailsPanel__title_buttons">
          <If condition={!disabled}>
            <Checkbox
              value={isArchived}
              onChange={() => handleArchive(selectedAssetsIds, isArchived, value)}
              slide
            />
          </If>
        </div>
      </div>
      <CSSTransition in={isVisible} timeout={300} classNames="fade" unmountOnExit>
        <div className="restrictSettings">
          <Input
            label={localization.DETAILS.labelArchiveReason}
            value={value}
            onChange={handleChangeValue}
            // TODO: need to add action for reason updating
            // onBlur={}
            disabled={disabled || isArchived}
          />
        </div>
      </CSSTransition>
    </div>
  );
};

ArchiveAssetTab.defaultProps = {
  selectedAssetsIds: [],
  isArchived: false,
  isVisible: false,
  reason: '',
  disabled: false,
};
ArchiveAssetTab.propTypes = {
  selectedAssetsIds: PropTypes.arrayOf(PropTypes.string),
  isArchived: PropTypes.bool,
  reason: PropTypes.string,
  isVisible: PropTypes.bool,
  toggleVisibility: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default ArchiveAssetTab;
