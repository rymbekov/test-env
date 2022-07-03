import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

import DetailsPanelEditField from './DetailsPanelEditField';

const DetailsPanelEditList = forwardRef((props, ref) => {
  const {
    fields, hidden, toggleField, listId,
  } = props;

  return (
    <ul ref={ref} className={`detailsPanelEdit__list__${listId}`}>
      {fields.map((field, index) => {
        const { id, title } = field;
        const isChecked = !hidden.includes(id);

        return (
          <DetailsPanelEditField
            key={id}
            index={index}
            id={id}
            title={title}
            isChecked={isChecked}
            toggleField={toggleField}
            // props for SortableElement
            disabled={!isChecked}
            collection={listId}
          />
        );
      })}
    </ul>
  );
});

DetailsPanelEditList.defaultProps = {
  fields: [],
  hidden: [],
};
DetailsPanelEditList.propTypes = {
  listId: PropTypes.string.isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      permission: PropTypes.string,
    }),
  ),
  hidden: PropTypes.arrayOf(PropTypes.string),
  toggleField: PropTypes.func.isRequired,
};

export default DetailsPanelEditList;
