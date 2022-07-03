/**
 * Calculate grid for CatalogView
 * @param {Array} assets
 * @param {number} wrapperWidth
 * @param {boolean} isListMode
 * @param {number?} multiplier
 * @returns {Object}
 */
export default function calcGrid(assets, wrapperWidth, isListMode, multiplier = 1) {
	const MIN_RATIO = wrapperWidth / 300;
	const MIN_ROW_HEIGHT = 205;
	const MAX_ROW_HEIGHT = 400;
	const MIN_IMAGE_WIDTH = 150;
	const ITEM_HEIGHT_IN_LIST_VIEW = (window.innerWidth >= 768 ? 120 : 76) * multiplier;

	let row = []; // The list of images in the current row.
	let translateX = 0; // The current translateX value that we are at
	let translateY = 0; // The current translateY value that we are at
	let rowAspectRatio = 0; // The aspect ratio of the row we are building

	const itemsStyles = [];

	// if list view
	if (isListMode) {
		assets.forEach(() => {
			itemsStyles.push({
				width: parseInt(wrapperWidth, 10),
				height: ITEM_HEIGHT_IN_LIST_VIEW,
				translateX: 0,
				translateY
			});

			translateY += ITEM_HEIGHT_IN_LIST_VIEW - 2;
		});
	} else {
		assets.forEach((_asset, index) => {
			const asset = { ..._asset };
			const { imageMediaMetadata } = asset;
			asset.imageAspectRatio =
				imageMediaMetadata &&
				imageMediaMetadata.height &&
				imageMediaMetadata.width &&
				imageMediaMetadata.height > MIN_ROW_HEIGHT &&
				imageMediaMetadata.width > MIN_IMAGE_WIDTH
					? imageMediaMetadata.width / imageMediaMetadata.height
					: 1;
			if (asset.imageAspectRatio < 9 / 16) asset.imageAspectRatio = 9 / 16;

			rowAspectRatio += parseFloat(asset.imageAspectRatio);
			row.push(asset);

			if (rowAspectRatio >= MIN_RATIO || index + 1 === assets.length) {
				// Make sure that the last row also has a reasonable height
				rowAspectRatio = Math.max(rowAspectRatio, MIN_RATIO);
				const tmp = [];
				let altRowHeight = null;
				let rowHeight = wrapperWidth / rowAspectRatio;

				// if one image in the row and not last
				if (row.length === 1 && index + 1 !== assets.length) {
					rowHeight = wrapperWidth / rowAspectRatio;
					if (rowHeight < MIN_ROW_HEIGHT) rowHeight = MIN_ROW_HEIGHT;
					if (rowHeight > MAX_ROW_HEIGHT) rowHeight = MAX_ROW_HEIGHT;

					itemsStyles.push({
						width: wrapperWidth,
						height: rowHeight,
						translateX,
						translateY
					});
				} else {
					if (row.some(item => rowHeight * item.imageAspectRatio < MIN_IMAGE_WIDTH)) {
						tmp.push(row.pop());
						rowAspectRatio -= parseFloat(tmp[0].imageAspectRatio);
						rowHeight = wrapperWidth / rowAspectRatio;
					}

					if (rowHeight < MIN_ROW_HEIGHT) altRowHeight = MIN_ROW_HEIGHT;
					if (rowHeight > MAX_ROW_HEIGHT) altRowHeight = MAX_ROW_HEIGHT;

					row.forEach(item => {
						const imageWidth = rowHeight * item.imageAspectRatio;

						itemsStyles.push({
							width: imageWidth,
							height: altRowHeight || rowHeight,
							translateX,
							translateY
						});

						translateX += imageWidth;
					});
				}

				// Reset our state variables for next row.
				row = tmp;
				rowAspectRatio = row.length > 0 ? row[0].imageAspectRatio : 0;
				translateY += altRowHeight || parseInt(rowHeight, 10);
				translateX = 0;

				// if it's the last asset and if it in the next row
				if (row.length && index + 1 === assets.length) {
					rowHeight = wrapperWidth / rowAspectRatio;
					if (rowHeight < MIN_ROW_HEIGHT) rowHeight = MIN_ROW_HEIGHT;
					if (rowHeight > MAX_ROW_HEIGHT) rowHeight = MAX_ROW_HEIGHT;

					itemsStyles.push({
						width: rowHeight * rowAspectRatio,
						height: rowHeight,
						translateX,
						translateY
					});
				}
			}
		});
	}

	return {
		wrapperHeight: translateY,
		itemsStyles
	};
}
