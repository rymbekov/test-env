import React from 'react';
import PropTypes from 'prop-types';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import Icon from '../../Icon';
import Logger from '../../../services/Logger';

const arrayMove = (array, from, to) => {
  const result = [...array];
  const startIndex = from < 0 ? result.length + from : from;

  if (startIndex >= 0 && startIndex < result.length) {
    const endIndex = to < 0 ? result.length + to : to;

    const [item] = result.splice(from, 1);
    result.splice(endIndex, 0, item);
  }
  return result;
};

const ListItem = SortableElement(({ children }) => (
  <div className="customFieldsOption">{children}</div>
));

const List = SortableContainer(({ options, isDefault, onRemove }) => (
  <div style={{ position: 'relative' }}>
    {options.map((option, index) => (
      <ListItem key={option} index={index}>
        <div className="customFieldsOptionName">{option}</div>
        {!isDefault && (
          <span
            className="btnRemove"
            role="button"
            onKeyPress={() => onRemove(option)}
            onClick={() => onRemove(option)}
            tabIndex={0}
          >
            <Icon name="close" />
          </span>
        )}
      </ListItem>
    ))}
  </div>
));

const Options = (props) => {
  const { onSort, options } = props;
  const handleSortStart = () => document.body.classList.add('dragging');
  const handleSortEnd = ({ oldIndex, newIndex }) => {
    onSort(arrayMove(options, oldIndex, newIndex));
    document.body.classList.remove('dragging');
    Logger.log('User', 'SettingsCustomFieldsListOptionDrag');
  };

  return (
    <List
      {...props}
      hideSortableGhost
      lockToContainerEdges
      pressDelay={200}
      axis="y"
      lockAxis="y"
      lockOffset="50%"
      onSortStart={handleSortStart}
      helperClass="customFieldsOption--dragging"
      onSortEnd={handleSortEnd}
    />
  );
};

Options.propTypes = {
  onSort: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Options;
