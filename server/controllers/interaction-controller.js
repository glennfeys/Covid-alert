const interactionModel = require("../models/interaction");
const forge = require("node-forge");
const KeyManager = require("../../pki/KeyManager");
const config = require("../../public/js/config");
const util = require("../models/util");
const keyManager = new KeyManager();

// normally this would be a list of trusted public keys but for the POC we keep it simple
const registeredDoctors = [config.doctorPublicKey];


function decryptAndVerifyMessage(msg, payloadLength) {
  const decryptedMessage = keyManager.decryptWithKEM(msg);
  if (!decryptedMessage) return null;

  // The decrypted message is composed out of different parts we will extract here now.
  const ts = new Date(
    new Float64Array(new Uint8Array(decryptedMessage.slice(0, 8)).buffer)[0]
  );
  const pkPem =
    "-----BEGIN PUBLIC KEY-----" +
    decryptedMessage.slice(8, 8 + 294).toString("base64") +
    "-----END PUBLIC KEY-----";
  const pk = forge.pki.publicKeyFromPem(pkPem);
  const payload = decryptedMessage.slice(8 + 294, 8 + 294 + payloadLength);
  const signature = new Uint8Array(
    decryptedMessage.slice(
      8 + 294 + payloadLength,
      8 + 294 + payloadLength + 256
    )
  );

  // interaction message payloadLength => 850
  if (payloadLength === 850) {
    const senderMessage = keyManager.decryptWithKEM(payload);
    const senderTs = new Date(
        new Float64Array(new Uint8Array(senderMessage.slice(0, 8)).buffer)[0]
    );
    // difference in milliseconds
    let timeDifference = Math.abs(ts.getTime() - senderTs.getTime());
    if (timeDifference >= 600000) {
      console.error("Rejecting: timestamps are to far apart");
      return null;
    }
  }


  // Check signature
  const hash = forge.md.sha256.create();
  hash.update(
    new Uint8Array(decryptedMessage.slice(0, 8 + 294 + payloadLength))
  );
  // Defaults to RSASSA PKCS#1 v1.5
  if (pk.verify(hash.digest().bytes(), signature)) {
    return {
      ts,
      pkPem,
      payload,
    };
  } else {
    console.error("Rejecting: signature does not match");
    return null;
  }
}


exports.report = (req, res) => {
  const message = Buffer.from(req.body.msg, "base64");
  const payload_size = req.body.size;
  const doctorMessage = decryptAndVerifyMessage(message, payload_size);
  // check if doctor is registered
  if (!registeredDoctors.includes(doctorMessage.pkPem)) {
    res.json({'status': 'Doctor is not a registered health professional.'});
    console.error('Doctor is not a registered health professional.');
    return
  }
  const payloadStr = Buffer.from(doctorMessage.payload).toString();
  const interactions = JSON.parse(payloadStr);

  for (let interaction of interactions) {
    // decrypted message that infected client has made
    const receivedMessage = decryptAndVerifyMessage(interaction, 850);
    // message send by user that was in contact with infected client
    const senderMessage = decryptAndVerifyMessage(receivedMessage.payload, 0);

    // save interaction to database
    for (const interactionPart of [senderMessage, receivedMessage]) {
      interactionModel.create({
        sender: util.representationOfPublicKey(interactionPart.pkPem),
        date_received: interactionPart.ts
      }).then(() => res.json())
        .catch(err => res.json({'status': err}));
    }
  }
};
