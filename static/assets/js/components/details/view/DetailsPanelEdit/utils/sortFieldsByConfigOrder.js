// Sort fields by order form localstorage config. New fields will be added to the end of the list.
const sortFieldsByConfigOrder = (fields, storageConfig) => {
  const { order, hidden } = storageConfig;
  const fieldsByCategory = fields.reduce(
    (acc, field) => {
      const { id } = field;
      const orderIndex = order.indexOf(id);
      const hiddenIndex = hidden.indexOf(id);

      if (orderIndex !== -1) {
        acc.byOrder[orderIndex] = field;
      } else if (hiddenIndex !== -1) {
        acc.hidden[hiddenIndex] = field;
      } else {
        acc.new.push(field);
      }
      return acc;
    },
    {
      byOrder: [],
      hidden: [],
      new: [],
    },
  );
  const sortedFields = [...fieldsByCategory.byOrder, ...fieldsByCategory.hidden, ...fieldsByCategory.new];
  // Filter undefined fields in case when this fields weren't present in previous config.
  const filteredByEmpty = sortedFields.filter((id) => !!id);

  return filteredByEmpty;
};

export default sortFieldsByConfigOrder;
