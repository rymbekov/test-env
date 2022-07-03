import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { useSwipeable } from 'react-swipeable';

export default function Swipeable({ children, ...props }) {
  const { className, style } = props;
  const handlers = useSwipeable({
    // onSwiped: (eventData) => console.log('user swiped:', eventData),
    ...props,
  });
  return (
    <div className={cn('Swipeable', { [className]: className })} {...handlers} style={style}>
      {children}
    </div>
  );
}

Swipeable.defaultProps = {
  className: null,
};

Swipeable.propTypes = {
  className: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};
