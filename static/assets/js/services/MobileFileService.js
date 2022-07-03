import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import ua from '../ua';

// const isAppIos = ua.getPlatform() === 'ios';
// const defaultDirectory = isAppIos ? Directory.Cache : Directory.Documents;
const defaultDirectory = Directory.Cache;

export default class FileService {
  async initFolder(folderName) {
    await Filesystem.mkdir({
      path: folderName,
      directory: defaultDirectory,
      recursive: false,
    }).catch(() => {
      return null;
    });
  }

  async readdir(folder = '') {
    const result = await Filesystem.readdir({
      path: folder,
      directory: defaultDirectory,
    }).catch((err) => {
      console.error(err);
      return null;
    });
    return result;
  }

  async writeFile(folder, fileName, blob, chunkSize) {
    let path = fileName;
    if (folder) {
      await this.initFolder(folder);
      path = `${folder}/${fileName}`;
    }
    if (ua.isMobileApp()) {
      await this.convertToBase64Chunks(blob, chunkSize, async (value, first) => {
        if (first) {
          await Filesystem.writeFile({
            path,
            directory: defaultDirectory,
            data: value,
          });
        } else {
          await Filesystem.appendFile({
            path,
            directory: defaultDirectory,
            data: value,
          });
        }
      });
    } else {
      await Filesystem.writeFile({
        path,
        directory: defaultDirectory,
        data: blob,
        encoding: Encoding.UTF8,
      });
    }
  }

  async readFile(folder, fileName) {
    const directory = await Filesystem.getUri({
      path: folder,
      directory: defaultDirectory,
    }).catch((err) => {
      console.error(err);
      return null;
    });
    const fileSrc = Capacitor.convertFileSrc(`${directory.uri}/${fileName}`);
    const directoryUri = directory.uri;
    const fileUri = `${directory.uri}/${fileName}`;
    const safeUrl = fileSrc;
    return {
      fileUri,
      directoryUri,
      success: safeUrl,
    };
  }

  // eslint-disable-next-line consistent-return
  async deleteFile(path) {
    const res = await Filesystem.deleteFile({
      path,
      directory: defaultDirectory,
    });
    return res;
  }

  convertToBase64(blob) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      const realFileReader = reader._realReader;
      if (realFileReader) {
        reader = realFileReader;
      }
      reader.onerror = (err) => {
        console.log(err);
        reject();
      };
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  }

  async convertToBase64Chunks(blob, size, chunk) {
    const chunkSize = 1024 * 1024 * size;
    if (chunkSize % 6) {
      throw { error: 'Chunksize must be a multiple of 6!' };
    } else {
      const blobSize = blob.size;
      while (blob.size > chunkSize) {
        const value = await this.convertToBase64(blob.slice(0, chunkSize));
        await chunk(blobSize === blob.size ? value : value.split(',')[1], blobSize === blob.size);
        blob = blob.slice(chunkSize);
      }
      const lastValue = await this.convertToBase64(blob.slice(0, blob.size));
      await chunk(lastValue.split(',')[1], blobSize === blob.size);
      blob = blob.slice(blob.size);
    }
  }
}
