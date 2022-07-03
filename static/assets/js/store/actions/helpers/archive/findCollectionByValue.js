/* eslint-disable no-restricted-syntax */
const findCollectionByValue = (collections, key, value) => {
  for (const collection of collections) {    
    if (collection[key] === value) {
      return collection;
    }
    if (collection.children && collection.children.length) {
      const child = findCollectionByValue(collection.children, key, value);
      if (child) return child;
    }
  }
  return null;
};

export default findCollectionByValue;