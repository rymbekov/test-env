import findCollectionByValue from './findCollectionByValue';

const findCollectionById = (collections, id) => findCollectionByValue(collections, '_id', id);

export default findCollectionById;