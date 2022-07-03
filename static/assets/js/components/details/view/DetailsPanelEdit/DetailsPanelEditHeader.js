import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { MinusIcon } from '@picsio/ui/dist/icons';

import DetailsPanelEditFieldView from './DetailsPanelEditFieldView';

const DetailsPanelEditHeader = ({ isAllChecked, checkedFieldsSize, onSelect }) => {
  const selected = isAllChecked ? 'All' : checkedFieldsSize;
  const title = `${selected} widgets selected`;
  const checkedIcon = isAllChecked ? undefined : MinusIcon;

  return (
    <div className="detailsPanelEdit__header">
      <h4>Edit widgets mode</h4>
      <DetailsPanelEditFieldView
        id="checkbox"
        title={title}
        isChecked={!!checkedFieldsSize}
        toggleField={onSelect}
        checkedIcon={checkedIcon}
      />
    </div>
  );
};

DetailsPanelEditHeader.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default memo(DetailsPanelEditHeader);
