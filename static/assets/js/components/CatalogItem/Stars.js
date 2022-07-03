import React from 'react'; // eslint-disable-line
import PropTypes from 'prop-types';
import cn from 'classnames';
import { useDispatch } from 'react-redux';
import Logger from '../../services/Logger';
import { StarRating } from '../../UIComponents';
import { changeRating } from '../../store/actions/assets';

const Stars = (props) => {
  const dispatch = useDispatch();
  const {
    assetId,
    currentValue,
    ratingChangeable,
    highlight,
    highlightAnimationReset,
  } = props;

  const handleChange = (value) => {
    if (ratingChangeable) {
      Logger.log('User', 'ThumbnailChangeRating');
      if (value === currentValue) {
        dispatch(changeRating([assetId], 0));
      } else {
        dispatch(changeRating([assetId], value));
      }
    }
  };

  return (
    <StarRating
      value={currentValue}
      onChange={handleChange}
      className={cn('catalogItem__stars', {
        disableHover: !ratingChangeable,
        highlightScale: highlight,
      })}
      disabled={!ratingChangeable}
      highlight={highlight}
      highlightAnimationReset={highlightAnimationReset}
    />
  );
};

Stars.propTypes = {
  assetId: PropTypes.string.isRequired,
  currentValue: PropTypes.number,
  highlight: PropTypes.bool,
  highlightAnimationReset: PropTypes.func,
  ratingChangeable: PropTypes.bool,
  stars: PropTypes.arrayOf(PropTypes.number),
};

Stars.defaultProps = {
  currentValue: 0,
  highlight: false,
  highlightAnimationReset: () => {},
  ratingChangeable: true,
  stars: [5, 4, 3, 2, 1],
};

export default Stars;
