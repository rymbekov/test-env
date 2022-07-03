import _get from 'lodash/get';

const getRootCollectionId = (state) => {
  const id = _get(state, 'archive.collections[0]._id', null);

  return id;
}

export default getRootCollectionId;