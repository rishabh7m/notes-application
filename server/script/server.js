var express = require('express');
var app = express();
var fs = require('fs');
var multer = require('multer');
var mongoClient = require('mongodb').MongoClient;
var upload = multer({dest: '/home/rishabh/Notes/notes-application/server/data/common'});

var commonCollection;

//	SEMESTER PATHS

var sem_1 = '/home/rishabh/Notes/notes-application/server/data/1';
var sem_2 = '/home/rishabh/Notes/notes-application/server/data/2';
var sem_3 = '/home/rishabh/Notes/notes-application/server/data/3';
var sem_4 = '/home/rishabh/Notes/notes-application/server/data/4';
var sem_5 = '/home/rishabh/Notes/notes-application/server/data/5';
var sem_6 = '/home/rishabh/Notes/notes-application/server/data/6';
var sem_7 = '/home/rishabh/Notes/notes-application/server/data/7';
var sem_8 = '/home/rishabh/Notes/notes-application/server/data/8';


//	CONNECTING TO DATABASE

mongoClient.connect("mongodb://localhost:27017/notes", function(err, db) {
	if(!err) {
		console.log('Database Connected...');

		commonCollection = db.collection('common');
	}
	else {
		console.log('Connection Failed...');
	}
});

//	UPLOAD PDF TO SERVER

app.post('/api/notes/upload/:sem/:course/:teacher',upload.single('pdf'), function(req, res, next) {
	var sem = req.params.sem;
	var course = req.params.course;
	var teacher = req.params.teacher;
	var oldPath = req.file.path;
	var semPath, filePath, dbValue;

	/*switch(sem) {
		case 1 :
			semPath = sem_1;
			console.log('Sem 1 ' + sem_1);
			break;
		case 2 :
			semPath = sem_2;
			break;
		case 3 :
			semPath = sem_3;
			break;
		case 4 :
			semPath = sem_4;
			break;
		case 5 :
			semPath = sem_5;
			break;
		case 6 :
			semPath = sem_6;
			break;
		case 7 :
			semPath = sem_7;
			break;
		case 8 :
			semPath = sem_8;
			break;
	}*/
	if(sem == 1) {
		semPath = sem_1;
	}
	else if(sem == 2) {
		semPath = sem_2;
	}
	else if(sem == 3) {
		semPath = sem_3;
	}
	else if(sem == 4) {
		semPath = sem_4;
	}
	else if(sem == 5) {
		semPath = sem_5;
	}
	else if(sem == 6) {
		semPath = sem_6;
	}
	else if(sem == 7) {
		semPath = sem_7;
	}
	else if(sem == 8) {
		semPath = sem_8;
	}

	filePath = semPath + '/' + course + '/' + sem + '_' + course + '_' + teacher + '.pdf';
	fs.rename(oldPath, filePath, function(err) {
		if(err) {
			res.send('error...');
		}
		else {
			dbValue = {
				"file_id" : sem + '_' + course + '_' + teacher,
				"course_id" : course,
				"sem_id" : sem,
				"teacher" : teacher,
				"location" : filePath
			};
			commonCollection.insert(dbValue);
			res.send('success');
		}
	});
});

app.listen(3000);