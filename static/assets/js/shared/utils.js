import Q from 'q';
import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import validator from 'validator';
import { Storage } from '@capacitor/storage';
import convertUnits from 'convert-units';
import _floor from 'lodash/floor';
import Logger from '../services/Logger';
import ua from '../ua';
import sanitize from './sanitizeXSS';
import picsioConfig from '../../../../config';

import * as api from '../api';

// TODO: will be better to categorize utils by instances and reduce main "utils" file.
import * as html from './html';
import * as user from './user';

export { html };
export { user };

const MP4 = 'video/mp4';

const UNICODELETTERS = 'A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC';

// replaceAlphaNumeric
export function replaceAlphabeticalAnd(value, and) {
  and = and || '';
  return value.replace(new RegExp(`[^${UNICODELETTERS + and}]`, 'gi'), '');
}

export function isURL(url) {
  const regexp = /^(ht|f)tps?:\/\/[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?$/;
  return regexp.test(url);
}

export function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export function isObject(value) {
  return value != null && typeof value === 'object' && Array.isArray(value) === false;
}

export function isEmptyObject(obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
}

export function formatNumberWithSpaces(x) {
  const thinSpace = '\u2009';
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, thinSpace);
}

export function trimWithAsciiDots(value) {
  return value.replace(/^\s+|\s+$/gm, '·');
}

export function getImageDataByUrl(url) {
  const dfd = Q.defer();

  const img = new Image();

  img.crossOrigin = 'Anonymous';

  img.onload = function () {
    const canvas = document.createElement('canvas');

    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const rgba = imageData.data;

    dfd.resolve({
      rgba,
      imageData,
    });
  };

  img.src = url;

  return dfd.promise;
}

// format should be 'xy' like 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
export function uuid(format) {
  format = format || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  return format.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Converts bytes number to string representation
 * @param {number} bytes
 * @returns {string}
 */
export function bytesToSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  if (bytes === 0) return '0KB';
  if (bytes === undefined) return 'Unknown';
  const index = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  if (bytes <= 1024) return '1KB';
  if (index === 0) return `${bytes} ${sizes[index]}`;
  return `${(bytes / 1024 ** index).toFixed(1)} ${sizes[index]}`;
}

export function getPercent(full, part) {
  if (full == 0 && part == 0) return '0%';
  if (!full) return 'Unknown';

  const x = (part * 100) / full;
  const result = `${Math.round(x * 100) / 100}%`;

  return result;
}

// analog for sugarjs.Object.fromQueryString
// but noes not respect array items spec
// array will be a=1&a=2 instead of spec-respect a[]=1&a[]=2
export function deconstructQueryString(url) {
  const params = {};
  // remove preceding non-querystring, correct spaces, and split
  const qs = url
    .substring(url.indexOf('?') + 1)
    .replace(/\+/g, ' ')
    .split('&');

  // march and parse
  for (let i = qs.length; i > 0;) {
    let [key, value] = qs[--i].split('=');
    key = decodeURIComponent(key);
    value = decodeURIComponent(value);

    const valueIsBlank = value === 'undefined' || value === 'null';
    if (valueIsBlank) continue;
    if (params[key]) {
      if (Array.isArray(params[key])) params[key].push(value);
      else params[key] = [params[key], value];
    } else {
      params[key] = value;
    }
  }

  return params;
}

export function mixin(obj) {
  const array = [];
  const { slice } = array;

  slice.call(arguments, 1).forEach((item) => {
    for (const key in item) obj[key] = item[key];
  });

  return obj;
}

export function dataURItoBlob(dataURI, mime) {
  const BASE64_MARKER = ';base64,';
  const base64Index = dataURI.indexOf(BASE64_MARKER);
  dataURI = dataURI.substring(base64Index + BASE64_MARKER.length);
  const byteString = window.atob(dataURI);
  const ia = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ia], {
    type: mime,
  });
}

/* we used this function to determine if the subscriber email is correctly formed */
export function isValidEmailAddress(emailAddress) {
  const pattern = new RegExp(
    /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
  );
  return pattern.test(emailAddress);
}

export function isValidDomain(domain) {
  return validator.isFQDN(domain);
}

