const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    location: {
        type: [Number],
        required: true
    },

    amount_of_messages: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Report', ReportSchema);