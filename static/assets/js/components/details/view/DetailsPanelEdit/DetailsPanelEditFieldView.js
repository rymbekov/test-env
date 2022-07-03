import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'classnames';
import { Checkbox } from '@picsio/ui';

const DetailsPanelEditFieldView = (props) => {
  const {
    id, title, isChecked, toggleField, checkedIcon, handler: Handler,
  } = props;

  return (
    <li
      data-qa={`edit-details-component-${id}`}
      className={clsx('detailsPanelEdit__field', 'detailsPanel__item', {
        'detailsPanelEdit__field--checked': isChecked,
      })}
      tabIndex={0}
    >
      <div className={clsx('detailsPanelEdit__field__checkbox')}>
        <Checkbox checked={isChecked} onChange={(event) => toggleField(event, id)} checkedIcon={checkedIcon} />
      </div>
      <div className={clsx('detailsPanelEdit__field__text')}>
        <span className={clsx('detailsPanel__title_text', 'withoutTriangle')}>{title}</span>
      </div>
      <div className="detailsPanelEdit__field__button">{Handler}</div>
    </li>
  );
};

DetailsPanelEditFieldView.defaultProps = {
  toggleField: null,
  checkedIcon: undefined,
  handler: null,
};
DetailsPanelEditFieldView.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  isChecked: PropTypes.bool.isRequired,
  toggleField: PropTypes.func,
  checkedIcon: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  handler: PropTypes.node,
};

export default DetailsPanelEditFieldView;
