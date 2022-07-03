function findParentCollections(collections, targetCollection, childKey = 'nodes') {
  const { path } = targetCollection;

  const allNames = path.slice(1, path.length).split('/');
  const parentNames = allNames.slice(0, allNames.length - 1); 

  const parentCollections = [];
  const recursiveForEach = (items, level = 0) => {
    items.forEach((c) => {
      const currentParentName = parentNames[level];
      const childs = c[childKey];

      if ((c.path === 'root' && !level) || c.name === currentParentName) {
        parentCollections.push(c);
        
        if (childs) {
          recursiveForEach(childs, level);
        }
      }
    });
  };
  recursiveForEach(collections);

  return parentCollections;
}

export default findParentCollections;
