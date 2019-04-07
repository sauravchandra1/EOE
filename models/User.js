var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    student_id: {
        type: Number,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    cgpi: {
        type: Number,
        require: true
    }
});

var User = mongoose.model('User', UserSchema);

module.exports = User;