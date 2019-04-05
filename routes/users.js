var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var passport = require('passport');
//User model
var User = require('../models/User');
var Admin = require('../models/Admin');

/* GET users listing. */
//Student login
router.get('/student_login', (req, res) => res.render('student_login'));

//Admin login
router.get('/admin_login', (req, res) => res.render('admin_login'));

router.get('/register', (req, res) => res.render('register'));

router.post('/register', (req, res) => {
    var { name, student_id, password, password2 } = req.body;
    let errors = [];

    //Check required fields
    if (!name || !student_id || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields'});
    }

    //Check password match
    if (password !== password2) {
        errors.push({ msg: 'Passwords do no match'});
    }

    //Check password length
    if (password.length < 6) {
        errors.push({ msg: 'Passwords should be at least 6 characters'});
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            student_id,
            password,
            password2
        });
    } else {
        //Validation passed
        User.findOne({student_id: student_id})
            .then(user => {
                if (user) {
                    errors.push({msg: 'Student ID is already registered'});
                    res.render('register', {
                        errors,
                        name,
                        student_id,
                        password,
                        password2
                    });
                } else {
                    var newUser = new User({
                        name,
                        student_id,
                        password
                    });

                    newUser.save()
                        .then(user => {
                            req.flash('success_msg', 'You are now registered and can log in');
                            res.redirect('/users/student_login');
                        })
                        .catch(err => console.log(err));
                }
            })
    }

});


//Student Login Handle
router.post('/student_login', (req, res, next) => {
   passport.authenticate('student_login',{
       successRedirect: '/dashboard',
       failureRedirect: '/users/student_login',
       failureFlash: true
   }) (req, res, next);
});

//Student Logout Handle
router.get('/logout', (req, res) => {
   req.logout();
   req.flash('success_msg', 'You are logged out');
   res.redirect('/users/student_login');
});

//Admin Register
// router.post('/admin_login', (req, res) => {
//     console.log(req.body);
//     var { admin_id, password } = req.body;
//     var name = 'ABD';
//     var newAdmin = new Admin({
//         name,
//         admin_id,
//         password
//     });
//     newAdmin.save()
//         .then(admin => {
//             req.flash('success_msg', 'You are now registered and can log in');
//             res.redirect('/users/admin_login');
//         })
//         .catch(err => console.log(err));
// });

//Admin Login Handle
router.post('/admin_login', (req, res, next) => {
    passport.authenticate('admin_login',{
        successRedirect: '/admin_dashboard',
        failureRedirect: '/users/admin_login',
        failureFlash: true
    }) (req, res, next);
});

//Admin Logout Handle
router.get('/admin_logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/admin_login');
});

module.exports = router;
