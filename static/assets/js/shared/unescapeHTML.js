/**
 * Unescape html string
 * @param {string} string
 * @returns {string}
 */
export default function unescapeHTML(string) {
  const element = document.createElement('span');
  element.innerHTML = string;
  return element.innerText;
}
