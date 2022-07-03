import React, { useState } from 'react';
import cn from 'classnames';
import ErrorBoundary from '../../../ErrorBoundary';
import { Input, Checkbox, Textarea } from '../../../../UIComponents';
import './styles.scss';

/**
 * Tag
 * @param {Object} props
 * @param {boolean} props.isEnable
 * @param {string} props.labelStatus
 * @param {string} props.labelTitle
 * @param {string} props.labelMessage
 * @param {string} props.consentTitle
 * @param {string} props.consentMessage
 * @param {Function} onChangeStatus
 * @param {Function} onChangeTitle
 * @param {Function} onChangeMessage
 * @returns {JSX}
 */
export default function Consent({
  className,
  isEnable = false,
  labelStatus,
  labelTitle,
  labelMessage,
  title,
  message,
  onChangeStatus,
  onChangeTitle,
  onChangeMessage
}) {
  const [isConsentEnable, setConsentEnable] = useState(isEnable);
  const [consentTitle, setConsentTitle] = useState(title);
  const [consentMessage, setConsentMessage] = useState(message);
  const [errors, setErrors] = useState({});

  const handleErrors = (field, text) => {
    setErrors({ ...errors, [field]: text })
  }

  const handleChangeConsent = () => {
    setConsentEnable(!isConsentEnable);
    onChangeStatus(!isConsentEnable)
  };

  const handleChangeTitle = (event) => {
    setConsentTitle(event.target.value);
  };

  const handleBlurTitle = () => {
    if (!consentTitle) {
      handleErrors('consentTitle', 'Field cannot be empty')
    } else {
      handleErrors('consentTitle', '')
      onChangeTitle(consentTitle)
    }
  }

  const handleChangeMessage = (event) => {
    setConsentMessage(event.target.value);
  };

  const handleBlurMessage = () => {
    if (!consentMessage) {
      handleErrors('consentMessage', 'Field cannot be empty')
    } else {
      handleErrors('consentMessage', '')
      onChangeMessage(consentMessage)
    }
  };

  return (
    <ErrorBoundary>
      <div className={cn("consent", { [className]: Boolean(className) })}>
        <div className="consentSection">
          <div className="pageItemCheckbox">
            <Checkbox
              label={labelStatus}
              value={isConsentEnable}
              onChange={handleChangeConsent}
              disabled={Boolean(!isConsentEnable && (errors.consentTitle || errors.consentMessage))}
						/>
          </div>
          <Input
            label={labelTitle}
            value={consentTitle}
            onChange={handleChangeTitle}
            onBlur={handleBlurTitle}
            disabled={!isConsentEnable && !errors.consentTitle}
            error={errors.consentTitle}
          />
          <Textarea
            label={labelMessage}
            value={consentMessage}
            onChange={handleChangeMessage}
            onBlur={handleBlurMessage}
            disabled={!isConsentEnable && !errors.consentMessage}
            error={errors.consentMessage}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}
