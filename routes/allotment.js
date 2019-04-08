var express = require('express');
var router = express.Router();
var { ensureAuthenticated } = require('../config/auth');
//Mongoose
var Choice = require('../models/Choice');
var User = require('../models/User');

router.get('/', ensureAuthenticated, (req, res) => {
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
                            User.findOneAndUpdate({ student_id: Obj[i].student_id }, { $set:{ alloted: currentBranch }}, {new: true}, (err, doc) => {
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
        res.send('Allotment Done');
    } else {
        req.logout();
        res.redirect('/')
    }
});

module.exports = router;