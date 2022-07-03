import dompurify from 'dompurify';
import unescape from 'lodash.unescape';
import ua from '../ua';
import unescapeHTML from './unescapeHTML';

/**
 * Remove broken, and wrong tags, remove XSS code
 * @param {string} value
 * @param {Object} params
 * @param {boolean} doUnescape
 * @returns {string}
 */
export default function sanitizeXSS(
  value,
  params = {
    ALLOWED_TAGS: [
      'h3',
      'h4',
      'h5',
      'h6',
      'blockquote',
      'p',
      'a',
      'ul',
      'ol',
      'nl',
      'li',
      'b',
      'i',
      'strong',
      'em',
      'strike',
      's',
      'code',
      'hr',
      'br',
      'div',
      'table',
      'thead',
      'caption',
      'tbody',
      'tr',
      'th',
      'td',
      'pre',
      'span',
    ],
    FORBID_ATTR: ['style'],
  },
  doUnescape = false,
) {
  let sanitizedValue = dompurify.sanitize(value, params);
  if (doUnescape) {
    sanitizedValue = unescape(sanitizedValue);
    // needs to unescape &html; in Safari or iOS
    if (ua.browser.family === 'Safari' || ua.os.isIOS()) {
      sanitizedValue = unescapeHTML(sanitizedValue);
    }
  }
  return sanitizedValue;
}
