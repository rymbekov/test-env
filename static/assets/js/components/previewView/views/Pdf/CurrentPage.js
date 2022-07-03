import React from 'react';
import { number, object } from 'prop-types';
import { Input } from '@picsio/ui';

function CurrentPage({ viewer, currentPage, pagesCount }) {
  const handleInputCurrentPageChange = (e) => {
    let { value } = e.currentTarget;
    value = Number(value);
    if (value < 1) value = 1;
    if (value > pagesCount) value = pagesCount;
    viewer.currentPageNumber = value; // eslint-disable-line
  };

  const handleInputCurrentPageFocus = (e) => e.target.select();
  return (
    <>
      Page{' '}
      <Input
        className="pdfCurrentPage"
        value={currentPage}
        type="number"
        onChange={handleInputCurrentPageChange}
        onFocus={handleInputCurrentPageFocus}
      />
      / {pagesCount}
    </>
  );
}

CurrentPage.defaultProps = {
  currentPage: 1,
  pagesCount: 1,
};

CurrentPage.propTypes = {
  viewer: object.isRequired,
  currentPage: number,
  pagesCount: number,
};

export default CurrentPage;
