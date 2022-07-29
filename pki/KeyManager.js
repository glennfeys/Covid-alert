const forge = require('node-forge');
const rsa = forge.pki.rsa;
const pki = forge.pki;
const fs = require('fs');

const KEY_PATH = __dirname + '/../keys/'

class KeyManager {
    constructor() {
        if (!!KeyManager.instance) {
            return KeyManager.instance;
        }
        KeyManager.instance = this;
        // If the directory doesn't exist we create it
        if (!fs.existsSync(KEY_PATH)) {
            fs.mkdirSync(KEY_PATH);
        }
        // Get the current public key if present from the keys directory
        let now = new Date();
        if (!fileExists(getPrivateKeyFilename(now)) || !fileExists(getPublicKeyFilename(now))) {
            console.info("Generating new keys...");
            this.generateNewKeyPair(now);
        }
        else {
            console.info('Reading existing keys...');

            try {
                // We load the keypair from file
                let privateKeyPem = fs.readFileSync(getPrivateKeyFilename(now), 'utf8');
                let publicKeyPem = fs.readFileSync(getPublicKeyFilename(now), 'utf8');

                this.current_keypair = {
                    privateKey: pki.privateKeyFromPem(privateKeyPem),
                    publicKey: pki.publicKeyFromPem(publicKeyPem)
                };
                this.last = now.toISOString().slice(0, 10);
            } catch {
                console.error('Something broke');
                this.generateNewKeyPair(now);
            }
        }
        return this;
    }


    /**
     * This method is responsible for checking if a new keypair
     * should be generated.
     */
    refreshIfKeysInvalid() {
        let now = new Date();
        if (now.toISOString().slice(0, 10) !== this.last) {
            this.generateNewKeyPair(now)
        }
    }

    /**
     * This method will generate new keypairs and store them.
     * 
     * @param Date now 
     */
    generateNewKeyPair(now) {
        // We generate a new 2048 bit keypair
        this.current_keypair = rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
        let publicKeyPem = pki.publicKeyToPem(this.current_keypair.publicKey);
        let privateKeyPem = pki.privateKeyToPem(this.current_keypair.privateKey);

        writeToFile(getPublicKeyFilename(now), publicKeyPem);
        writeToFile(getPrivateKeyFilename(now), privateKeyPem);
        this.last = now.toISOString().slice(0, 10);
    }

    /**
     * Gets the private key instance used on a date.
     * @param {Date} date The date
     */
    getPrivateKey(date) {
        let filename = getPrivateKeyFilename(date);
        if (fileExists(filename)) {
            let privateKeyPem = fs.readFileSync(filename, 'utf8');
            return pki.privateKeyFromPem(privateKeyPem);
        } else {
            // The key doesn't exist (anymore)
            console.error("Unable to decrypt, no suitable private key in directory.");
            return null; // TODO: throw error
        }
    }

    /**
     * Decrypt a message into a buffer.
     * @param {string} msg The base64-encoded message
     * @return {Buffer} null when invalid, a buffer when valid.
     */
    decryptWithKEM(msg) {
        // The message is encrypted using RSA-KEM.
        // We first have to convert the message to binary & break up the message into their relevant parts.
        const buffer = fromBase64(msg);
        const iv = buffer.slice(0, 12);
        const tag = buffer.slice(12, 12 + 16);
        const encapsulation = buffer.slice(12 + 16, 12 + 16 + 256);
        const ts = new Date(new Float64Array(new Uint8Array(buffer.slice(12 + 16 + 256, 12 + 16 + 256 + 8)).buffer)[0]);
        const privateKey = this.getPrivateKey(ts);
        if (!privateKey) return null;
        const encrypted = buffer.slice(12 + 16 + 256 + 8);

        const kdf1 = new forge.kem.kdf1(forge.md.sha256.create());
        const kem = forge.kem.rsa.create(kdf1);
        const key = kem.decrypt(privateKey, encapsulation, 16);
        
        // Now we have the symmetric key in the `key` variable.
        const decipher = forge.cipher.createDecipher('AES-GCM', key);
        decipher.start({ iv: iv, tag: tag });
        decipher.update(forge.util.createBuffer(encrypted));
        if (!decipher.finish()) return null;

        return Buffer.from(str2buffer(decipher.output.getBytes()));
    }

    /**
     * Encrypts a string using the current public key
     * of the KeyManager class.
     * 
     * @param {string} msg 
     * @returns {string} a base64 encoded version of the encrypted message
     */
    encrypt(msg) {
        let publicKey = this.current_keypair.publicKey;
        return toBase64(publicKey.encrypt(msg));
    }

    /**
     * @returns {string} A PEM-formatted version of the current public key
     */
    getCurrentPublicKeyPem() {
        this.refreshIfKeysInvalid(); // When a client requests the collection server's keys we want them to get the latest keys
        // If the keys are outdated we should generated new ones.
        return pki.publicKeyToPem(this.current_keypair.publicKey);
    }
}

/**
 * Converts a binary-encoded string to buffer.
 * NOTE: This is _NOT_ the same as the utility function in Forge.
 * @param {string} str The binary-encoded string
 * @return {Uint8Array} The buffer
 */
function str2buffer(str) {
    const buffer = new Uint8Array(str.length);
    for(let i = 0; i < str.length; ++i) {
      buffer[i] = str.charCodeAt(i);
    }
    return buffer;
}

function getBaseKeyFilename(date) {
    if (date === undefined) {
        date = new Date().toISOString().slice(0, 10);
    }
    else {
        date = date.toISOString().slice(0, 10);
    }
    return KEY_PATH + date;
}

function getPrivateKeyFilename(date) {
    return getBaseKeyFilename(date) + ".privKey";
}

function getPublicKeyFilename(date) {
    return getBaseKeyFilename(date) + ".pubKey";
}

function toBase64(msg) {
    return msg.toString('base64');
}

function fromBase64(msg) {
    return Buffer.from(msg, 'base64');
}

function fileExists(path) {
    try {
        if (fs.existsSync(path)) {
            return true
        }
    } catch (err) {
        console.error(err)
    }
    return false;
}

function writeToFile(path, contents) {
    fs.writeFile(path, contents, { flag: 'w' }, function (err) {
        if (err) {
            return console.error(err);
        }
        console.info("Persisted successfully: " + path);
    });
}

module.exports = KeyManager;
