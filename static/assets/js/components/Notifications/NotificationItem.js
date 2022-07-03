import React, { forwardRef } from 'react';
import { useMount } from 'react-use';
// import PropTypes from 'prop-types';

const NotificationItem = forwardRef((props, ref) => {
  const {
    children, style, onClick, read, measure,
  } = props;

  useMount(() => {
    measure();
  });

  return (
    <div
      ref={ref}
      className="notificationsItemsHolder"
      onClick={onClick}
      style={style}
    >
      <If condition={!read}>
        <div className="notificationsItemStatus" />
      </If>
      {children}
    </div>
  );
});

NotificationItem.propTypes = {};

export default NotificationItem;
