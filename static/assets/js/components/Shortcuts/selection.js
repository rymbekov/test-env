import ua from '../../ua';
import catalogHotkeys from './catalog';

const selectionHotkeys = {
  events: {
    'command d': null, // 'openMassDownloadDialog',

    'command p': null, // 'flagApprove',
    'command x': null, // 'flagReject',
    'command u': null, // 'unflag',

    'alt 1': null, // 'rating1',
    'alt 2': null, // 'rating2',
    'alt 3': null, // 'rating3',
    'alt 4': null, // 'rating4',
    'alt 5': null, // 'rating5',

    'command 6': null, // 'colorRed',
    'command 7': null, // 'colorYellow',
    'command 8': null, // 'colorGreen',
    'command 9': null, // 'colorBlue',
    'command 0': null, // 'colorNone',
  },
};
if (ua.browser.family === 'Safari') {
  delete selectionHotkeys.events['command 6'];
  delete selectionHotkeys.events['command 7'];
  delete selectionHotkeys.events['command 8'];
  delete selectionHotkeys.events['command 9'];
  delete selectionHotkeys.events['command 0'];
  selectionHotkeys.events['alt 6'] = null; // 'colorRed',
  selectionHotkeys.events['alt 7'] = null; // 'colorYellow',
  selectionHotkeys.events['alt 8'] = null; // 'colorGreen',
  selectionHotkeys.events['alt 9'] = null; // 'colorBlue',
  selectionHotkeys.events['alt 0'] = null; // 'colorNone',ªº
}

export default { events: { ...selectionHotkeys.events, ...catalogHotkeys.events } };
