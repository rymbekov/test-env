import _round from 'lodash/round';

const gbBytes = 1073741824;

function getUsingGb(totalSize) {
  const precision = totalSize > gbBytes ? 0 : 2;
  const usingGb = _round(totalSize / gbBytes, precision);

  return usingGb;
}

export default getUsingGb;
