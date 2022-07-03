import React from 'react';
import { array, string, func, bool, oneOfType } from 'prop-types';
import cn from 'classnames';

import Logger from '../../../services/Logger';
import localization from '../../../shared/strings';
import { Input, Textarea } from '../../../UIComponents';

import ModifiedField from './ModifiedField';

class Description extends React.Component {
	initialTitle = null;

	initialDescription = null;

	state = {
		title: '',
		description: '',
	};

	componentDidMount() {
		this.setTitleAndDescription();
	}

	componentDidUpdate(prevProps) {
		const { selectedAssetsIds } = this.props;
		const isOneAsset = selectedAssetsIds.length === 1;

		if (prevProps.selectedAssetsIds.length !== selectedAssetsIds.length) {
			this.setTitleAndDescription();
		} else if (isOneAsset) {
			const activeAssetId = selectedAssetsIds[0];

			if (prevProps.selectedAssetsIds[0] !== activeAssetId) {
				this.setTitleAndDescription();
			}
		}
	}

	setTitleAndDescription() {
		const { collection } = this.props;
		const { title = '', description = '' } = collection[0];

    if (collection.length > 1) {
      const differentTitles = collection.some(asset => asset.title !== title);
      const differentDescriptions = collection.some(asset => asset.description !== description);
      let nextTitle = title;
      let nextDescription = description;

      if (differentTitles) nextTitle = '';
      if (differentDescriptions) nextDescription = '';

      this.setState({ title: nextTitle, description: nextDescription });
    } else {
      this.setState({ title, description });
    }
	}

	onResizeTextrea = value => localStorage.setItem(this.props.textareaHeightNameLS, value);

	onTitleFocus = event => (this.initialTitle = event.target.value);

	onTitleChange = (event, title) => this.setState({ title });

	onTitleBlur = (event, title) => {
		title = title.trim();
		const { initialTitle } = this;
		const onCancel = () => this.setState({ title: initialTitle });

		if (this.initialTitle !== this.state.title) {
			this.props.changeTitle(this.props.selectedAssetsIds, title, onCancel);
			Logger.log('User', `${this.props.eventPrefix}ChangeTitle`, { selectedAssetsIds: this.props.selectedAssetsIds });
		}
		this.initialTitle = null;
	};

	onDescriptionFocus = event => (this.initialDescription = event.target.value);

	onDescriptionChange = (event, description) => this.setState({ description });

	onDescriptionBlur = (event, description) => {
		description = description.trim();
		const { initialDescription } = this;
		const onCancel = () => this.setState({ description: initialDescription });

		if (this.initialDescription !== this.state.description) {
			this.props.changeDescription(this.props.selectedAssetsIds, description, onCancel);
			Logger.log('User', `${this.props.eventPrefix}ChangeDesc`, { selectedAssetsIds: this.props.selectedAssetsIds });
		}
		this.initialDescription = null;
	};

	render() {
		const { state, props } = this;
		const titlePlaceholder = !props.titleEditable
			? localization.DETAILS.placeholderUneditabledTitle
			: props.collection.length > 1
				? localization.DETAILS.placeholderMultipleSelection
				: localization.DETAILS.placeholderEnterTitle;
		const descriptionPlaceholder = !props.descriptionEditable
			? localization.DETAILS.placeholderUneditabledDescription
			: props.collection.length > 1
				? localization.DETAILS.placeholderMultipleSelection
				: localization.DETAILS.placeholderEnterDescription;

		return (
			<div data-qa="details-description">
				{props.titleShow && (
					<div className={cn('inputWithModifiedField', { inputWithModifiedFieldWithIcon: Boolean(props.modifiedTitle) })}>
						<Input
							value={state.title}
							onFocus={this.onTitleFocus}
							onChange={this.onTitleChange}
							onBlur={this.onTitleBlur}
							placeholder={titlePlaceholder}
							disabled={props.titleEditable !== true || props.disabled}
							description={props.titleEditable === 'mixed' && localization.DETAILS.mixedField}
							error={props.titleError}
							autoFocus={props.autoFocus}
						/>
						{props.modifiedTitle && <ModifiedField field={props.modifiedTitle} />}
					</div>
				)}
				{props.descriptionShow && (
					<div className={cn('inputWithModifiedField', { inputWithModifiedFieldWithIcon: Boolean(props.modifiedDescription) })}>
						<Textarea
							value={state.description}
							onFocus={this.onDescriptionFocus}
							onChange={this.onDescriptionChange}
							onBlur={this.onDescriptionBlur}
							placeholder={descriptionPlaceholder}
							onResize={this.onResizeTextrea}
							height={localStorage.getItem(props.textareaHeightNameLS)}
							disabled={props.descriptionEditable !== true || props.disabled}
							description={props.descriptionEditable === 'mixed' && localization.DETAILS.mixedField}
							error={props.descriptionError}
						/>
						{props.modifiedDescription && <ModifiedField field={props.modifiedDescription} />}
					</div>
				)}
			</div>
		);
	}
}

Description.propTypes = {
	collection: array,
	selectedAssetsIds: array,
	titleShow: bool,
	titleEditable: oneOfType([string, bool]),
	descriptionShow: bool,
	descriptionEditable: oneOfType([string, bool]),
	textareaHeightNameLS: string,
	changeTitle: func,
	changeDescription: func,
};

export default Description;
