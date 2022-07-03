/**
 * Calculate styles for items in upload/inbox panel and make flat array from groups object
 * @param {*} groups
 * @param {boolean} showCompleted
 * @returns
 */
export default function uploadVirtualizedList(groups, showCompleted) {
  const pathHeight = 37;
  const itemHeight = 25;
  const styles = [0]; /** predefined position for first item (collection path) */
  const flatGroups = [];
  let index = 1;

  const createGroupPath = (groupPath, top) => ({
    // eslint-disable-next-line no-plusplus
    id: index++,
    groupPath,
    name: groupPath.split('/').join(' / '),
    top,
  });

  const handleFileItem = (item) => {
    const top = styles[styles.length - 1];
    const nextTop = item.error ? top + (itemHeight * 2) : top + itemHeight;

    styles.push(nextTop);
    // eslint-disable-next-line no-param-reassign
    item.top = top;
    flatGroups.push(item);
  };

  Object.keys(groups).forEach((groupPath) => {
    /** if hideCompleted and every file in group is completed -> skip */
    if (!showCompleted && groups[groupPath].every(({ complete }) => complete)) return;

    /** set position for group */
    flatGroups.push(createGroupPath(groupPath, styles[styles.length - 1]));

    /** append to styles top position for first file in group */
    styles.push(styles[styles.length - 1] + pathHeight);

    /** count top position for files in group */
    if (!showCompleted) {
      groups[groupPath].filter(({ complete }) => !complete).forEach(handleFileItem);
    } else {
      groups[groupPath].forEach(handleFileItem);
    }
  });

  const wrapperHeight = styles[styles.length - 1];

  return { wrapperHeight, flatGroups, styles };
}
