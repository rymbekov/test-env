import _replace from 'lodash/replace';

const getCollectionsByPath = (collections, path, restrictedPaths = []) => collections.filter((c) => {
  const fullPath = `${c.path}${c.name}/`;
  const restrictedPath = restrictedPaths.length && restrictedPaths.find(p => fullPath.match(new RegExp(`^${p}`)));

  if (fullPath === restrictedPath) {
    return false;
  }
  if (restrictedPath) {
    const validPath = _replace(c.path, restrictedPath, '/');

    return validPath === path;
  }
  return c.path === path
});

export default getCollectionsByPath;
