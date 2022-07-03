import React, { useEffect, useState } from 'react';
import Checkbox from '../../../UIComponents/checkbox'; // eslint-disable-line
import UrlEditor from '../../../UIComponents/UrlEditor';
import localization from '../../../shared/strings';

/**
 * TeamPage
 * @param {Object} props
 * @param {Boolean} props.pageEnabled
 * @param {String} props.pageAccess
 * @param {String} props.pageFor
 * @param {String} props.label
 * @param {String} props.pageUrl
 * @param {Boolean} props.isOpenClose
 * @param {Array} props.domains
 * @param {String} props.defaultPage
 * @param {Function} props.handlePageChange
 * @param {Boolean} props.disabled
 * @returns {JSX}
 */
export default function TeamPage({
  pageEnabled,
  pageAccess,
  pageFor,
  label,
  pageUrl,
  domains,
  defaultPage,
  handlePageChange,
  disabled,
}) {
  const [isPageEnabled, setIsPageEnabled] = useState(pageEnabled);
  useEffect(() => {}, []);

  const handleCheckboxChange = (id, value) => {
    handlePageChange(id, value, !pageUrl);
    setIsPageEnabled(value);
  };

  const handleUrlChange = (id, value) => {
    handlePageChange(id, value);
  };

  return (
    <>
      <Checkbox
        label={label}
        value={isPageEnabled}
        onChange={(value) => handleCheckboxChange(pageAccess, value)}
        disabled={disabled}
      />
      <UrlEditor
        id={pageFor}
        domains={domains}
        selectedUrl={pageUrl}
        defaultPath={defaultPage}
        handleUrlChange={handleUrlChange}
        disabled={disabled || !isPageEnabled}
        pathReadOnly
        isDisabledCopy={disabled || !isPageEnabled}
        toastText={localization.DETAILS.brandPageUrlCopied}
      />
    </>
  );
}
