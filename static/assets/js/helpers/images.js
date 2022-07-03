/**
 * Preload image
 * @param {string} url
 * @returns {Promise}
 */
export function preloadImage(url) {
	return new Promise((resolve, reject) => {
		if (!url) {
			reject();
			return;
		}
		const img = new Image();
		img.onload = resolve;
		img.onerror = reject;
		img.src = url;
	});
}

/**
 * @param {string} url
 * @param {number?} interval
 * @returns {Object} { promise: Promise, stop: Function }
 */
export function pollImage(url, interval = 10000) {
	let numberOfAttempts = 0;
	const promise = new Promise(resolve => {
		async function attempt() {
			if (numberOfAttempts < 300) {
				numberOfAttempts += 1;
				try {
					await preloadImage(url);
					resolve();
				} catch (error) {
					setTimeout(attempt, interval);
				}
			}
		}
		attempt();
	});
	const stop = () => (numberOfAttempts = 300);
	return { promise, stop };
}
