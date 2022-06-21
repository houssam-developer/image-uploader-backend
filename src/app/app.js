const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require("cors");
const schedule = require('node-schedule');
const fileService = require('./domain/services/FileService');

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


function startup() {
	const app = express();
	app.use(express.static('./public'));

	// Middleware
	app.use(cors());

	app.get('/', (req, res) => res.json({ msg: 'welcome to uploader-image api' }));
	app.post('/upload', (req, res) => {
		fileService.cleanStorageSpace();
		upload(req, res, (err) => {

			if (err) { res.send({ msg: err }); }
			else {
				if (req.file === undefined) { res.send({ msg: 'Error: No File Selected!' }); }
				else {
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
	app.listen(process.env.PORT || PORT, () => {
		console.log('Server Started...');

		schedule.scheduleJob('0 0 * * *', () => {
			console.log(`📡 [App] cron-like job`);
			fileService.cleanStorageSpace();
			// if failed send email 
		});
	});
}

module.exports = startup;