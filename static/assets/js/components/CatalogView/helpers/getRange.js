/**
 * Get range for calculate visible images
 * @param {Array} itemsStyles
 * @param {number} topLimit
 * @param {number} bottomLimit
 * @returns {Array}
 */
export default function getRange(itemsStyles, topLimit, bottomLimit) {
  /** @type {number|null} */
  let firstIndex = null;
  /** @type {number|null} */
  let lastIndex = null;

  itemsStyles.forEach((asset, index) => {
    if (asset.translateY >= topLimit && firstIndex === null) {
      firstIndex = index;
    }
    if (asset.translateY + asset.height >= bottomLimit && lastIndex === null) {
      lastIndex = index;
    }
  });

  return [firstIndex || 0, lastIndex === null ? itemsStyles.length - 1 : lastIndex];
}
