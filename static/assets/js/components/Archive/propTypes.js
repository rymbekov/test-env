import PropTypes from 'prop-types';

export const collectionPropTypes = {
  name: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.object),
  path: PropTypes.string,
  hasChild: PropTypes.bool,
  archived: PropTypes.bool,
};

export const userPropTypes = {
  permissions: PropTypes.objectOf(PropTypes.bool),
  subscriptionFeatures: PropTypes.objectOf(PropTypes.any),
};

export const searchPropTypes = {
  loading: PropTypes.bool,
  query: PropTypes.string,
  collections: PropTypes.arrayOf(PropTypes.object),
};

export const sortTypePropTypes = {
  type: PropTypes.string,
  order: PropTypes.string,
};

export default {
  collection: collectionPropTypes,
  user: userPropTypes,
  search: searchPropTypes,
  sortType: sortTypePropTypes,
};
