var express = require('express');
var router = express.Router();
var passport = require('passport');
var {ensureAuthenticated} = require('../config/auth');

//Mongoose
var Choice = require('../models/Choice');
var User = require('../models/User');
var Subject = require('../models/Subject');
var Seat = require('../models/Seat');

//Admin login
router.get('/admin_login', (req, res) => res.render('admin_login'));

//Admin Login Handle
router.post('/admin_login', (req, res, next) => {
    passport.authenticate('admin_login', {
        successRedirect: '/admin_dashboard',
        failureRedirect: '/admin/admin_login',
        failureFlash: true
    })(req, res, next);
});

//Admin Logout Handle
router.get('/admin_logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/admin/admin_login');
});

//Student information
router.post('/student', ensureAuthenticated, (req, res) => {
    var Admin = req.session.passport.user;
    if (Admin.type === 1) {
        var name = Admin.name;
        var student_id = req.body['student_id'];
        User.findOne({student_id: 16555})
            .then(user => {
                if (user) {
                    if (user.filled) {
                        Choice.findOne({student_id: student_id})
                            .then(choice => {
                                res.render('admin_student', {
                                    name,
                                    user,
                                    choice
                                });
                            });
                    } else {
                        res.render('admin_student', {
                            name,
                            user
                        });
                    }
                } else {
                    console.log('Please enter valid Student ID');
                    let errors = [];
                    errors.push({msg: 'Please enter valid Student ID'});
                    res.render('admin_dashboard', {
                        errors,
                        name
                    });
                }
            });
    } else {
        req.logout();
        res.redirect('/');
    }

});

//Allotment
router.get('/allotment', ensureAuthenticated, (req, res) => {
    var Admins = req.session.passport.user;
    var total_seats;
    if (Admins.type === 1) {
        Seat.find()
            .then(seat => {
                total_seats = seat[0]['total_seats'];
                Choice.find()
                    .then(choice => {
                        if (choice.length !== 0) {
                            var Obj = choice;

                            function compare(a, b) {
                                if (a.cgpi >= b.cgpi) {
                                    return -1;
                                } else {
                                    return 1;
                                }
                            }

                            Obj.sort(compare);
                            var len = Obj[0].subject_name.length;
                            var seats = total_seats;
                            var seatObj = {};
                            Obj[0].subject_name.forEach((key, ind) => seatObj[key] = seats);
                            for (var i = 0; i < Obj.length; i++) {
                                var result = {};
                                Obj[i].choices.forEach((key, ind) => result[key] = Obj[i].subject_name[ind]);
                                var key, val, currentBranch;
                                for (var j = 1; j <= len; j++) {
                                    currentBranch = result[j];
                                    if (seatObj[currentBranch] >= 1) {
                                        User.findOneAndUpdate({student_id: Obj[i].student_id}, {$set: {alloted: currentBranch}}, {new: true}, (err, doc) => {
                                            if (err) {
                                                console.log("Something wrong when updating data!");
                                            }
                                            console.log(doc);
                                        });
                                        seatObj[currentBranch]--;
                                        break;
                                    }
                                }
                            }
                            req.logout();
                            req.flash('success_msg', 'Allotment done successfully');
                            res.redirect('/admin/admin_login');
                        } else {
                            req.logout();
                            req.flash('error_msg', 'Not a single student filled the choices');
                            res.redirect('/admin/admin_login');
                        }
                    });
            });
    } else {
        req.logout();
        res.redirect('/');
    }
});

//Choice unlock
router.post('/choice_unlock', ensureAuthenticated, (req, res) => {
    var Admin = req.session.passport.user;
    if (Admin.type === 1) {
        var student_id = req.body['student_id'];
        User.findOne({student_id: student_id})
            .then(user => {
                if (user) {
                    user.alloted = undefined;
                    user.filled = false;
                    user.save();
                    Choice.deleteOne({student_id: user.student_id}, function (err) {
                        if (!err) {
                            console.log('Choice removed sucessfully');
                        } else {
                            console.log(err);
                        }
                    });
                    console.log('Choice Unlocked Sucessfully');
                } else {
                    console.log('Student not found');
                }
                var name = req.session.passport.user.name;
                res.render('admin_student', {
                    name,
                    user
                });
            });

    } else {
        req.logout();
        res.redirect('/');
    }
});

