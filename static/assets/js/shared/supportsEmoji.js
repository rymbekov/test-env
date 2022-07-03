/* istanbul ignore file */
export default function supportsEmoji() {
  const ctx = document.createElement('canvas').getContext('2d');
  // eslint-disable-next-line no-multi-assign
  ctx.canvas.width = ctx.canvas.height = 1;
  ctx.fillText('😗', -4, 4);
  return ctx.getImageData(0, 0, 1, 1).data[3] > 0; // Not a transparent pixel
}
