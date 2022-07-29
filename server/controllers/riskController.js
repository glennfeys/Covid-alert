const interactionModel = require('../models/interaction');
const forge = require('node-forge');
const util = require('../models/util');

exports.getRisk = (req, res) => {
    const incubationPeriod = 14; //days
    var incubationDate = new Date(new Date().setDate(new Date().getDate() - incubationPeriod));
    var publicKey = Buffer.from(req.params.id, 'base64').toString();
    var publicKeyHashed = util.representationOfPublicKey(publicKey);
    //console.log(publicKey, publicKeyHashed);
    interactionModel
        .findOne({sender: publicKeyHashed, date_received: {$gte: incubationDate}})
        .exec((err, interaction) => {
            
            if (err) {
                console.log(err);
                return;
            }

            let pubKey = forge.pki.publicKeyFromPem(publicKey);
            let message;
            if (interaction) {
                // Added time so message is unique.
                message = JSON.stringify({status: 200, time: Date.now()});
            } else {
                // Added time so message is unique.
                message = JSON.stringify({status: 404, time: Date.now()});
            }
            console.log(message);
            messageEncrypted = pubKey.encrypt(message);
            res.send(messageEncrypted);
        });
};