export function formatDate(stringDate) {
  if (stringDate !== 'N/A') {
    const date = stringDate.split(' ')[0].split(':');
    const year = date[0];
    const month = date[1];
    const day = date[2];
    const listmonth = [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december',
    ];

    stringDate = `${listmonth[month - 1]} ${day}, ${year}`;
  }
  return stringDate;
}

export function formatDateCreateAt(stringDate) {
  if (!stringDate) return 'N/A';
  stringDate = stringDate.substring(0, 10);
  const date = stringDate.split('-');
  const year = date[0];
  const month = date[1];
  const day = date[2];

  return `${day}.${month}.${year}`;
}

export function setCookie(name, value) {
  const date = new Date(new Date().getTime() + 5 * 365 * 24 * 60 * 60 * 1000);
  document.cookie = `${encodeURIComponent(name)
  } = ${
    encodeURIComponent(value)
  }; path=/; expires=${
    date.toUTCString()}`;
}

export function getCookie(name) {
  const el = document.cookie.split('; ').find((item) => item.split('=')[0] === encodeURIComponent(name));

  if (!el) return null;

  const value = decodeURIComponent(el.split('=')[1]);
  if (value === 'true') return true;
  if (value === 'false') return false;

  return value;
}

export const getGuestName = () => {
  const defaultGuestName = 'Guest';
  const guestName = getCookie('picsio.proofingGuestName');
  if (guestName) {
    return guestName;
  }
  return defaultGuestName;
};

export const setGuestName = (value) => {
  setCookie('picsio.proofingGuestName', value);
};

export function deleteAllCookies() {
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

/**
 * return website consent dialog don't show cookie name
 * @param {string} type
 * @returns {string}
 */
export function getWebsiteCookieName(type) {
  const websiteId = window.websiteConfig._id;
  return `picsio.${websiteId}.${type}.dontshow`;
}

export function getCaretPosition(el) {
  let iCaretPos = 0;

  // is(IE) else (FF)
  if (document.selection) {
    el.focus(); // Set focus on the element
    const oSel = document.selection.createRange(); // To get cursor position, get empty selection range
    oSel.moveStart('character', -el.value.length); // Move selection start to 0 position
    iCaretPos = oSel.text.length; // The caret position is selection length
  } else if (el.selectionStart || el.selectionStart == '0') {
    iCaretPos = el.selectionStart;
  }

  return iCaretPos;
}

export function getCaretPositionEditableDiv(node) {
  const sel = window.getSelection();
  if (!sel.rangeCount) {
    return 0;
  }

  const range = sel.getRangeAt(0);
  const treeWalker = document.createTreeWalker(
    node,
    NodeFilter.SHOW_ALL,
    (node) => {
      const nodeRange = document.createRange();
      nodeRange.selectNodeContents(node);
      return nodeRange.compareBoundaryPoints(Range.END_TO_END, range) < 1
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
    false,
  );

  let charCount = 0;
  while (treeWalker.nextNode()) {
    charCount += treeWalker.currentNode.outerHTML
      ? treeWalker.currentNode.outerHTML.length
      : treeWalker.currentNode.length;
  }
  if (
    range.startContainer.nodeType == 3
    && range.startContainer.textContent === range.startContainer.wholeText
  ) {
    charCount += range.startOffset;
  }
  return charCount;
}

/** Save as
 * @param {Blob} blob
 * @param {string} name
 */
export const saveFile = saveAs;

/**
 * Save file locally (WITHOUT LIBRARY)
 * @param {Blob} blob
 * @param {string} name
 */
export function _saveFile(blob, name) {
  if (ua.browser.isNotDesktop()) return;

  let href;
  if (blob instanceof Blob) {
    href = window.URL.createObjectURL(blob);
    setTimeout(() => {
      window.URL.revokeObjectURL(href);
    }, 10000); // revoke blob url in 10 seconds
  } else {
    href = blob;
  }

  if (ua.browser.isOldSafari()) {
    window.open(href, '_blank');
  } else {
    const iframe = document.createElement('iframe');
    // iframe.style.display = 'none';
    iframe.style.position = 'fixed';
    iframe.style.left = '-99999px';
    document.body.appendChild(iframe);

    const html = `<script>
				var a = document.createElement('a');
				a.download = "${name}";
				a.href = "${href}";
				setTimeout(function () {
					document.body.appendChild(a);
					a.click();
				}, 0);
			</script>`;

    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(html);
    iframe.contentWindow.document.close();

    setTimeout(iframe.remove, 10000);
  }
}

export function parseTime(timeInSeconds, config = {}) {
  let milliSeconds = timeInSeconds - Math.floor(timeInSeconds);
  let hours = Math.floor(timeInSeconds / 3600);
  milliSeconds = Math.floor(milliSeconds * 100);
  timeInSeconds = Math.floor(timeInSeconds);
  let minutes = Math.floor(timeInSeconds / 60);
  let seconds = timeInSeconds - minutes * 60;
  if (config.type === 'Timecode') {
    minutes -= hours * 60;
  }
  minutes < 10 && (minutes = `0${minutes}`);
  seconds < 10 && (seconds = `0${seconds}`);
  hours < 10 && (hours = `0${hours}`);
  milliSeconds < 10 && (milliSeconds = `0${milliSeconds}`);

  if (config.html) {
    if (config.type === 'Timecode') {
      return `<span>${hours}</span><span>${minutes}</span><span>${seconds}</span><span>${milliSeconds}</span>`;
    }
    return `<span>${minutes}</span><span>${seconds}</span>`;
  } if (config.roundedSecond) {
    return timeInSeconds;
  } if (config.type === 'Timecode') {
    return `${hours}:${minutes}:${seconds}:${milliSeconds}`;
  }
  return `${minutes}:${seconds}`;
}

export function hmsToSecondsOnly(str) {
  let hms = str;
  if (hms.includes('s')) {
    hms = Math.floor(hms.replace(' s', '')).toString();
  }

  const p = hms.includes(':') ? hms.split(':') : [hms];
  let s = 0;
  let m = 1;

  while (p.length > 0) {
    s += m * parseInt(p.pop(), 10);
    m *= 60;
  }

  return s;
}

export const mentionPattern = /\B@[a-z0-9_-]+/gi;

export function decodeSlash(str) {
  return str && str.replace(/%2F/g, '/');
}

export function preventPullToRefresh(element) {
  if (ua.os.isIOS() && ua.os.version < 13) {
    let prevent = false;

    document.querySelector(element).addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length !== 1) {
          return;
        }

        const scrollY = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
        prevent = scrollY === 0;
      },
      { passive: true },
    );

    document.querySelector(element).addEventListener('touchmove', (e) => {
      if (prevent) {
        prevent = false;
        e.preventDefault();
      }
    });
  }
}

