import React from 'react'; // eslint-disable-line
import PropTypes from 'prop-types';
import cn from 'classnames';
import Icon from '../components/Icon';

const StarRating = ({ onChange, stars, value, disabled, className, highlightAnimationReset, highlight, error }) => (
	<div
		className={cn('defaultRatingList', { [className]: className, isError: error })}
		onAnimationEnd={() => highlightAnimationReset('rating')}
	>
		<div className="innerDefaultRatingList">
			<ul>
				{stars.map((starValue, index) => (
					<li
						key={index}
						className={cn({
							act: value === starValue,
							highlightBlink: highlight,
						})}
						onClick={() => !disabled && onChange(starValue)}
					>
						<span className="icon-svg">
							<Icon name="star" />
						</span>
					</li>
				))}
			</ul>
		</div>
	</div>
);

StarRating.propTypes = {
	className: PropTypes.string,
	onChange: PropTypes.func,
	stars: PropTypes.arrayOf(PropTypes.number),
	value: PropTypes.number,
	disabled: PropTypes.bool,
	highlightAnimationReset: PropTypes.func,
};

StarRating.defaultProps = {
	className: '',
	onChange: () => {},
	stars: [5, 4, 3, 2, 1],
	value: 0,
	disabled: false,
	highlightAnimationReset: () => {},
};

export default StarRating;
