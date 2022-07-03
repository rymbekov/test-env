import React, { useRef, useState, useEffect } from 'react';
import TextareaWithStripTags from './TextareaWithStripTags';

const MIN_HEIGHT = 30;

function Textarea({
  label,
  name,
  placeholder = '',
  className = '',
  onKeyDown = Function.prototype,
  onChange = Function.prototype,
  onFocus = Function.prototype,
  onBlur = Function.prototype,
  onResize = Function.prototype,
  value,
  autoFocus = false,
  defaultValue,
  disabled,
  description,
  error,
  customRef = null,
  height,
  isDefault = false,
  stripTagsEnable = true,
  useResizing = true,
  defaultHeight = 100,
}) {
  const [textareaHeight, setHeight] = useState(parseInt(height) || defaultHeight);
  const ref = useRef();
  const inputRef = customRef || ref;

  useEffect(() => {
    if (autoFocus === true && customRef) {
      customRef.current.focus();
    }
  }, [autoFocus, customRef]);

  useEffect(() => {
    const fnMouseup = () => {
      document.body.classList.remove('noselect');
      onResize(textareaHeight);
    };
    if (useResizing) {
      document.addEventListener('mouseup', fnMouseup);
    }
    return () => document.removeEventListener('mouseup', fnMouseup);
  }, [textareaHeight]);

  const onResizing = () => {
    const fnMousemove = e => {
      const inputHeight = ref.current.offsetHeight;
      const nextHeight = inputHeight + e.movementY;

      if (nextHeight > MIN_HEIGHT) {
        setHeight(nextHeight);
      };
    };

    const fnMouseup = () => {
      document.removeEventListener('mousemove', fnMousemove);
      document.removeEventListener('mouseup', fnMouseup);
    };

    document.body.classList.add('noselect');
    document.addEventListener('mousemove', fnMousemove);
    document.addEventListener('mouseup', fnMouseup);
  }

  if (isDefault === true) {
    return (
      <TextareaWithStripTags
        name={name}
        customRef={inputRef}
        className={className}
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onKeyDown={onKeyDown}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        stripTagsEnable={stripTagsEnable}
        autoFocus={autoFocus}
      />
    );
  }
    return (
      <div className={`UITextarea ${className} ${error ? 'UITextarea--error' : ''}`}>
        {label && <div className="UITextarea__label">{label}</div>}
        <TextareaWithStripTags
          name={name}
          customRef={inputRef}
          className="UITextarea__item"
          placeholder={placeholder}
          defaultValue={defaultValue}
          value={value}
          onKeyDown={onKeyDown}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          style={{
            height: useResizing && textareaHeight,
            resize: onResize ? 'vertical' : 'none',
          }}
          stripTagsEnable={stripTagsEnable}
          autoFocus={autoFocus}
        />
        <If condition={onResize && useResizing}>
          <div className="UITextarea__resizer" onMouseDown={onResizing} />
        </If>
        <If condition={typeof error === 'string'}>
          <div className="UITextarea__error">{error}</div>
        </If>
        <If condition={description}>
          <div className="UITextareaDescription">{description}</div>
        </If>
      </div>
    );

}

export default Textarea;
