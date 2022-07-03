import React from 'react';
import { func, arrayOf, number, string, bool } from 'prop-types';
import cn from 'classnames';
import ModifiedField from './ModifiedField';
import { Flags, Colors, StarRating } from '../../../UIComponents';
import Logger from '../../../services/Logger';

class AssetMarks extends React.Component {
	setFlag = flag => {
		Logger.log('User', `${this.props.eventPrefix}ChangeFlag`, { flag, selectedAssetIds: this.props.selectedAssets });
		if (this.props.flagEditable === true) {
			this.props.changeFlag(this.props.selectedAssets, flag);
		}
	};

	setColor = color => {
		Logger.log('User', `${this.props.eventPrefix}ChangeColor`, { color, selectedAssetIds: this.props.selectedAssets });
		if (this.props.colorEditable === true) {
			this.props.changeColor(this.props.selectedAssets, color);
		}
	};

	setRating = rating => {
		Logger.log('User', `${this.props.eventPrefix}ChangeRating`, {
			rating,
			selectedAssetIds: this.props.selectedAssets,
		});
		if (this.props.ratingEditable === true) {
			if (this.props.rating === rating) {
				this.props.changeRating(this.props.selectedAssets, 0);
			} else {
				this.props.changeRating(this.props.selectedAssets, rating);
			}
		}
	};

	render() {
		const { props } = this;
		let { color, rating, flag, highlight } = props;
		if (!color) color = 'nocolor';
		if (rating === null) rating = 0;
		if (!flag) flag = 'unflagged';

		return this.props.flagShow || this.props.colorShow || this.props.ratingShow ? (
			<div className="assetMarks">
				{/* Flags */}
				{this.props.flagShow && (
					<div className={cn('markWithModifiedField', { markWithModifiedFieldWithIcon: Boolean(props.modifiedFlag) })}>
						<Flags
							value={flag}
							onChange={this.setFlag}
							highlightAnimationReset={this.props.highlightAnimationReset}
							highlight={highlight.includes('flag')}
							className={this.props.flagEditable !== true || this.props.disabled ? 'disabled' : ''}
							error={Boolean(this.props.flagError)}
						/>
						{props.modifiedFlag && <ModifiedField field={props.modifiedFlag} />}
					</div>
				)}

				{/* Colors */}
				{this.props.colorShow && (
					<div className={cn('markWithModifiedField', { markWithModifiedFieldWithIcon: Boolean(props.modifiedColor) })}>
						<Colors
							value={color}
							onChange={this.setColor}
							highlightAnimationReset={this.props.highlightAnimationReset}
							highlight={highlight.includes('color')}
							className={this.props.colorEditable !== true || this.props.disabled ? 'disabled' : ''}
							error={Boolean(this.props.colorError)}
						/>
						{props.modifiedColor && <ModifiedField field={props.modifiedColor} />}
					</div>
				)}

				{/* Rating */}
				{this.props.ratingShow && (
					<div className={cn('markWithModifiedField', { markWithModifiedFieldWithIcon: Boolean(props.modifiedRating) })}>
						<StarRating
							value={rating}
							onChange={this.setRating}
							highlightAnimationReset={this.props.highlightAnimationReset}
							highlight={highlight.includes('rating')}
							className={this.props.ratingEditable !== true || this.props.disabled ? 'disabled' : ''}
							error={Boolean(this.props.ratingError)}
						/>
						{props.modifiedRating && <ModifiedField field={props.modifiedRating} />}
					</div>
				)}
			</div>
		) : null;
	}
}

AssetMarks.propTypes = {
	color: string,
	changeColor: func,
	rating: number,
	changeRating: func,
	flag: string,
	changeFlag: func,
	flagShow: bool,
	flagEditable: bool,
	colorShow: bool,
	colorEditable: bool,
	ratingShow: bool,
	ratingEditable: bool,
	selectedAssets: arrayOf(string),
	disabled: bool,
};

export default AssetMarks;
