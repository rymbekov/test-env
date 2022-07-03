import PropTypes from 'prop-types';

export const keywordPropTypes = {
  _id: PropTypes.string,
  name: PropTypes.string,
  path: PropTypes.string,
  isFavorite: PropTypes.bool,
  count: PropTypes.number,
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
  keyword: keywordPropTypes,
  user: userPropTypes,
  search: searchPropTypes,
  sortType: sortTypePropTypes,
};
