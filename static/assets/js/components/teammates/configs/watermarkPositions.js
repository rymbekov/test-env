export const watermarkPositions = {
  NorthWest: {
    left: '0', top: '0', position: 'absolute', transform: 'translate(0)',
  },
  North: {
    top: '0', left: '50%', position: 'absolute', transform: 'translate(-50%)',
  },
  NorthEast: {
    right: '0', top: '0', position: 'absolute', transform: 'translate(0)',
  },
  West: {
    top: '50%', left: '0', position: 'absolute', transform: 'translate(0, -50%)',
  },
  Center: {
    left: '50%', top: '50%', position: 'absolute', transform: 'translate(-50%, -50%)',
  },
  East: {
    right: '0', top: '50%', position: 'absolute', transform: 'translate(0, -50%)',
  },
  SouthWest: {
    left: '0', bottom: '0', position: 'absolute', transform: 'translate(0)',
  },
  South: {
    bottom: '0', left: '50%', position: 'absolute', transform: 'translate(-50%)',
  },
  SouthEast: {
    right: '0', bottom: '0', position: 'absolute', transform: 'translate(0)',
  },
};
