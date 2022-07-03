import React from 'react';
import { SortableElement } from 'react-sortable-hoc';

import DetailsPanelEditFieldView from './DetailsPanelEditFieldView';

const DragHandle = () => (
  <button tabIndex={-1}>
    <span />
    <span />
    <span />
    <span />
  </button>
);

const DetailsPanelEditField = SortableElement((props) => <DetailsPanelEditFieldView {...props} handler={<DragHandle />} />);

export default DetailsPanelEditField;
