const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require("cors");
const fs = require('fs');

const UPLOADS_DIR = './public/uploads';

// Set the storage engine
const storage = multer.diskStorage({
	destination: UPLOADS_DIR,
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
	}
});

// Init Upload 
const upload = multer({
	storage,
	limits: { fieldSize: 5000000 },
	fileFilter: function (req, file, callback) {
		checkFileType(file, callback);
	}
}).single('myfile');

// Check File Type
function checkFileType(file, callback) {
	// Allowed ext
	const filetypes = /jpeg|jpg|png|gif/;
	// Check ext
	const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
	// Check mime
	const mimetype = filetypes.test(file.mimetype);

	if (mimetype && extname) {
		return callback(null, true);
	} else {
		callback('Error: Images Only!');
	}
}

function cleanStorageSpace() {
	fs.readdir(UPLOADS_DIR, (err, files) => {
		console.log(`🔧 #length: `, files.length);

		if (files.length > 5) {
			files.sort((a, b) => {
				let aTimestamp = a.replace('myfile-', '');
				aTimestamp = aTimestamp.replace('.png', '');

				let bTimestamp = b.replace('myfile-', '');
				bTimestamp = bTimestamp.replace('.png', '');

				return aTimestamp - bTimestamp;
			});

			const filesToDelete = files.filter((it, index) => index < 5);

			filesToDelete.forEach(it => {
				const targetFilePath = path.join(UPLOADS_DIR, it);
				console.log(`🗑 attempt to delete ${targetFilePath} ...`);
				fs.unlink(targetFilePath, (err) => {
					if (err) { console.log(`🚫 ${targetFilePath} not deleted #err: ${err}`); }
					else { console.log(` ✅ ${targetFilePath} deleted`); }
				})
			});
		}
	})
}

function startup() {
	const app = express();

	// app.set('view engine', 'ejs');
	// app.set('views', path.join(__dirname, './presentation/views'));

	app.use(express.static('./public'));

	// Middleware
	app.use(cors());

	app.get('/', (req, res) => res.render('index'));

	app.post('/upload', (req, res) => {
		console.log(`📦 +++ new request `);
		upload(req, res, (err) => {

			cleanStorageSpace();

			console.log(`🚀 upload()`);
			if (err) {
				console.log(`🚩 post() #err: `, err);
				res.send({ msg: err });
			}
			else {
				if (req.file === undefined) {
					console.log(`🚩 post() #undefined: `, req.file);
					res.send({ msg: 'Error: No File Selected!' });
				}

				else {
					console.log(`📡 here`);
					res.json({
						added: true,
						msg: 'File Uploaded!',
						file: `uploads/${req.file.filename}`
					});
				}
			}

		});
	});

	const PORT = 8080;
	app.listen(process.env.PORT || PORT, () => console.log('Server Started...'));

}

module.exports = startup;