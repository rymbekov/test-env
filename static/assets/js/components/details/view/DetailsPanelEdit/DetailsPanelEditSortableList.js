import { SortableContainer } from 'react-sortable-hoc';

const DetailsPanelEditList = SortableContainer((props) => {
  const { children } = props;

  return children;
});

export default DetailsPanelEditList;
