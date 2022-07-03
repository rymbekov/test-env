import React, { memo } from 'react'; // eslint-disable-line
import UploadItem from '../UploadItem';

/**
 * Render temp items for upload
 * @param {Object} props
 * @param {Number} props.count
 * @returns {JSX[]}
 */
const UploadTempItems = ({ count }) => Array.from(
  { length: count },
  (_, i) => <UploadItem.Skeleton key={i} />,
);

export default memo(UploadTempItems);
