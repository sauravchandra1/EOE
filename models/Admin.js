var mongoose = require('mongoose');

var AdminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    admin_id: {
        type: Number,
        required: true,
    },
    type: {
        type: Number,
        required: true,
    },
    password: {
        type: String,
        required: true,
    }
});

var Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;