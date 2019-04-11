var mongoose = require('mongoose');

var SeatSchema = new mongoose.Schema({
    total_seats: {
        type: Number,
        required: true
    }
});

var Seat = mongoose.model('Seat', SeatSchema);

module.exports = Seat;