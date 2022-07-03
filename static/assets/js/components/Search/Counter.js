import React from 'react';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';
import * as utils from '../../shared/utils';
import localization from '../../shared/strings';

/**
 * Generates formatted html fragment for assets counter in top search field.
 * Possible morphemes:
 * 0 => 'No assets'
 * 1 => '1 asset'
 * many => '1 234 567 assets'
 *
 * @param {Object} props
 * @param {number} props.amount
 * @returns {JSX}
 */
function Counter({ amount }) {
  return (
    <div className="searchHeader-counter">
      <Choose>
        <When condition={amount === 0}>
          <span>{localization.SEARCH.text['No assets']}</span>
        </When>
        <Otherwise>
          <>
            {`${utils.formatNumberWithSpaces(amount)}
                ${pluralize('asset', amount, false)}`}
          </>
        </Otherwise>
      </Choose>
    </div>
  );
}

Counter.propTypes = {
  amount: PropTypes.number.isRequired,
};

export default Counter;
