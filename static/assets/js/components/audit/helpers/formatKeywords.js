import React from 'react'; // eslint-disable-line
import localization from '../../../shared/strings';
import * as UtilsCollections from '../../../store/utils/collections';
import { setSearchRoute } from '../../../helpers/history';

/**
 * Format event keywords
 * @param {Object[]} keywords
 * @param {Object?} options
 * @param {Function?} options.goToUrl - make links for items
 * @return {JSX[]}
 */
export default function formatKeywords(keywords, options = {}) {
  if (!keywords || !keywords.length) return [];

  options = { tipping: 10, keywordsTotalCount: 0, ...options };

  const handleClick = (id) => {
    setSearchRoute({ tagId: UtilsCollections.getRootId(), keywords: id });
  };

  const first = keywords.slice(0, options.tipping);
  /** @type {Array} */
  let result = first.map((keyword, index) => (options.goToUrl ? (
    (
      <React.Fragment key={keyword._id + index}>
        {index !== 0 && ', '}
        <span className="picsioLink" onClick={() => handleClick(keyword._id)}>
          {keyword.name}
        </span>
      </React.Fragment>
    )
  ) : (
    (
      <React.Fragment key={keyword._id + index}>
        {index !== 0 && ', '}
        <span>{keyword.name}</span>
      </React.Fragment>
    )
  )));

  const rest = (options.keywordsTotalCount || keywords.length) - options.tipping;
  if (rest > 0) {
    const ending = ` keyword${rest > 1 ? 's' : ''}`;
    result.push(` ${localization.AUDIT.and} ${rest} ${localization.AUDIT.more}${ending}`);
  }

  const keywordsString = keywords.length > 1 ? 'keywords ' : 'keyword ';
  result = [keywordsString].concat(result);

  return result;
}
