var express = require('express');
var router = express.Router();
var { ensureAuthenticated } = require('../config/auth');

var Subject = require('../models/Subject');
var Choice = require('../models/Choice');
/* GET home page. */
router.get('/', (req, res) => res.render('welcome'));
//Dashboard
// router.get('/dashboard', (req, res) => res.render('dashboard', {
//     name: 'Saurav',
//     student_id: 166666,
//     cgpi: 7.4
// }));
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    var Userr = req.session.passport.user;
    if (Userr.type === 1) {
        req.logout();
        res.redirect('/')
    } else {
        if (Userr.alloted === undefined) {
            async function showDashboard () {
                var subjects = await Subject.find({ branch: 'cse' }).exec();
                if (subjects.length === 0) {
                    console.log('Subjects not found');
                } else {
                    var { name, student_id, cgpi, filled } = req.session.passport.user;
                    if (filled) {
                        Choice.findOne({ student_id: student_id })
                            .then(choice => {
                                if (choice) {
                                    res.render('dashboard', {
                                        subjects,
                                        name,
                                        student_id,
                                        cgpi,
                                        filled,
                                        choice
                                    });
                                } else {
                                    console.log('You have not filled the choices')
                                }
                            });
                    } else {
                        res.render('dashboard', {
                            subjects,
                            name,
                            student_id,
                            cgpi,
                            filled
                        });
                    }
                }
            }
            showDashboard();
        } else {
            var { name, student_id, cgpi, alloted } = Userr;
            res.render('allotment', {
                name,
                student_id,
                cgpi,
                alloted
            });
        }
    }
});

router.get('/admin_dashboard', ensureAuthenticated, (req, res) => {
    var User = req.session.passport.user;
    if (User.type === 1) {
        res.render('admin_dashboard', { name: req.user.name });
    } else {
        req.logout();
        res.redirect('/');
    }
});

module.exports = router;
