import { createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import * as Api from '../../api/lightboards';
import Logger from '../../services/Logger';
import localization from '../../shared/strings';
import TYPES from '../action-types';

import {
	updateLightboard as updateLightboardAssetsAction,
	deleteLightboard as deleteLightboardAssetsAction,
} from './assets';
import getOptimisticReponse from '../helpers/lightboards/getOptimisticResponse';

import { navigateToRoot, reloadRoute } from '../../helpers/history';
import { showDialog } from '../../components/dialog';

const PD = '→';

/**
 * Get lightboards
 */
const customId = 'getLightboardsFailed';
export function getLightboards() {
	return async dispatch => {
		dispatch({ type: TYPES.LIGHTBOARDS.FETCH.START });

		try {
			const lightboards = await Api.getAll();

			dispatch({
				type: TYPES.LIGHTBOARDS.FETCH.COMPLETE,
				payload: { lightboards },
			});
		} catch (error) {
			Logger.log('UI', 'ToastLightboardsNotLoaded');
			toast.error(
				'Lightboards has not loaded. Try refreshing the page to see them.',
				{
					toastId: customId,
					autoClose: false,
				},
			);
			dispatch({
				type: TYPES.LIGHTBOARDS.FETCH.FAILED,
				error,
			});
			Logger.error(new Error('Can not get lightboards'), { error }, [
				'GetLightboardsFailed',
				(error && error.message) || 'NoMessage',
			]);
		}
	};
}

/**
 * Rename lightboard
 * @param {Object} lightboard
 * @param {String} newName
 */
export function rename(lightboard, newName) {
	return async dispatch => {
		dispatch({
			type: TYPES.LIGHTBOARDS.RENAME.START,
			payload: { lightboardID: lightboard._id },
		});

		try {
			const pathParts = lightboard.path.split(PD).slice(0, -1);
			pathParts.push(newName);
			const path = pathParts.join(PD);

			await Api.rename(lightboard._id, path);

			dispatch({
				type: TYPES.LIGHTBOARDS.RENAME.COMPLETE,
				payload: { lightboardID: lightboard._id, path },
			});
			updateLightboardAssetsAction(lightboard._id, { path })(dispatch);
		} catch (error) {
			dispatch({
				type: TYPES.LIGHTBOARDS.RENAME.FAILED,
				payload: {
					lightboardID: lightboard._id,
					error: localization.LIGHTBOARDSTREE.errorUnableToRename,
				},
				error,
			});
			Logger.error(new Error('Can not rename lightboard'), { error }, [
				'RenameLightboardFailed',
				(error && error.message) || 'NoMessage',
			]);
			return showDialog({
				title: 'Error',
				text: localization.LIGHTBOARDSTREE.errorUnableToRename,
				textBtnCancel: null,
			});
		}
	};
}

/**
 * Remove lightboard
 * @param {string} id
 * @param {string} name
 */
export function remove(id, name) {
	return (dispatch, getAll) => {
		function handleError(error) {
			dispatch({
				type: TYPES.LIGHTBOARDS.REMOVE.FAILED,
				payload: { id },
				error,
			});
			Logger.error(new Error('Can not remove lightboard'), { error }, [
				'RemoveLightboardFailed',
				(error && error.message) || 'NoMessage',
			]);
		}
		async function doRemove() {
			try {
				dispatch({
					type: TYPES.LIGHTBOARDS.REMOVE.START,
					payload: { id },
				});

				await Api.remove(id);
				dispatch({
					type: TYPES.LIGHTBOARDS.REMOVE.COMPLETE,
					payload: { id },
				});
				Logger.log('User', 'ConfirmDeleteLBYes', { lightboardId: id });
				/** Delete lightboard from assets inside Store */
				deleteLightboardAssetsAction(id)(dispatch);

				if (getAll().router.location.query.lightboardId === id) {
					navigateToRoot();
				}
			} catch (error) {
				handleError(error);
			}
		}
		Logger.log('UI', 'ConfirmDeleteLB');
		showDialog({
			title: localization.LIGHTBOARDS.textDeleteLightboard,
			text: localization.LIGHTBOARDS.textDeleteName(name),
			textBtnCancel: localization.DIALOGS.btnNo,
			textBtnOk: localization.DIALOGS.btnYes,
			onOk: doRemove,
			onCancel: () => Logger.log('User', 'ConfirmDeleteLBNo'),
		});
	};
}

/**
 * Add lightboard
 * @param {string} path
 * @param {string} parentID
 */
export function add(path) {
	return async dispatch => {
		try {
			const optimisticResponse = getOptimisticReponse(path);
			const { _id } = optimisticResponse;

			dispatch({ type: TYPES.LIGHTBOARDS.ADD.START, payload: { optimisticResponse } });

			const lightboard = await Api.add(path);

			dispatch({
				type: TYPES.LIGHTBOARDS.ADD.COMPLETE,
				payload: { lightboard, optimiticId: _id },
			});
		} catch (error) {
			dispatch({
				type: TYPES.LIGHTBOARDS.ADD.FAILED,
				error,
			});
			Logger.error(new Error('Can not add lightboard'), { error }, [
				'AddLightboardFailed',
				(error && error.message) || 'NoMessage',
			]);
		}
	};
}

/**
 * Apply search
 * @param {string} value
 */
export function applySearch(value) {
	return dispatch => {
		dispatch({
			type: TYPES.LIGHTBOARDS.SEARCH,
			payload: { value },
		});
	};
}

/**
 * Set sort type to lightboard
 * @param {string} lightboardID
 * @param {string} value
 */
export const setSortType = (lightboardID, value) => dispatch => {
	dispatch({
		type: TYPES.LIGHTBOARDS.SET_SORT_TYPE,
		payload: { lightboardID, value },
	});
};

/**
 * Update sort type to lightboard
 * @param {string} lightboardID
 * @param {string} value
 */
export function updateSortType(lightboardID, sortType) {
	return async dispatch => {
		try {
			dispatch({ type: TYPES.LIGHTBOARDS.UPDATE_SORT_TYPE.START, payload: { lightboardID } });
			await Api.setSortType(lightboardID, sortType);
			dispatch({
				type: TYPES.LIGHTBOARDS.UPDATE_SORT_TYPE.COMPLETE,
				payload: { lightboardID, sortType },
			});
			reloadRoute();
		} catch (error) {
			dispatch({
				type: TYPES.LIGHTBOARDS.UPDATE_SORT_TYPE.FAILED,
				payload: { lightboardID },
				error,
			});
			Logger.error(new Error('Can not update sort type lightboard'), { error }, [
				'UpdateSortTypeLightboardFailed',
				(error && error.message) || 'NoMessage',
			]);
		}
	};
}

export const setActiveLightboard = createAsyncThunk(
	'lightboards/setActiveLightboard',
	async (lightboardId, { rejectWithValue, dispatch, getState }) => {
		const currectActiveLightboard = getState().lightboards.activeLightboard;
		try {
			if (lightboardId === null) {
				if (currectActiveLightboard === null) return;
				dispatch({ type: 'lightboards/setActiveLightboard', payload: { lightboard: null } });
				return;
			}

			const lightboard = getState().lightboards.lightboards.find(lb => lb._id === lightboardId);
			if (currectActiveLightboard?._id === lightboard?._id) return;
			dispatch({ type: 'lightboards/setActiveLightboard', payload: { lightboard } });

			return {
				lightboard
			};
		} catch (e) {
			return rejectWithValue(e);
		}
	}
);
