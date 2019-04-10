var express = require('express');
var router = express.Router();
var passport = require('passport');
var {ensureAuthenticated} = require('../config/auth');

//Mongoose
var Choice = require('../models/Choice');
var User = require('../models/User');

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
        User.findOne({student_id: student_id})
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
    if (Admins.type === 1) {
        Choice.find()
            .then(choice => {
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
                var seats = 1;
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
            });
        req.logout();
        req.flash('success_msg', 'Allotment done successfully');
        res.redirect('/admin/admin_login');
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

module.exports = router;