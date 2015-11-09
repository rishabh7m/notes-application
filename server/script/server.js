var express = require('express');
var app = express();
var fs = require('fs');
var multer = require('multer');
var mongoClient = require('mongodb').MongoClient;
var upload = multer({dest: '/home/rishabh/Notes/notes-application/server/data/common'});
var objectId = require('mongodb').ObjectId;
var jsonBody = require('body/json');

var commonCollection, user, course, rating;

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
		user = db.collection('user');
		course = db.collection('course');
		ratingCollection = db.collection('rating');
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
			res.json({
				"success": "false"
			});
		}
		else {
			dbValue = {
				"file_id" : sem + '_' + course + '_' + teacher,
				"course_id" : course,
				"sem_id" : sem,
				"teacher" : teacher,
				"location" : filePath,
				"update": 1
			};
			commonCollection.insert(dbValue);
			res.json({
				"success": "true"
			});
		}
	});
});


//	DOWNLOAD PDF FROM SERVER
app.get('/api/notes/:id', function(req, res) {
	var id = req.params.id;
	var newid = new objectId(id);
	var obj;

	commonCollection.findOne({_id: newid}, {location: 1, _id: 0}, function(err, doc) {
		if(!err) {
			console.log(doc);
			//obj = JSON.parse(doc);
			console.log("location: " + doc.location);
			var file = fs.createReadStream(doc.location);
			var stat = fs.statSync(doc.location);
			res.setHeader('Content-Length', stat.size);
			res.setHeader('Content-Type', 'application/pdf');
			res.setHeader('Content-Disposition', 'attachment; filename=' + id + '.pdf');
			file.pipe(res);
		}
		else {
			console.log("error");
		}
	});
});

//	SEM WISE LIST
app.get('/api/notes/sem/:sem', function(req, res) {
	var semId = req.params.sem;
	var semQuery = '"' + semId + '"';
	commonCollection.find({sem_id: semId}, {
		file_id: 1,
		course_id: 1,
		sem_id: 1,
		teacher: 1
	}).toArray(function(err, doc) {
		if(!err) {
			res.json(doc);
		}
		else {
			console.log("error");
			res.send("error");
		}
	})
});

//	SIGN UP
// Status = 0 i.e Email already exists
// Status = 1 i.e UserName already exists
// Status = 2 i.e Registered
app.post('/api/notes/register', function(req, res) {
	jsonBody(req, res, function(err, body) {
		var rollNo = body.RollNo;
		var firstName = body.FirstName;
		var lastName = body.LastName;
		var userName = body.UserName;
		var email = body.Email;
		var password = body.Password;

		user.find({Email: email}, {Email: 1}).toArray(function(err, doc) {
			if(!err) {
				var length = doc.length;
				if(length == 1) {
					res.json({
						"status": 0
					});
				}
				else {
					user.find({UserName: userName}, {UserName: 1}).toArray(function(err, doc) {
						if(!err) {
							var length = doc.length;
							if(length == 1) {
								res.json({
									"status": 1
								});
							}
							else {
								dbValue = {
									"RollNo": rollNo,
									"FirstName": firstName,
									"LastName": lastName,
									"UserName": userName,
									"AvatarUrl": "",
									"Email": email,
									"update": 1,
									"Password": password
								};
								user.insert(dbValue);
								res.json({
									"status": 2,
									"RollNo": rollNo,
									"FirstName": firstName,
									"LastName": lastName,
									"UserName": userName,
									"AvatarUrl": "",
									"Email": email,
								});
							}
						}
					})
				}
			}
		})
	});
});

//	LOGIN
app.post('/api/notes/login', function(req, res) {
	jsonBody(req, res, function(req, body) {
		var userName = body.UserName;
		var password = body.Password;

		user.find({UserName: userName, Password: password}).toArray(function(err, doc) {
			if(!err) {
				var length = doc.length;
				if(length != 0) {
					var jsonObject = doc[0];
					jsonObject.Status = 1;
					res.json(jsonObject);
				}
				else {
					res.json({
						"status": 0
					});
				}
			}
		})
	})
});

//	SEM WISE SUBJECT LIST
app.get('/api/notes/courses/:sem', function(req, res) {
	var semId = req.params.sem;
	course.find({sem: semId}, {code: 1, name: 1, sem: 1}).toArray(function(err, doc) {
		if(!err) {
			res.json(doc);
		}
	})
});

// COURSE WISE LIST
app.get('/api/notes/courses/id/:course_code', function(req, res) {
	var courseId = req.params.course_code;
	commonCollection.find({course_id: courseId}, {course_id: 1, sem_id: 1, teacher: 1}).toArray(function(err, doc) {
		if(!err) {
			res.json(doc);
		}
	})
});

//	RATE NOTES
app.post('/api/notes/rate', function(req, res) {
	jsonBody(req, res, function(err, body) {
		var userId = body.UserId;
		var pdfId = body.PdfId;
		var rating = body.Rating;
		var userObjectId = objectId(userId);
		var pdfObjectId = objectId(pdfId);

		var dbValue = {
			"UserId" : userId,
			"PdfId" : pdfId,
			"Rating" : rating
		};

		ratingCollection.update({
			"UserId" : userId,
			"PdfId" : pdfId,
		}, {
			"UserId" : userId,
			"PdfId" : pdfId,
			"Rating" : rating
		}, {upsert: true, multi: false});
		commonCollection.find({_id: pdfObjectId}, {total_review: 1, rating: 1}).toArray(function(err, doc) {
			if(!err) {
				var list = doc[0];
				var totalReview = list.total_review;
				var listRating = list.rating;

				var oldRating = totalReview * listRating;
				totalReview = totalReview + 1;
				var newRating = (oldRating + rating) / totalReview;

				commonCollection.update({_id: pdfObjectId}, {total_review: totalReview, rating: newRating}, 
					{upsert: true, multi: false});
				res.json({"status": "success"});
			}
		})
	})
})

console.log('server started');
app.listen(3000);