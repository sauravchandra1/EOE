var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    student_id: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    cgpi: {
        type: Number,
        require: true
    },
    filled: {
        type: Boolean,
        require: true
    },
    alloted: {
        type: String,
        require: false
    }
});

var User = mongoose.model('User', UserSchema);

module.exports = User;