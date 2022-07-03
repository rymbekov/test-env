var fn = function() {
	/**
	 * Helper for implementing retries with backoff. Initial retry
	 * delay is 1 second, increasing by 2x (+jitter) for subsequent retries
	 *
	 * @constructor
	 */
	var RetryHandler = function() {
		this.interval = 1000; // Start at one second
		this.maxInterval = 25 * 1000; // Don't wait longer than a minute
	};

	/**
	 * Invoke the function after waiting
	 *
	 * @param {function} fn - Function to invoke
	 */
	RetryHandler.prototype.retry = function(fn, error) {
		setTimeout(fn, this.interval);
		this.interval = this.nextInterval_();
		this.interval > this.maxInterval && error();
	};

	/**
	 * Reset the counter (e.g. after successful request.)
	 */
	RetryHandler.prototype.reset = function() {
		this.interval = 1000;
	};

	/**
	 * Calculate the next wait time.
	 * @return {number} Next wait interval, in milliseconds
	 *
	 * @private
	 */
	RetryHandler.prototype.nextInterval_ = function() {
		var interval = this.interval * 2 + this.getRandomInt_(0, 1000);
		return Math.min(interval, this.maxInterval);
	};

	/**
	 * Get a random int in the range of min to max. Used to add jitter to wait times.
	 *
	 * @param {number} min - Lower bounds
	 * @param {number} max - Upper bounds
	 * @private
	 */
	RetryHandler.prototype.getRandomInt_ = function(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	};

	return RetryHandler;
};

export default fn();
