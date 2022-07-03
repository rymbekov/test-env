import React, { useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import clsx from 'classnames';

import DetailsPanelEditHeader from './DetailsPanelEditHeader';
import DetailsPanelEditFooter from './DetailsPanelEditFooter';
import DetailsPanelEditSortableList from './DetailsPanelEditSortableList';
import DetailsPanelEditList from './DetailsPanelEditList';
import './styles.scss';

import { updateHidden } from './utils';

import swap from '../../../../helpers/swap';

const getHelperDimensions = ({ node }) => ({
  width: node.offsetWidth,
  height: node.offsetHeight,
});

const shouldCancelStart = ({ target }) => {
  const { type } = target;

  if (type === 'checkbox') {
    return true;
  }
  return false;
};

const DetailsPanelEdit = (props) => {
  const {
    isOpen, fields, config, toggleEditPanel, updateConfig,
  } = props;
  const listRef = useRef();
  const tempRef = useRef([]);
  const [isDragging, setDrag] = useState(false);
  const { hidden } = config;
  const checkedFieldsSize = fields.length - hidden.length;
  const isAllChecked = checkedFieldsSize === fields.length;

  const handleToggleField = useCallback(
    (event, id) => {
      const {
        target: { checked },
      } = event;
      const updatedHidden = hidden.length ? updateHidden(hidden, checked, id) : [id];

      updateConfig(fields, updatedHidden);
    },
    [fields, hidden, updateConfig],
  );

  const handleDragStart = useCallback(() => {
    tempRef.current = fields;

    setDrag(true);
    document.body.classList.add('dragging');
  }, [fields]);

  const handleDragOver = useCallback(
    ({ oldIndex, newIndex }) => {
      const updatedFields = swap(tempRef.current, oldIndex, newIndex);

      tempRef.current = updatedFields;
    },
    [tempRef],
  );

  const handleDragEnd = useCallback(() => {
    updateConfig(tempRef.current, hidden);
    tempRef.current = [];

    setDrag(false);
    document.body.classList.remove('dragging');
  }, [tempRef, hidden, updateConfig]);

  const handleSelect = useCallback(() => {
    if (!isAllChecked) {
      updateConfig(fields, []);
    } else {
      const hidden = fields.map(({ id }) => id);

      updateConfig(fields, hidden);
    }
  }, [fields, isAllChecked, updateConfig]);

  return (
    <div
      className={clsx('detailsPanelEdit', {
        'detailsPanelEdit--opened': isOpen,
        'detailsPanelEdit--dragging': isDragging,
      })}
    >
      <DetailsPanelEditHeader
        isAllChecked={isAllChecked}
        checkedFieldsSize={checkedFieldsSize}
        onSelect={handleSelect}
      />
      <DetailsPanelEditSortableList
        shouldCancelStart={shouldCancelStart}
        getHelperDimensions={getHelperDimensions}
        onSortStart={handleDragStart}
        onSortOver={handleDragOver}
        onSortEnd={handleDragEnd}
        axis="y"
        lockAxis="y"
        lockOffset="50%"
        helperContainer={listRef.current}
        helperClass="detailsPanelEdit__field--dragging"
        hideSortableGhost
        lockToContainerEdges
        pressDelay={100}
      >
        <div ref={listRef} className="detailsPanelEdit__list">
          <DetailsPanelEditList listId="checked" fields={fields} hidden={hidden} toggleField={handleToggleField} />
        </div>
      </DetailsPanelEditSortableList>
      <DetailsPanelEditFooter isOpen toggleEditPanel={toggleEditPanel} />
    </div>
  );
};

DetailsPanelEdit.defaultProps = {
  fields: [],
};
DetailsPanelEdit.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      permission: PropTypes.string,
    }),
  ),
  config: PropTypes.shape({
    order: PropTypes.arrayOf(PropTypes.string).isRequired,
    hidden: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  setFields: PropTypes.func.isRequired,
  updateConfig: PropTypes.func.isRequired,
  toggleEditPanel: PropTypes.func.isRequired,
};

export default DetailsPanelEdit;