export function getScreenUrl() {
  let searchString = window.location.search;
  const separatorIndex = searchString.indexOf('&');
  searchString = searchString.substring(
    0,
    separatorIndex != -1 ? separatorIndex : searchString.length,
  );
  const screenUrl = window.location.pathname + searchString;

  return screenUrl;
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Check assets for possibility of comparison
 * @param {object[]} assets
 * @returns {boolean}
 */
export function canBeCompared(assets, userSettings = {}) {
  const {
    mimeType, customThumbnail, thumbnailing, hasAccess, isPdf,
  } = assets[0];
  const {
    mimeType: mimeType2,
    customThumbnail: customThumbnail2,
    thumbnailing: thumbnailing2,
    hasAccess: hasAccess2,
    isPdf: isPdf2,
  } = assets[1];

  /** If some of the assets has no access */
  if (!hasAccess || !hasAccess2) return false;

  const isSupportedImage =		(mimeType && mimeType.startsWith('image/'))
		|| (!!customThumbnail && thumbnailing !== 'waiting' && thumbnailing !== 'running');
  const isSupportedImage2 =		(mimeType2 && mimeType2.startsWith('image/'))
		|| (!!customThumbnail2 && thumbnailing2 !== 'waiting' && thumbnailing2 !== 'running');

  if (isSupportedImage && isSupportedImage2) return true;

  const isSupportedVideo = mimeType === MP4;
  const isSupportedVideo2 = mimeType2 === MP4;
  // if (isSupportedVideo && isSupportedVideo2 && !ua.os.isIOS()) return true;
  if (isSupportedVideo && isSupportedVideo2) return true; // fix for mobiles

  if (!userSettings?.useGdPdfViewer && isPdf && isPdf2) return true;

  return false;
}

export const LocalStorage = {
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  get(key) {
    return JSON.parse(localStorage.getItem(key));
  },
  remove(key) {
    localStorage.removeItem(key);
  },
};

export const MobileStorage = {
  async set(key, value) {
    await Storage.set({
      key,
      value,
    });
  },
  async get(key) {
    const { value } = await Storage.get({ key });
    return value;
  },
  async remove(key) {
    await Storage.remove({ key });
  },
};

export function mergePermissions(arrayOfObjects) {
  return arrayOfObjects.reduce((acc, obj) => {
    const propertyNames = Object.getOwnPropertyNames(obj);
    propertyNames.forEach((propertyName) => {
      if (acc[propertyName] === undefined) {
        acc[propertyName] = obj[propertyName];
      } else if (acc[propertyName] !== obj[propertyName]) {
        acc[propertyName] = false;
      }
    });

    return acc;
  }, {});
}

/**
 * Check is asset restricted
 * @param {Object} restrictSettings
 * @returns {boolean}
 */
export function isAssetRestricted(restrictSettings) {
  let { isRestricted, startAt, expiresAt } = restrictSettings;

  if (isRestricted === false) return false;

  if (startAt && expiresAt) {
    isRestricted = dayjs().isAfter(startAt) && dayjs().isBefore(expiresAt);
  } else if (startAt) {
    isRestricted = dayjs().isAfter(startAt);
  } else if (expiresAt) {
    isRestricted = dayjs().isBefore(expiresAt);
  }

  return isRestricted;
}

/**
 * Check is selected assets are restricted and meet the permission
 * @param {string[]} selectedItems
 * @returns {boolean}
 */
export function isSelectedAssetsRestricted(selectedAssets) {
  return selectedAssets.some((asset) => isAssetRestricted(asset.restrictSettings));
}

/**
 * Get users with role manageTeam
 * @param {Object} user
 * @param {array} teammates
 * @param {array} roles
 * @returns {array}
 */
export function getTeamManagers(user, teammates, roles) {
  const teamOwner = user.isTeammate ? user.team : user;
  const rolesWithManageTeam = [];
  const usersWithRoleManageTeam = [teamOwner];

  roles.forEach((role) => {
    const { permissions } = role;
    if (permissions && permissions.manageTeam) {
      rolesWithManageTeam.push(role._id);
    }
  });

  if (rolesWithManageTeam.length) {
    teammates.forEach((teammate) => {
      const { parent } = teammate;
      const teammateRoleId = parent && parent.teammateRoleId;

      if (teammateRoleId && rolesWithManageTeam.includes(teammateRoleId)) {
        usersWithRoleManageTeam.push({
          _id: teammate._id,
          email: teammate.email,
          avatar: teammate.avatar,
        });
      }
    });
  }

  return usersWithRoleManageTeam;
}

/**
 * Get users with role manageTeam
 * @param {Object} user
 * @param {array} teammates
 * @param {array} roles
 * @returns {array}
 */
export function getUsersWithPermissionToBuyKeywords(user, teammates, roles) {
  const teamOwner = user.isTeammate ? user.team : user;
  const rolesWithManageTeam = [];
  const usersWithRoleManageTeam = [teamOwner];

  roles.forEach((role) => {
    const { permissions } = role;
    if (permissions && permissions.manageTeam && permissions.manageBilling && permissions.manageKeywords) {
      rolesWithManageTeam.push(role._id);
    }
  });

  if (rolesWithManageTeam.length) {
    teammates.forEach((teammate) => {
      const { parent } = teammate;
      const teammateRoleId = parent && parent.teammateRoleId;

      if (teammateRoleId && rolesWithManageTeam.includes(teammateRoleId)) {
        usersWithRoleManageTeam.push({
          _id: teammate._id,
          email: teammate.email,
          avatar: teammate.avatar,
        });
      }
    });
  }
  return usersWithRoleManageTeam;
}

/**
 * Unescape html string
 * @param {string} string
 * @returns {string}
 */
export function unescapeHTML(string) {
  const element = document.createElement('span');
  element.innerHTML = string;
  return element.innerText;
}

/**
 * Remove broken, and wrong tags, remove XSS code
 * @param {string} value
 * @param {Object} params
 * @param {boolean} doUnescape
 * @returns {string}
 */
export function sanitizeXSS(...args) {
  return sanitize(...args);
}

export function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
    if (+match === 0) return ''; // or if (/\s+/.test(match)) for spaces
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

/** add styles to dom elements */
export function css(el, styles) {
  for (const property in styles) {
    if (isNumber(styles[property])) {
      el.style[property] = `${styles[property]}px`;
    } else {
      el.style[property] = styles[property];
    }
  }
}

export function removeLastSlash(str) {
  if (str.endsWith('/') || str.endsWith('\\')) {
    str = str.slice(0, -1);
  }
  return str;
}

/**
 * prepare consent url
 * @param {string} alias
 * @returns {string}
 */
export function prepareUrlForConsent(alias) {
  if (picsioConfig.ENV === 'development') {
    let pathname = window.location.pathname || '';
    const { origin } = window.location;
    if (pathname.endsWith('/search')) {
      pathname = pathname.replace('/search', '');
    }
    let websuteUrl = origin + pathname;
    websuteUrl = removeLastSlash(websuteUrl);

    const consentUrl = `${websuteUrl}/consent`;
    return consentUrl;
  }

  return `https://${alias}/consent`;
}

export function getUserPlan(customer) {
  const { subscription } = customer;
  const plan = (subscription
      && subscription.items
      && subscription.items.data
      && subscription.items.data.length
      && subscription.items.data[0].plan)
    || null;

  return plan;
}

/**
 * get data from xhr or Axios error
 * @param {AxiosError} error
 * @param {string} fieldName
 * @returns {* | null}
 */
export function getDataFromResponceError(error, fieldName) {
  if (error?.response?.data) {
    if (fieldName) return error.response.data[fieldName];
    return error.response.data;
  }

  if (error?.response && typeof error.response === 'string') {
    const response = JSON.parse(error.response);
    if (typeof response === 'object') {
      return response[fieldName] || null;
    }
  }

  return null;
}

/**
 * get error status from Axios error
 * @param {AxiosError} error
 * @returns {number | null}
 */
export function getStatusFromResponceError(error) {
  if (error && error.response && error.response.status) {
    return error.response.status;
  }

  return null;
}

export function checkWebpFeature(feature, callback) {
  const kTestImages = {
    lossy: 'UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA',
    lossless: 'UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==',
    alpha:
      'UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==',
    animation:
      'UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA',
  };
  const img = new Image();
  img.onload = () => {
    const result = img.width > 0 && img.height > 0;
    callback(feature, result);
  };
  img.onerror = () => {
    callback(feature, false);
  };
  img.src = `data:image/webp;base64,${kTestImages[feature]}`;
}

/**
 * save apiKey for user autorization in mobile aps (Android \ iOS)
 * @param {string} apiKey
 * @returns {undefined}
 */
export function saveAutorization(apiKey) {
  if (!apiKey) Logger.info('Can not save token, apiKey is required');

  if (ua.isMobileApp()) {
    MobileStorage.set('picsio.userToken', apiKey);
    api.instance.defaults.headers.common.Authorization = `Bearer ${apiKey}`;
  }
}

/**
 * save two-factor user autorization in mobile aps (Android \ iOS)
 * @returns {undefined}
 */
export function mobileAppSave2faAutorization(value, mode) {
  if (ua.isMobileApp()) {
    Logger.log('User', 'Mobile2FACodeSaved');
    MobileStorage.set('picsio.twoFactorAuthComplete', value.toString());
    MobileStorage.set('picsio.twoFactorAuthMode', mode);
  }
}

/**
 * remove two-factor user autorization in mobile aps (Android \ iOS)
 * @returns {undefined}
 */
export function mobileAppRemove2faAutorization() {
  if (ua.isMobileApp()) {
    Logger.log('User', 'Mobile2FAResetOk');
    MobileStorage.remove('picsio.twoFactorAuthComplete');
    MobileStorage.remove('picsio.twoFactorAuthMode');
  }
}

/**
 * remove apiKey for user autorization in mobile aps (Android \ iOS)
 * @returns {undefined}
 */
export function removeAutorization() {
  if (ua.isMobileApp()) {
    Logger.log('User', 'MobileAuthRemove');
    MobileStorage.remove('picsio.userToken');
    MobileStorage.remove('picsio.twoFactorAuthComplete');
    MobileStorage.remove('picsio.twoFactorAuthMode');
    delete api.instance.defaults.headers.common.Authorization;
  }
}

/**
 * Will open document to in new browser tab.
 * Google Drive mimeTypes https://developers.google.com/drive/api/v3/mime-types
 */
export function openDocument(fileId, mimeType) {
  let url;
  if (mimeType === 'application/vnd.google-apps.document') {
    url = `https://docs.google.com/document/d/${fileId}/edit`;
  } else if (mimeType === 'application/vnd.google-apps.presentation') {
    url = `https://docs.google.com/presentation/d/${fileId}/edit`;
  } else if (mimeType === 'application/vnd.google-apps.spreadsheet') {
    url = `https://docs.google.com/spreadsheets/d/${fileId}/edit`;
  } else if (mimeType === 'application/vnd.google-apps.drawing') {
    url = `https://docs.google.com/drawings/d/${fileId}/edit`;
  } else {
    url = `https://drive.google.com/file/d/${fileId}/edit`;
  }
  window.open(url);
}

/**
 * get file extension
 * @returns {string}
 */
export function getFileExtension(path) {
  // eslint-disable-next-line no-bitwise
  return path.slice(((path.lastIndexOf('.') - 1) >>> 0) + 2);
}

export const convertUnit = (amount, from, to, precision = 2) => _floor(convertUnits(amount).from(from).to(to), precision);
/**
 * Sort array values
 * @param {string[]} arr
 * @returns {string[]} new sorted array
 */
export function alphaNumericSort(arr = []) {
  const sorter = (a, b) => {
    const isNum = (v) => (+v).toString() === v;
    const aPart = a.match(/\d+|\D+/g);
    const bPart = b.match(/\d+|\D+/g);
    let i = 0;
    const len = Math.min(aPart.length, bPart.length);
    while (i < len && aPart[i] === bPart[i]) {
      i++;
    }
    if (i === len) {
      return aPart.length - bPart.length;
    }
    if (isNum(aPart[i]) && isNum(bPart[i])) {
      return aPart[i] - bPart[i];
    }
    return aPart[i].localeCompare(bPart[i]);
  };
  return [...arr].sort(sorter);
}

/**
 *
 * @param {Number} t - current time
 * @param {Number} b - start value
 * @param {Number} c - change in value
 * @param {Number} d - duration
 * @returns {Number}
 */
export function easeInOutQuad(t, b, c, d) {
  t /= d / 2; // eslint-disable-line
  if (t < 1) return (c / 2) * t * t + b;
  t--; // eslint-disable-line
  return (-c / 2) * (t * (t - 2) - 1) + b;
}

/**
 * Smoothly animate scroll for HTMLElement
 * @param {HTMLElement} element
 * @param {number} to - new scrollTop
 * @param {number} duration - in miliseconds
 */
export function animatedScrollTo(element, to, duration) {
  const start = element.scrollTop;
  const change = to - start;
  let currentTime = 0;
  const increment = 20;

  function animateScroll() {
    currentTime += increment;
    const value = easeInOutQuad(currentTime, start, change, duration);
    element.scrollTop = value; // eslint-disable-line
    if (currentTime < duration) {
      setTimeout(animateScroll, increment);
    }
  }
  animateScroll();
}

export function getNavigatorConnectionInfo() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};
  const { effectiveType, downlink } = connection;
  return { effectiveType, downlink };
}

export function getSearchProps(search) {
  const qs = search.replace(/^\?/, '');
  const params = deconstructQueryString(qs);
  // normalize types and values
  // not sure if validation code should be here
  Object.keys(params).forEach((key) => {
    if (key === 'rating') {
      params.rating = ~~params.rating;
    }
    if (key === 'color' && !Array.isArray(params.color)) {
      params.color = [params.color];
    }
    if (key === 'flag' && !Array.isArray(params.flag)) {
      params.flag = [params.flag];
    }
    if (key === 'keywords' && !Array.isArray(params.keywords)) {
      params.keywords = [params.keywords];
    }
    if (key === 'searchIn' && !Array.isArray(params.searchIn)) {
      params.searchIn = [params.searchIn];
    }
  });
  return params;
}

export function isArrayBuffer(value) {
  if (typeof ArrayBuffer !== 'function') return false;

  if (value instanceof ArrayBuffer || value.toString() === '[object ArrayBuffer]') return true;
  return false;
}
