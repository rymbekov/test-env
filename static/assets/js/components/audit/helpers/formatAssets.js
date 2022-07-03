import React from 'react'; // eslint-disable-line
import localization from '../../../shared/strings';
import Tag from '../../Tag';

/**
 * Format event assets
 * @param {Object[]} assets
 * @param {Object?} options
 * @param {Function?} options.goToUrl - make links for items
 * @return {JSX[]}
 */
export default function formatAssets(assets, options = {}) {
  if (!assets || !assets.length) return [];

  options = { tipping: 10, assetsTotalCount: 0, ...options };

  const first = assets.slice(0, options.tipping);
  /** @type {Array} */
  const result = first.map((asset, index) => (options.goToUrl ? (
    (
      <React.Fragment key={asset._id + index}>
        {index !== 0 && ', '}
        <span className="picsioLink" onClick={() => options.goToUrl(`preview/${asset._id}`)}>
          {asset.name}
        </span>
      </React.Fragment>
    )
  ) : (
    (
      <React.Fragment key={asset._id + index}>
        {index !== 0 && ', '}
        <span>{asset.name}</span>
      </React.Fragment>
    )
  )));

  const rest = (options.assetsTotalCount || assets.length) - options.tipping;
  if (rest > 0) {
    const ending = ` asset${rest > 1 ? 's' : ''}`;
    result.push(
      <React.Fragment key="text">
        {' '}
        {localization.AUDIT.and} {rest} {localization.AUDIT.more}{ending}
      </React.Fragment>,
    );
  }

  if (options.downloadedAs) {
    result.push(
      <React.Fragment key="downloadedAs">
        {' '}
        as <Tag text={options.downloadedAs} />
      </React.Fragment>,
    );
  }

  return result;
}
