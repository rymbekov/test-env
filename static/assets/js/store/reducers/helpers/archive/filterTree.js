/* eslint-disable no-param-reassign */
const filterTree = (ids) => (node) => {
  if (!ids.includes(node._id)) {
    if (node.children) {
      node.children = node.children.filter(filterTree(ids));
      
      if (!node.children.length) {
        node.hasChild = false;
        node.children = null;
      }
    }
    return true; 
  }
  return false;
};
/* eslint-enable no-param-reassign */

export default filterTree;