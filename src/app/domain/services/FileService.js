const fs = require('fs');
const path = require('path');

const fileService = (function () {
	const UPLOADS_DIR = './public/uploads';

	function cleanStorageSpace() {
		fs.readdir(UPLOADS_DIR, (err, files) => {
			if (err) {
				console.log(`🚫 [FileService] cleanStorage() -> readDir() failed #err: `, err);
				return;
			}

			files.forEach(it => {
				const targetFilePath = path.join(UPLOADS_DIR, it);
				fs.unlink(targetFilePath, (err) => {
					if (err) { console.log(`🚫 ${targetFilePath} not deleted #err: ${err}`); }
					else { console.log(` ✅ ${targetFilePath} deleted`); }
				})
			});
		});
	}

	return {
		cleanStorageSpace
	}

})();

module.exports = fileService;