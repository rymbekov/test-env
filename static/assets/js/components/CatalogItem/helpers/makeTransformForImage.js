/**
 * Make style for image
 * @param {Object} uo - user orientation
 * @returns {Object} - styles for image
 */
const makeTransformForImage = (uo, metadata) => {
  const { width = 1, height = 1 } = metadata || {};
  const { rotation } = uo;
  const isRotated = rotation === 90 || rotation === 270;
  const flipX = uo.flipX ? '180' : '0';
  const flipY = uo.flipY ? '180' : '0';

  // if rotated on 90 or 270 - swap flips

  let transform = `rotateX(${isRotated ? flipX : flipY}deg) rotateY(${
    isRotated ? flipY : flipX
  }deg) rotate(${rotation}deg)`;

  if (isRotated) {
    const scale = width < height ? height / width : width / height;
    transform += ` scale(${scale})`;
  }

  return {
    transform,
    width: isRotated ? '100%' : '',
    height: isRotated ? '100%' : '',
    display: isRotated ? 'flex' : '',
  };
};

export default makeTransformForImage;
