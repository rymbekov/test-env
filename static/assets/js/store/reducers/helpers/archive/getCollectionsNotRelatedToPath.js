const getCollectionsNotRelatedToPath = (collections, path) => {
  return collections.filter((c) => !c.path.match(new RegExp(`^${path}`)));
};

export default getCollectionsNotRelatedToPath;