//Subjects
router.get('/subject', ensureAuthenticated, (req, res) => {
    var Admin = req.session.passport.user;
    if (Admin.type === 1) {
        Seat.find()
            .then(seats => {
                var total_seats = seats[0]['total_seats'];
                Subject.find()
                    .then(subject => {
                        var name = req.session.passport.user.name;
                        res.render('admin_subject', {
                            total_seats,
                            subject,
                            name
                        });
                    });
            });
    } else {
        req.logout();
        res.redirect('/');
    }
});

//Add Subject
router.post('/add_subject', ensureAuthenticated, (req, res) => {
    var Admin = req.session.passport.user;
    if (Admin.type === 1) {
        var {branch, subject_name, subject_code} = req.body;
        Seat.find()
            .then(seat => {
                var total_seats = seat[0]['total_seats'];
                if (branch === '' || subject_name === '' || subject_code === '') {
                    Subject.find()
                        .then(subject => {
                            var name = req.session.passport.user.name;
                            let errors = [];
                            errors.push({msg: 'Please fill all the fields'})
                            res.render('admin_subject', {
                                total_seats,
                                errors,
                                subject,
                                name
                            });
                        });
                } else if (branch !== 'cse' && branch !== 'ece' && branch !== 'ce'
                    && branch !== 'che' && branch !== 'me' && branch !== 'ee') {
                    Subject.find()
                        .then(subject => {
                            var name = req.session.passport.user.name;
                            let errors = [];
                            errors.push({msg: "Please enter branch name in correct format"});
                            res.render('admin_subject', {
                                total_seats,
                                errors,
                                subject,
                                name
                            });
                        });
                } else {
                    Subject.findOne({subject_code: subject_code})
                        .then(subject => {
                            if (subject) {
                                console.log('Subject code should be different');
                                let errors = [];
                                errors.push({msg: 'Subject code should be different'});
                                Subject.find()
                                    .then(subject => {
                                        var name = req.session.passport.user.name;
                                        res.render('admin_subject', {
                                            total_seats,
                                            errors,
                                            subject,
                                            name
                                        });
                                    })
                            } else {
                                var newSubject = new Subject({
                                    branch,
                                    subject_name,
                                    subject_code
                                });
                                newSubject.save()
                                    .then(subject => {
                                        let successes = [];
                                        successes.push({msg: 'Subject added successfully'});
                                        console.log('Subject added successfully');
                                        Subject.find()
                                            .then(subject => {
                                                var name = req.session.passport.user.name;
                                                res.render('admin_subject', {
                                                    total_seats,
                                                    successes,
                                                    subject,
                                                    name
                                                });
                                            })
                                    })
                                    .catch(err => console.log(err));
                            }
                        })
                }
            })
    } else {
        req.logout();
        req.redirect('/');
    }
});

//Remove Subject
router.post('/remove_subject', ensureAuthenticated, (req, res) => {
    var Admin = req.session.passport.user;
    if (Admin.type === 1) {
        Seat.find()
            .then(seat => {
                var total_seats = seat[0]['total_seats'];
                var subject_code = req.body['subject_code'];
                Subject.findOneAndRemove({subject_code: subject_code}, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Subject deleted successfully');
                        let successes = [];
                        successes.push({msg: 'Subject deleted successfully'});
                        Subject.find()
                            .then(subject => {
                                var name = req.session.passport.user.name;
                                res.render('admin_subject', {
                                    total_seats,
                                    successes,
                                    subject,
                                    name
                                });
                            });
                    }
                });
            });
    } else {
        req.logout();
        res.redirect('/');
    }
});

//Update Seats
router.post('/update_seats', ensureAuthenticated, (req, res) => {
    var Admin = req.session.passport.user;
    if (Admin.type === 1) {
        var total_seats = req.body['total_seats'];
        if (total_seats === '' || total_seats <= 0) {
            let errors = [];
            errors.push({msg: 'Please enter a valid number'});
            Seat.find()
                .then(seats => {
                    var total_seats = seats[0]['total_seats'];
                    Subject.find()
                        .then(subject => {
                            var name = req.session.passport.user.name;
                            res.render('admin_subject', {
                                errors,
                                total_seats,
                                subject,
                                name
                            });
                        });
                });
        } else {
            Seat.find()
                .then(seat => {
                    seat[0]['total_seats'] = total_seats;
                    seat[0].save();
                    Subject.find()
                        .then(subject => {
                            var name = req.session.passport.user.name;
                            res.render('admin_subject', {
                                total_seats,
                                subject,
                                name
                            });
                        })
                });
        }
    } else {
        req.logout();
        res.redirect('/');
    }
});

module.exports = router;