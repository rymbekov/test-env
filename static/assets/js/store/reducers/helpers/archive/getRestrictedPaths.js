import _get from 'lodash/get';

// This helper allow us to get restricted paths from user's allowed collections.
// For example, if allowed collections have paths "root/test/test a" and "root/test1/test b", "/test/" and "test1" will be restricted and returned as array
const getRestrictedPaths = (user) => {
  const allowedCollections = _get(user, 'role.allowedCollections', []);
  const restrictedPaths = allowedCollections.reduce((acc, { path }) => {
    if (path !== '/root') {
      const pathWithoutRoot = path.slice(1, path.length);
      const result = pathWithoutRoot.match(/\/.*\//);
      const part = result ? result[0] : null;

      if (part && !acc.includes(part)) {
        acc.push(part);
      }
    }
    return acc;
  }, []);

  return restrictedPaths;
};

export default getRestrictedPaths;