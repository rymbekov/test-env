/**
 * Export icons to separate files
 * can be removed together with the Icon component
 */

import fs from 'fs';
import icons from './icons.js';

const { path, viewBox } = icons;
const DEFAULT_VIEW_BOX = '0 0 32 32';

const generateSvg = (name = 'circle') => {
  const paths = path[name];
  const vb = viewBox[name] || DEFAULT_VIEW_BOX;
  const className = `icon svg-icon icon-${name}`;

  return `<svg class="${className}" viewBox="${vb}">${paths.map(
    (p) => `<path d="${p}"></path>`,
  ).join('')}</svg>`;
};

const saveFile = (name, content) => {
  fs.writeFileSync(`static/assets/js/components/Icon/converted/${name}.svg`, content);
};

Object.keys(path).forEach((name) => {
  saveFile(name, generateSvg(name));
});
