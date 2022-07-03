import Q from 'q';

export default {
	upload: function(blob, url) {
		var dfd = Q.defer();

		// 1. send data to input s3 bucket
		var xhr = new XMLHttpRequest();

		xhr.upload.addEventListener('progress', function(e) {
			if (e.lengthComputable) {
				var percent = e.loaded / e.total;
				dfd.notify({ msg: 'Uploading image... {1}%'.assign(Math.round(percent * 100)), progress: percent });
			}
		});

		xhr.upload.addEventListener('load', function() {
			dfd.notify({ msg: 'Image uploaded...' });
			dfd.resolve(url);
		});
		dfd.notify({ msg: 'Uploading image...' });
		// OPTIONS method should be enabled by bucket's CORS (Allowed header=*)
		xhr.open('PUT', url);
		// xhr.setRequestHeader("Host", "in.stage.raw.pics.io.s3.amazonaws.com");
		xhr.setRequestHeader('x-amz-acl', 'public-read');
		xhr.overrideMimeType('image/jpg');
		xhr.send(blob);

		return dfd.promise;
	},

	delete: function(url) {
		var dfd = Q.defer();

		var xhr = new XMLHttpRequest();

		xhr.addEventListener('load', function() {
			dfd.resolve(url);
		});

		xhr.open('DELETE', url);
		xhr.send();

		return dfd.promise;
	}
};
