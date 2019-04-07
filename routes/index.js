var express = require('express');
var router = express.Router();
var { ensureAuthenticated } = require('../config/auth');

var Subject = require('../models/Subject');
/* GET home page. */
router.get('/', (req, res) => res.render('welcome'));
//Dashboard
// router.get('/dashboard', (req, res) => res.render('dashboard', {
//     name: 'Saurav',
//     student_id: 166666,
//     cgpi: 7.4
// }));
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    var User = req.session.passport.user;
    if (User.type === 1) {
        req.logout();
        res.redirect('/')
    } else {
        async function showDashboard () {
            var subjects = await Subject.find({ branch: 'cse' }).exec();
            if (subjects.length === 0) {
                console.log('Subjects not found');
            } else {
                res.render('dashboard', {
                    subjects,
                    name: req.user.name,
                    student_id: req.user.student_id,
                    cgpi: req.user.cgpi
                });
            }
        }
        showDashboard();
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
