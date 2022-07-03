import React, { memo } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import './styles.scss';

const AvatarGroup = (props) => {
  const { max, children } = props;

  const extraAvatars = children.length > max ? children.length - max : 0;

  return (
    <div className="AvatarGroup">
      {children
        .slice(0, children.length - extraAvatars)
        .reverse()
        .map((child) => React.cloneElement(child, {
          className: cn(child.props.className),
        }))}
      <If condition={extraAvatars}>
        <div className="AvatarGroup__more">+{extraAvatars}</div>
      </If>
    </div>
  );
};

AvatarGroup.defaultProps = {
  max: 2,
};

AvatarGroup.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  max: PropTypes.number,
};

export default memo(AvatarGroup);
