import * as utils from '../../shared/utils';

export default function checkRecursiveSearch(initialUrlRecursive, recursive, setRecursiveSearch) {
  // Recursive search
  if (initialUrlRecursive !== null) {
    // get recursiveSearch, if checkbox is off - returns true
    const valueFromLS = utils.LocalStorage.get('picsio.recursiveSearch');
    const savedValue = valueFromLS !== null ? valueFromLS : true;

    if (initialUrlRecursive === undefined) {
      // if url doesn't have "&recursive=false" set initialUrlRecursive to true
      initialUrlRecursive = !recursive;
    } else if (initialUrlRecursive !== savedValue) {
      setRecursiveSearch(!savedValue);
      initialUrlRecursive = null;
    }
  }

  return initialUrlRecursive;
}
