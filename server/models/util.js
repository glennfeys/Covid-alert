const forge = require('node-forge');

function representationOfPublicKey(pkPem) {
  let md = forge.md.sha256.create();
  md.update(pkPem);
  return md.digest().toHex();
}

module.exports = { representationOfPublicKey };
