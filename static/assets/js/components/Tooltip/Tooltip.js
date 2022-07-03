import React, { memo, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { usePopperTooltip } from 'react-popper-tooltip';
import ua from '../../ua';
import './tooltip.scss';

const isMobile = ua.browser.isNotDesktop();

// https://github.com/mohsinulhaq/react-popper-tooltip/blob/12607878d87d34e40f37e62e5bbd764f17e72dde/README.md#examples
const Tooltip = (props) => {
  const {
    content, children, placement = 'auto', hideTooltip,
  } = props;
  const [controlledVisible, setControlledVisible] = useState(false);

  const {
    getArrowProps,
    getTooltipProps,
    setTooltipRef,
    setTriggerRef,
    visible,
  } = usePopperTooltip({
    trigger: 'hover',
    closeOnOutsideClick: false,
    visible: controlledVisible,
    onVisibleChange: setControlledVisible,
    delayShow: 300,
    delayHide: 0,
    placement,
  });

  const handleClick = (...args) => {
    if (visible) {
      setControlledVisible(!controlledVisible);
    }
    if (children.props.onClick) children.props.onClick(...args);
  };

  useEffect(() => {
    if (hideTooltip) {
      setControlledVisible(false);
    }
  }, [hideTooltip]);

  if (!content || isMobile) return children;

  return (
    <>
      <Choose>
        <When condition={children?.props?.disabled}>
          <span className="tooltipWrapper" ref={setTriggerRef}>
            {React.cloneElement(children, {
              onClick: handleClick,
            })}
          </span>
        </When>
        <Otherwise>
          {React.cloneElement(children, {
            ref: setTriggerRef,
            onClick: handleClick,
          })}
        </Otherwise>
      </Choose>
      <If condition={visible}>
        {ReactDOM.createPortal(
          <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container' })}>
            <Choose>
              <When condition={typeof content === 'function'}>{content()}</When>
              <Otherwise>{content}</Otherwise>
            </Choose>
            <div {...getArrowProps({ className: 'tooltip-arrow' })} />
          </div>,
          document.body,
        )}
      </If>
    </>
  );
};

export default memo(Tooltip);
