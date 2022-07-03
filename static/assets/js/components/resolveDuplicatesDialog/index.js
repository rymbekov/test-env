import React from 'react'; //eslint-disable-line
import ReactDOM from 'react-dom';
import remove from 'lodash.remove';

import Q from 'q';
import ErrorBoundary from '../ErrorBoundary';
import getThumbnailUrls from '../../helpers/getThumbnailUrls';

import Dialog from './views/index'; // eslint-disable-line
import { showErrorDialog } from '../dialog';

/** Resolve duplicates dialog
 * @param {Function?} onCancel - on press "Cancel" button
 */
export default function(onCancel = () => {}) {
	const parentEl = document.querySelector('.wrapperDuplicatesDialog');
	const close = () => {
		if (parentEl) {
			ReactDOM.unmountComponentAtNode(parentEl);
			if (onCancel) onCancel();
		}
	};

	// TODO: server should return duplicates list with links to local uploading files
	// client mights generate temporary cid to match files on server
	const resolve = function(duplicates, listFiles, showRenameOption = false, showAddRevision = true) {
		const dfd = Q.defer();

		const resolveOne = () => {
			const duplicate = duplicates.shift();

			/**
			 * On press "Ok"
			 * @param {string} actionName
			 * @param {boolean} applyToAll
			 */
			const onOk = (actionName, applyToAll) => {
				const handler = function(duplicateItem) {
					const originalItem = listFiles.find(
						item => (item.name || item.file.name).toLowerCase() === duplicateItem.name.toLowerCase()
					);
					if (originalItem) {
						originalItem.action = actionName;
						originalItem.duplicatedModel = duplicateItem;
					} else {
						showErrorDialog(`Can't resolve duplicate for file ${duplicateItem.name} (${duplicateItem._id})`);
					}
					remove(duplicates, file => file.name.toLowerCase() === duplicateItem.name.toLowerCase());
				};

				handler(duplicate);
				if (applyToAll) {
					duplicates
						.slice()
						.reverse()
						.forEach(handler);
				}

				duplicates.length ? resolveOne() : dfd.resolve(listFiles);
			};

			ReactDOM.render(
				<ErrorBoundary className="errorBoundaryOverlay">
					<Dialog
						fileInfo={duplicate}
						submit={onOk}
						close={close}
						showRenameOption={showRenameOption}
						showAddRevision={showAddRevision}
						getThumbnailUrls={getThumbnailUrls.bind(null, [duplicate._id])}
						showApplyAll={duplicates.length > 0}
					/>
				</ErrorBoundary>,
				parentEl
			);
		};

		resolveOne();
		return dfd.promise;
	};

	return {
		resolve,
	};
}
