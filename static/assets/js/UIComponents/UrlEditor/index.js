import React, { useState, useEffect } from 'react';
import cn from 'classnames';
import {
  string, bool, func, arrayOf,
} from 'prop-types';
import Input from '../input';
import Select from '../select';
import * as utils from '../../shared/utils';
import Icon from '../../components/Icon';
import Tooltip from '../../components/Tooltip';
import Logger from '../../services/Logger';
import localization from '../../shared/strings';
import { showDialog } from '../../components/dialog';
import copyTextToClipboard from '../../helpers/copyTextToClipboard';

import './styles.scss';

const reservedPages = ['login', 'about', 'contact', 'collection', 'preview', 'gallery', 'signin', 'signup'];

/**
 * UrlEditor
 * @param {Object} props
 * @param {Boolean} props.disabled
 * @param {Array} props.domains
 * @param {String} props.selectedUrl
 * @param {String} props.defaultPath
 * @param {Function} props.handleUrlChange
 * @returns {JSX}
 */
export default function UrlEditor({
  id,
  label,
  disabled,
  pathReadOnly,
  domains,
  selectedUrl,
  defaultPath,
  handleUrlChange,
  isDisabledCopy,
  tooltipText,
  toastText,
}) {
  const [domainsOptions] = useState(
    (domains.length && domains.map((domain) => ({ value: domain, text: domain }))) || [
      {
        value: 'select',
        text: 'Select domain',
      },
    ],
  );
  const [host, setHost] = useState((domains.length && domains[0]) || 'select');
  const [initialPath, setInitialPath] = useState('');
  const [path, setPath] = useState(defaultPath);
  const [pathError, setPathError] = useState(null);
  const [fullUrl, setFullUrl] = useState(selectedUrl || `${domains[0]}/${defaultPath}`);
  const [isPathEmpy, setPathEmpy] = useState(false);

  useEffect(() => {
    if (!selectedUrl || !utils.isURL(`https://${selectedUrl}`)) return;
    const url = new URL(`https://${selectedUrl}`);
    setHost(url.host);
    setPath(url.pathname.replace(/^\//, ''));
    setInitialPath(url.pathname.replace(/^\//, ''));
  }, [selectedUrl]);

  useEffect(() => {
    if (!disabled && !selectedUrl) {
      concatDataInFullUrl({ host, path });
    }
  }, [disabled]);

  const handlePathChange = (value) => {
    setPathEmpy(value.length === 0);
    value = value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '');
    if (reservedPages.includes(value)) {
      setPathError(true);
    } else {
      setPathError(null);
    }
    setPath(value);
  };

  const handlePathBlur = (event) => {
    const { value } = event.currentTarget;

    if (value === 'login') {
      return showDialog({
        title: localization.TEAMMATES.BRANDING.dialogWarningTitle,
        text: localization.TEAMMATES.BRANDING.dialogWrongLoginPath,
        textBtnCancel: null,
      });
    }
    if (value !== initialPath && !pathError) {
      concatDataInFullUrl({ host, path: value });
    }
  };

  const concatDataInFullUrl = ({ host, path }) => {
    const fullUrl = `${host}/${path}`;
    setFullUrl(fullUrl);

    if (!isPathEmpy) {
      handleUrlChange(id, fullUrl);
    }
  };

  const copyToClipboard = (e) => {
    Logger.log('User', 'UrlEditorValueCopy');
    const websiteURL = e.currentTarget.dataset.value;
    copyTextToClipboard(websiteURL, toastText);
  };

  return (
    <div className="urlEditor">
      {label && <div className="urlEditorLabel">{label}</div>}
      <div className="urlEditorInputs">
        <Select
          onChange={(event, value) => {
            setHost(value);
            concatDataInFullUrl({ host: value, path });
          }}
          options={domainsOptions}
          value={host}
          disabled={disabled}
        />
        <div className="fieldCopyTo">
          <Input
            value={path}
            disabled={pathReadOnly || disabled}
            onChange={(e, value) => handlePathChange(value)}
            onBlur={handlePathBlur}
            className="fieldCopyToUrl"
            error={isPathEmpy ? 'Please enter name' : ''}
          />
          <Tooltip
            content={isDisabledCopy ? tooltipText : null}
            placement="bottom"
          >
            <div
              className={cn('picsioDefBtn picsioLinkForShare fieldCopyToBtn', { disable: isDisabledCopy || disabled })}
              data-value={`${host}/${path}`}
              style={{ pointerEvents: 'visible' }}
              onClick={!isDisabledCopy ? copyToClipboard : () => { }}
              onKeyPress={!isDisabledCopy ? copyToClipboard : () => { }}
              aria-label="copy button"
              role="presentation"
            >
              <Icon name="copyToClipboard" />
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

UrlEditor.defaultProps = {
  defaultPath: '',
  pathReadOnly: false,
  label: '',
  domains: [],
  disabled: false,
  tooltipText: null,
};

UrlEditor.propTypes = {
  id: string.isRequired,
  label: string,
  disabled: bool,
  pathReadOnly: bool,
  domains: arrayOf(string),
  selectedUrl: string.isRequired,
  defaultPath: string,
  handleUrlChange: func.isRequired,
  isDisabledCopy: bool.isRequired,
  tooltipText: string,
  toastText: string.isRequired,
};
