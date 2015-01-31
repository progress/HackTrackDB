/*
// app.js
// HackTrack
//
// Copyright 2015 (c) Progress Software
// Author: Akhil Nistala
*/

var http = require('http');
var mongojs = require('mongojs');
var app = require('express')();
var bodyParser = require('body-parser');
var multer = require('multer');

var uri = /* MongoDB URI */;
var reg_db = mongojs.connect(uri, ["registration"]);
var beacon_db = mongojs.connect(uri, ["beacons"]);
var team_db = mongojs.connect(uri, ["teams"]);
var hacks_db = mongojs.connect(uri, ["hacks"]);

// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true })); 

// for parsing multipart/form-data
app.use(multer()); 

// Setting port
app.set('port', process.env.PORT || 8080);

// GET Homepage
app.get('/', function(req, res) {
	res.send(200, "<b>Welcome to HackTrack!</b>");
});

// POST to Add New User
app.post('/adduser', function(req, res) {
	var auth = /* Authentication Code */;

	var email = req.body.email.toLowerCase();
	var password = req.body.password;
	var completed = req.body.completed;

	if (req.headers.auth === auth) {
		reg_db.registration.find({ "email": email }, function(err, records) {
			if (err) {
				console.log(err);
				res.status(500).send('Error!');
			} else if (records.length > 0) {
				res.status(500).send('Email is already registered');
			} else {
				reg_db.registration.insert({
					email: email,
					password: password,
					completed: completed
				}, function(err, doc) {
					if (err) {
						console.log(err);
						res.status(500).send('Error!');
					} else {
						res.status(200).send('OK');
					}
				});
			}
		});
	} else {
		res.status(500).send('Invalid Authorization!');
	}
});

// POST to Login
app.post('/login', function(req, res) {
	var auth = /* Authentication Code */;

	var email = req.body.email.toLowerCase();
	var password = req.body.password;

	if (req.headers.auth === auth) {
		reg_db.registration.find({ "email": email }, function(err, records) {
			if (err) {
				console.log(err);
				res.end();
			} else {
				if (records.length === 0) {
					res.status(500).send('Email is not registered');
				} else if (password === records[0].password) {
					if (records[0].completed == true) {
						res.status(201).send('Registration complete');
					} else {
						res.status(202).send('Finish registration');
					}			
				} else {
					res.status(501).send('Incorrect password');
				}
			}
		});
	} else {
		res.status(505).send('Invalid Authorization');
	}
});

// POST to Recover Password
app.post('/resetpassword', function(req, res) {
	var auth = /* Authentication Code */;

	var email = req.body.email.toLowerCase();
	var password = req.body.password;

	if (req.headers.auth === auth) {
		reg_db.registration.update({ "email": email }, { $set: { "password": password }});
		res.status(200).send('Password successfully updated');
	} else {
		res.status(500).send('Invalid Authorization');
	}
});

// POST to Verify Account Existance
app.post('/verifyaccount', function(req, res) {
	var auth = /* Authentication Code */;

	var email = req.body.email.toLowerCase();

	console.log("email: " + email);

	if (req.headers.auth === auth) {
		reg_db.registration.find({ "email": email }, function(err, records) {
			if (records.length === 0) {
				res.status(200).send('Email is not registered');
			} else {
				res.status(201).send('Email is registered');
			}
		});
	} else {
		res.status(501).send('Invalid Authorization');
	}
});

// POST to Store UUID
app.post('/addbeacon', function(req, res) {
	var auth = /* Authentication Code */;

	var email = req.body.email.toLowerCase();
	var uuid = req.body.uuid;

	if (req.headers.auth === auth) {
		beacon_db.beacons.find({ "email": email }, function(err, records) {
			if (err) {
				console.log(err);
				res.end();
			} else {
				if (records.length > 0) {
					beacon_db.beacons.update({ "email": email }, { $set: { "uuid": uuid }});
					reg_db.registration.update({ "email": email }, { $set: { "completed": true }});
				} else {
					beacon_db.beacons.insert({ email: email, uuid: uuid });		
					reg_db.registration.update({ "email": email }, { $set: { "completed": true }});		
				}
				res.status(200).send('Successful');
			}
		});
	} else {
		res.status(500).send('Invalid Authorization');
	}
});

// POST to Store Team
app.post('/addteam', function(req, res) {
	var auth = /* Authentication Code */;

	var email = req.body.email.toLowerCase();
	var teamName = req.body.teamName;
	var team = req.body.team;

	if (req.headers.auth === auth) {
		team_db.teams.find({ "email": email }, function(err, records) {
			if (err) {
				console.log(err);
				res.end();
			} else {
				if (records.length > 0) {
					team_db.teams.update({ "email": email }, { $set: { "teamName": teamName, "team": team }});				
				} else {
					team_db.teams.insert({ "email": email, "teamName": teamName, "team": team });
				}
				res.status(200).send('Successful');
			}
		});
	} else {
		res.status(500).send('Invalid Authorization');
	}
});

// POST to Get Teams
app.post('/getteams', function(req, res) {
	var auth = /* Authentication Code */;

	if (req.headers.auth === auth) {
		team_db.teams.find({}, function(err, records) {
			if (err) {
				console.log(err);
				res.end();
			} else {
				res.status(200).send(records);
			}
		});
	} else {
		res.status(500).send('Invalid Authorization');
	}
});

// POST for Team Info
app.post('/teaminfo', function(req, res) {
	var auth = /* Authentication Code */;

	var email = req.body.email.toLowerCase();

	if (req.headers.auth === auth) {
		team_db.teams.find({ "email": email }, function(err, records) {
			if (err) {
				console.log(err);
				res.end();
			} else {
				res.status(200).send(records);
			}
		});
	} else {
		res.status(500).send('Invalid Authorization');
	}
});

// POST for Hack Info
app.post('/hackinfo', function(req, res) {
	var auth = /* Authentication Code */;

	var email = req.body.email.toLowerCase();

	if (req.headers.auth === auth) {
		hacks_db.hacks.find({ "email": email}, function(err, records) {
			if (err) {
				console.log(err);
				res.end();
			} else if (records.length === 0) {
				res.status(200).send('No records found');
			} else {
				res.status(201).send(records);
			}
		});
	} else {
		res.status(500).send('Invalid Authorization');
	}
});

// POST to Add Hack
app.post('/addhack', function(req, res) {
	var auth = /* Authentication Code */;

	var email = req.body.email.toLowerCase();
	var hack = req.body.hack;
	var description = req.body.description; 

	if (req.headers.auth === auth) {
		hacks_db.hacks.find({ "email": email}, function(err, records) {
			if (err) {
				console.log(err);
				res.end();
			} else if (records.length === 0) {
				hacks_db.hacks.insert({ "email": email, "hack": hack, "description": description });
				res.status(200).send('OK!');
			} else {
				hacks_db.hacks.update({ "email": email }, { $set: { "hack": hack, "description": description } });
				res.status(200).send('OK!');
			}
		});
	} else {
		res.status(500).send('Invalid Authorization');
	}
})

app.listen(app.get('port'), function() {
	console.log("Express server listening on port " + app.get('port'));
});
