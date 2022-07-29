const mongoose = require('mongoose');

const InteractionSchema = new mongoose.Schema({
    sender: {
        type: String,

        required: true
    },
    date_received: {
        type: Date,
        validate: {
            validator: date => is_valid_date(date),
            message: "The received date needs to be in the past."
        },

        required: true
    },
});

is_valid_date = function(date) {
    return date < Date.now();
};

module.exports = mongoose.model('Interaction', InteractionSchema);