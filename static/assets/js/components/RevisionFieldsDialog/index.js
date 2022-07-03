import React, { useState, useEffect } from 'react';
import uniqBy from 'lodash.uniqby';
import remove from 'lodash.remove';
import cn from 'classnames';
import { useSelector } from 'react-redux';
import Logger from '../../services/Logger';
import * as utils from '../../shared/utils';
import localization from '../../shared/strings';
import KeywordsDropdown from '../keywordsDropdown';
import AssigneesDropdown from '../assigneesDropdown';
import { Textarea } from '../../UIComponents';

import Description from '../details/view/Description';
import AssetMarks from '../details/view/AssetMarks';
import Icon from '../Icon';
import { showDialog } from '../dialog';

const { REVISION_FIELDS_DIALOG } = localization;

export default function(props) {
	const $content = React.createRef();
	const $innerContent = React.createRef();
	const { isKeywordsActionsAllowed } = useSelector(state => state.user);

	const [errors, setErrors] = useState({});
	const [comment, setComment] = useState('');
	const [title, setTitle] = useState('');
	const [selectedKeywords, setKeywords] = useState([]);
	const [selectedUsers, setUsers] = useState([]);
	const [description, setDescription] = useState('');
	const [rating, setRating] = useState(null);
	const [flag, setFlag] = useState(null);
	const [color, setColor] = useState(null);
	const [overflowVisible, setOverflowVisible] = useState(false);
	// hack based on https://stackoverflow.com/questions/53845595/wrong-react-hooks-behaviour-with-event-listener
	// for update state from listener
	const [freshState, setState] = useState(1);

	useEffect(() => {
		const KEY_ENTER = 13;
		const KEY_ESC = 27;
		const KEY_UP = 38;
		const KEY_DOWN = 40;
		/** @param {KeyboardEvent} event */
		const keyListener = event => {
			const isSomeInputFocused =
				document.activeElement.contentEditable === 'true' ||
				['INPUT', 'TEXTAREA'].includes(document.activeElement.nodeName);
			switch (event.keyCode) {
				case KEY_ENTER: {
					if (!isSomeInputFocused) submit();
					break;
				}
				case KEY_ESC: {
					cancel();
					break;
				}
				case KEY_UP: {
					break;
				}
				case KEY_DOWN: {
					break;
				}
			}
		};
		window.addEventListener('keydown', keyListener);

		return () => window.removeEventListener('keydown', keyListener);
	});

	useEffect(() => {
		const innerContentHeight = $innerContent && $innerContent.current.clientHeight;
		const innerContentScrollHeight = $innerContent && $innerContent.current.scrollHeight;
		const isOverflowVisible = innerContentHeight >= innerContentScrollHeight;
		setOverflowVisible(isOverflowVisible);

		const resizeListener = () => {
			setState(freshState => {
				++freshState;
				return freshState;
			});
			if (!isOverflowVisible !== overflowVisible) {
				setOverflowVisible(isOverflowVisible);
			}
		}

		window.addEventListener('resize', resizeListener);
		return () => window.removeEventListener('resize', resizeListener);
	});

	const cancel = () => {
		props.onCancel();
		props.destroy();
	};

	const submit = async () => {
		let errors = {};
		const requiredFields = props.requiredFields;

		if (requiredFields.comments && !comment.length) {
			errors.comment = localization.IMPORT.textCommentRequiredText;
		}
		if (requiredFields.titleAndDescription) {
			if (!title.length) {
				errors.title = localization.IMPORT.titleRequired;
			}
			if (!description.length) {
				errors.description = localization.IMPORT.textFieldIsRequired;
			}
		}
		if (requiredFields.keywords && !selectedKeywords.length) {
			errors.keywords = localization.IMPORT.textFieldIsRequired;
		}
		if (requiredFields.assignees && !selectedUsers.length) {
			errors.assignees = localization.IMPORT.textFieldIsRequired;
		}
		if (requiredFields.flag && !flag) {
			errors.flag = true;
			errors.assetMarks = localization.IMPORT.textFieldIsRequired;
		}
		if (requiredFields.rating && !rating) {
			errors.rating = true;
			errors.assetMarks = localization.IMPORT.textFieldIsRequired;
		}
		if (requiredFields.color && !color) {
			errors.color = true;
			errors.assetMarks = localization.IMPORT.textFieldIsRequired;
		}

		if (!utils.isEmptyObject(errors)) {
			setErrors(errors);

			if (errors.keywords && !props.permissions.editAssetKeywords) {
				showDialog({
					title: localization.DIALOGS.UPLOAD_KEYWORDS_PERMISSION.TITLE,
					text: localization.DIALOGS.UPLOAD_KEYWORDS_PERMISSION.TEXT,
					textBtnCancel: null,
					textBtnOk: localization.DIALOGS.UPLOAD_KEYWORDS_PERMISSION.OK_TEXT,
				});
			}
			return;
		}

		const additionalFields = {
			comment: comment,
			title: title,
			description: description,
			keywordsIds: selectedKeywords.map(keyword => keyword._id),
			assigneeIds: selectedUsers.map(user => user._id),
			flag: flag,
			color: color,
			rating: rating,
			selectedCustomFields: [],
		};

		props.onOk(additionalFields);
		props.destroy();
	};

	/** Comment start */
	const handleCommentChange = event => {
		const newErrors = { ...errors };
		delete newErrors.comment;
		setComment(event.currentTarget.value);
		setErrors(newErrors);
	};

	const handleCommentBlur = () => {
		Logger.log('User', 'RevisionsDialogAddComment');
	};

	const onResizeTextrea = value => localStorage.setItem('picsio.revisionFieldsDialogCommentHeight', value);
	/** Comment end */

	const handleTitleChange = (id, title) => {
		const newErrors = { ...errors };
		delete newErrors.title;
		setTitle(title);
		setErrors(newErrors);
	};

	const handleDescriptionChange = (id, description) => {
		const newErrors = { ...errors };
		delete newErrors.description;
		setDescription(description);
		setErrors(newErrors);
	};

	/**
	 * Keywords start
	 * @param {(object|Array)} items
	 * @returns {array}
	 */
	const selectKeyword = items => {
		let keywords = [];
		if (items.length) {
			keywords = [...selectedKeywords, ...items];
		} else {
			keywords = [...selectedKeywords, items];
		}
		keywords = uniqBy(keywords, '_id');
		const newErrors = { ...errors };
		delete newErrors.keywords;

		setKeywords(keywords);
		setErrors(newErrors);
	};

	const deselectKeyword = item => {
		let keywords = [...selectedKeywords];
		remove(keywords, keyword => keyword._id === item._id);

		setKeywords(keywords);
	};

	const handleKeywordsBlur = () => {
		Logger.log('User', 'RevisionsDialogAttachKeywords', selectedKeywords.length);
	};
	/** Keywords end */

	/** Users start */
	const selectUser = item => {
		let users = [...selectedUsers];
		const newItem = { ...item };
		users.push(newItem);
		const newErrors = { ...errors };
		delete newErrors.assignees;
		setUsers(users);
		setErrors(newErrors);
	};

	const deselectUser = item => {
		let users = [...selectedUsers];
		remove(users, user => user._id === item._id);

		setUsers(users);
	};

	const handleUsersBlur = () => {
		Logger.log('User', 'RevisionsDialogAssignUsers', selectedUsers.length);
	};
	/** Users end */

	/** Asset Marks start */
	const handleFlagChange = (id, flag) => {
		const newErrors = { ...errors };
		delete newErrors.flag;
		delete newErrors.assetMarks;
		setFlag(flag);
		setErrors(newErrors);
	};

	const handleColorChange = (id, color) => {
		const newErrors = { ...errors };
		delete newErrors.color;
		delete newErrors.assetMarks;
		setColor(color);
		setErrors(newErrors);
	};

	const handleRatingChange = (id, rating) => {
		const newErrors = { ...errors };
		delete newErrors.rating;
		delete newErrors.assetMarks;
		setRating(rating);
		setErrors(newErrors);
	};
	/** Asset Marks end */

	let dialogTitle = REVISION_FIELDS_DIALOG.title;
	let action = 'fill some fields';
	let requiredFieldsKeys = [];
	for (let field in props.requiredFields) {
		if (props.requiredFields[field]) {
			requiredFieldsKeys.push(field);
		}
	}

	if (requiredFieldsKeys.length === 1) {
		dialogTitle = REVISION_FIELDS_DIALOG.titles[requiredFieldsKeys[0]];
		action = dialogTitle.toLowerCase();
	}

	const isAssetMarks = props.requiredFields.flag || props.requiredFields.rating || props.requiredFields.color;

	return (
		<div className="simpleDialog revisionFieldsDialog">
			<div className="simpleDialogUnderlayer" />
			<div className="simpleDialogBox">
				<div className="simpleDialogHeader">
					<span className="simpleDialogTitle">{dialogTitle}</span>
					<span className="simpleDialogBtnCross" onClick={cancel}>
						<Icon name="close" />
					</span>
				</div>
				<div className="simpleDialogContent" ref={$content}>
					<div className={cn("simpleDialogContentInner", { overflowVisible: overflowVisible })} ref={$innerContent}>
						<p>{localization.REVISION_FIELDS_DIALOG.description(action)}</p>
						{props.requiredFields.comments && (
							<div className="revisionField">
								<div className="revisionFieldLabel">{localization.REVISION_FIELDS_DIALOG.labelCommentRevision}</div>
								<Textarea
									placeholder={localization.IMPORT.placeholderInputComment}
									value={comment}
									onChange={handleCommentChange}
									onBlur={handleCommentBlur}
									onResize={onResizeTextrea}
									height={localStorage.getItem('picsio.revisionFieldsDialogCommentHeight')}
									error={errors.comment}
								/>
							</div>
						)}
						{props.requiredFields.titleAndDescription && (
							<div className="revisionField">
								<div className="revisionFieldLabel">{localization.REVISION_FIELDS_DIALOG.labelTitleAndDescription}</div>
								<Description
									eventPrefix="RevisionsDialog"
									collection={[
										{
											title: title,
											description: description,
										},
									]}
									selectedAssetsIds={['']}
									titleShow={true}
									titleEditable={true}
									descriptionShow={true}
									descriptionEditable={true}
									textareaHeightNameLS="picsio.revisionFieldsDialogDescriptionHeight"
									changeTitle={handleTitleChange}
									changeDescription={handleDescriptionChange}
									titleError={errors.title}
									descriptionError={errors.description}
								/>
							</div>
						)}
						{props.requiredFields.keywords && (
							<div className="revisionField">
								<div className="revisionFieldLabel">{localization.REVISION_FIELDS_DIALOG.labelKeywords}</div>
								<KeywordsDropdown
									placeholder={localization.DROPDOWN.placeholderKeywords}
									placeholderIcon="emptyKeywords"
									icon="keyword"
									filterText={localization.DROPDOWN.chooseKeywords}
									createText={localization.DROPDOWN.createKeyword}
									createPlaceholderText={localization.DROPDOWN.placeholderKeywordsCreate}
									checkedItems={selectedKeywords}
									onCheckedHandler={selectKeyword}
									onUncheckedHandler={deselectKeyword}
									canCreate={isKeywordsActionsAllowed}
									onBlur={handleKeywordsBlur}
									isOnlyCreate={true}
									readOnly={props.permissions.editAssetKeywords !== true}
									error={errors.keywords}
								/>
								{errors.keywords && <div className="revisionFieldError errorMessage">{errors.keywords}</div>}
							</div>
						)}
						{props.requiredFields.assignees && (
							<div className="revisionField">
								<div className="revisionFieldLabel">{localization.REVISION_FIELDS_DIALOG.labelAssignees}</div>
								<AssigneesDropdown
									placeholder={localization.ASSING_USER.placeholder}
									icon="avatar"
									placeholderIcon="emptyAvatar"
									filterText={localization.ASSING_USER.filterText}
									checkedItems={selectedUsers}
									onCheckedHandler={selectUser}
									onUncheckedHandler={deselectUser}
									onBlur={handleUsersBlur}
									disabled={false}
									readOnly={props.permissions.editAssetAssignees !== true}
									error={errors.assignees}
								/>
								{errors.assignees && <div className="revisionFieldError errorMessage">{errors.assignees}</div>}
							</div>
						)}
						{isAssetMarks && (
							<div className="revisionField">
								<div className="revisionFieldLabel">{localization.REVISION_FIELDS_DIALOG.labelAssetMarks}</div>
								<AssetMarks
									eventPrefix="RevisionsDialog"
									color={color}
									changeColor={handleColorChange}
									rating={rating}
									changeRating={handleRatingChange}
									flag={flag}
									changeFlag={handleFlagChange}
									flagShow={true}
									flagEditable={props.permissions.editAssetMarks}
									colorShow={true}
									colorEditable={props.permissions.editAssetMarks}
									ratingShow={true}
									ratingEditable={props.permissions.editAssetMarks}
									selectedAssets={['']}
									highlight={[]}
									disabled={false}
									flagError={errors.flag}
									colorError={errors.color}
									ratingError={errors.rating}
								/>
								{errors.assetMarks && <div className="revisionFieldError errorMessage">{errors.assetMarks}</div>}
							</div>
						)}
					</div>
				</div>
				<div className="simpleDialogFooter">
					<span className="simpleDialogFooterBtn simpleDialogFooterBtnCancel" onClick={cancel}>
						{REVISION_FIELDS_DIALOG.textBtnCancel}
					</span>
					<span className="simpleDialogFooterBtn" onClick={submit}>
						{REVISION_FIELDS_DIALOG.textBtnOk}
					</span>
				</div>
			</div>
		</div>
	);
}
