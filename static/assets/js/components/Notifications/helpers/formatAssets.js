import React from 'react'; // eslint-disable-line
import localization from '../../../shared/strings';

/**
 * Format event assets
 * @param {Object[]} assets
 * @param {Object?} options
 * @param {Function?} options.goToUrl - make links for items
 * @return {JSX[]}
 */
export default function formatAssets(assets, options = {}) {
  if (!assets || !assets.length) return [];

  options = { tipping: 3, ...options };

  const first = assets.slice(0, options.tipping);
  /** @type {Array} */
  const result = first.map((asset, index) => (options.goToUrl ? (
    <React.Fragment key={asset._id}>
      {index !== 0 && ', '}
      <span className="picsioLink" onClick={() => options.goToUrl(`preview/${asset._id}`)}>
        {asset.name}
      </span>
    </React.Fragment>
  ) : (
    <React.Fragment key={asset._id}>
      {index !== 0 && ', '}
      <span>{asset.name}</span>
    </React.Fragment>
  )));

  const rest = assets.length - options.tipping;
  if (rest > 0) {
    const ending = ` asset${rest > 1 ? 's' : ''}`;
    result.push(
      <React.Fragment key="ending">
        {' '}
        {localization.AUDIT.and} {rest} {localization.AUDIT.more}
        {ending}
      </React.Fragment>,
    );
  }

  return result;
}
