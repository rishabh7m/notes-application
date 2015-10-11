var express = require('express');
var app = express();
var fs = require('fs');
var multer = require('multer');
var mongoClient = require('mongodb').MongoClient;
var upload = multer({dest: '/home/rishabh/Notes/notes-application/server/data/common'});
var objectId = require('mongodb').ObjectId;

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


//	DOWNLOAD PDF FROM SERVER
app.get('/api/notes/:id', function(req, res) {
	var id = req.params.id;
	var idQuery = 'ObjectId(" + id + ")';
	var one = 'ObjectId("';
	var two = one + id;
	var three = two + '")'
	//var _id = '_id';
	var rish = 'rishabh';

	var q1 = '{_id: ';
	var q2 = q1 + three;
	var q3 = q2 + '}'

	var newid = new objectId(id);

	/*var updateValue = {};
	updateValue[_id] = three;*/

	/*commonCollection.find({"_id": three}, {location: 1, _id: 0}).toArray(function(err, results) {
		if(!err) {
			console.log(results);
		}
		else {
			res.send("error");
		}
	});*/
	commonCollection.findOne({_id: newid}, {location: 1, _id: 0}, function(err, doc) {
		if(!err) {
			console.log(doc);
		}
		else {
			console.log("error");
		}
	});
});

app.listen(3000);