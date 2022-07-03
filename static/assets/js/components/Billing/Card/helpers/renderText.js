import React from 'react';
import _upperFirst from 'lodash/upperFirst';

const renderText = (card) => {
  const { funding, brand, last4 } = card;
  const validFunding = funding !== 'unknown' ? funding.toLowerCase() : null;
  const validBrand = _upperFirst(brand || 'Unknown');

  return (
    <>
      <div>
        {validBrand} {' '} {validFunding}
      </div>
      <div>
        <span>**** </span>
        <span>{last4}</span>
      </div>
    </>
  );
};

export default renderText;
