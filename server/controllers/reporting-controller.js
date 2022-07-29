const jwt = require("jsonwebtoken")
const reportModel = require('../models/report');

// TESTING PURPOSES
exports.get_all = (req, res) => {
    reportModel
        .find({})
        .exec((err, reports) => {
            res.send(reports);
        });
}

const key = 'MySecretKeyThatShouldBeSomethingElseThanThis'

const jwtPayload = {}
const options = {
    notBefore: 30, // 30 seconds
    expiresIn: 60 // 60 seconds
}

exports.get_token = (req, res) => {
    jwt.sign(jwtPayload, key, options, (err, tokenId) => {
        res.send(tokenId);
    });
}

exports.report = (req, res) => {
    const token = req.body.token;
    jwt.verify(token, key, (err, decoded) => {
        if(err) {
            res.json({name: err.name, message: err.message});
        } else {
            reportModel
                .create({
                    location: req.body.location,
                    amount_of_messages: req.body.amount_of_messages
                })
                .then(() => res.json())
                .catch(err => res.json({'status': 'error'}));
        }
    });
}