var mongoose = require('mongoose');

var ChoiceSchema = new mongoose.Schema({
    student_id: {
        type: Number,
        required: true
    },
    subject_name: [{
        type: String,
        required: true
    }],
    choices: [{
        type: String,
        required: true
    }]
});

var Choice = mongoose.model('Choice', ChoiceSchema);

module.exports = Choice;