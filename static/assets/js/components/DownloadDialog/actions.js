import Logger from '../../services/Logger';

import downloadPresets from '../../api/downloadPresets';

export async function getDownloadPresets() {
  Logger.log('User', 'GetDownloadPresets');

  try {
    const { downloadPresets: presets } = await downloadPresets.get();

    return presets;
  } catch (e) {
    Logger.error(new Error('Error reject get download preset list'), { Amplitude: 'CantGetDownloadPresets', error: e });

    throw (e);
  }
}

export async function createDownloadPreset(payload) {
  Logger.log('User', 'SaveDownloadPreset', payload);

  try {
    const preset = downloadPresets.create(payload);

    return preset;
  } catch (e) {
    Logger.error(new Error('Error reject save download preset'), { Amplitude: 'CantSaveDownloadPreset', error: e });

    throw e;
  }
}

export async function updateDownloadPreset(payload) {
  Logger.log('User', 'UpdateDownloadPreset', payload);

  const { _id, ...data } = payload;

  try {
    const preset = downloadPresets.update(_id, data);

    return preset;
  } catch (e) {
    Logger.error(new Error('Error reject update download preset'), { Amplitude: 'CantUpdateDownloadPreset', error: e });

    throw e;
  }
}

export async function deleteDownloadPreset(presetId) {
  Logger.log('User', 'DeleteDownloadPreset', presetId);

  try {
    const { deleted } = await downloadPresets.delete(presetId);

    return deleted;
  } catch (e) {
    Logger.error(new Error('Error reject delete download preset'), { Amplitude: 'CantDeleteDownloadPreset', error: e });

    throw e;
  }
}
