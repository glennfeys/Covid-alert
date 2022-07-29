//! Common functions useful for everywhere.

/**
 * Gets timestamp.
 * Written in an async way because it makes the design easy to adapt to other time sources.
 * @return {Promise<number>} The timestamp promise
 */
async function getTimestamp() {
  // This is a UNIX timestamp,
  // so timezone independent and no leapseconds (i.e. "real time" passed since epoch).
  // This is equivalent to using a standardised time like UTC, but easier.
  return Date.now();
}

/**
 * Converts a binary-encoded string to buffer.
 * NOTE: This is _NOT_ the same as the utility function in Forge.
 * @param {string} str The binary-encoded string
 * @return {Uint8Array} The buffer
 */
function str2buffer(str) {
  const buffer = new Uint8Array(str.length);
  for (let i = 0; i < str.length; ++i) {
    buffer[i] = str.charCodeAt(i);
  }
  return buffer;
}

/**
 * Converts a buffer to a binary-encoded string.
 * @param {Uint8Array} buffer The buffer
 * @return {string} The binary-encoded string
 */
function buffer2str(buffer) {
  return String.fromCharCode(...buffer);
}

/**
 * Timestamp to buffer
 * @param {number} ts Timestamp
 * @return {Uint8Array} The buffer
 */
function ts2buffer(ts) {
  // We can't just use bitshifts because ints in JS are 32-bit,
  // but it already overflows because JS uses ms scale for unix TS.
  return new Uint8Array(new Float64Array([ts]).buffer);
}

/**
 * Cleans up a string (removes newlines and trims the string)
 * @param {string} s The string to clean up
 * @return {string} The cleaned string
 */
function cleanString(s) {
  return s.trim().replace(/[\n\r]/g, "");
}

/**
 * Constructs a message, without signing it yet.
 * The message includes a public key, a timestamp & a payload.
 * @param {number} ts The timestamp
 * @param {string} includedPublicKeyPem The public key to include
 * @param {Uint8Array} payload The payload to include.
 * @return {Uint8Array} The message in a buffer
 */
function constructUnsignedMessage(ts, includedPublicKeyPem, payload) {
  // Format of unsigned message:
  //   8 bytes timestamp (unix time)
  //   public key in binary
  //   ? bytes payload

  // Slice off markers and formatting, then convert the base64 to binary.
  const pkBinary = str2buffer(
    atob(cleanString(includedPublicKeyPem).slice(26, -24))
  );

  // Construct message buffer
  const final = new Uint8Array(8 + pkBinary.length + payload.length);
  final.set(ts2buffer(ts), 0);
  final.set(pkBinary, 8);
  final.set(payload, 8 + pkBinary.length);
  return final;
}

/**
 * Constructs a signed message: K-(PublicKey || TimeStamp || Payload)
 * @param {number} ts The timestamp
 * @param {string} privateKeyPem The private key of the signer, in PEM format.
 * @param {string} includedPublicKeyPem The public key to include, in PEM format.
 * @param {Uint8Array} payload The payload buffer.
 * @return {Uint8Array} The signed message in a buffer
 */
function constructSignedMessage(
  ts,
  privateKeyPem,
  includedPublicKeyPem,
  payload
) {
  const unsigned = constructUnsignedMessage(ts, includedPublicKeyPem, payload);
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const hash = forge.md.sha256.create();
  hash.update(unsigned);
  // Defaults to RSASSA PKCS#1 v1.5
  const signature = privateKey.sign(hash);
  return new Uint8Array([...unsigned, ...str2buffer(signature)]);
}

/**
 * Constructs a signed and encrypted message.
 * @param {PublicKey} publicKeyServer The public key instance of the server.
 * @param {string} privateKeyPem The private key of the signer, in PEM format.
 * @param {string} includedPublicKeyPem The public key to include, in PEM format.
 * @param {string} payload The payload.
 * @return {Promise<Uint8Array>} The signed & encrypted message in a buffer
 */
async function constructSignedMessageEncrypted(
  publicKeyServer,
  privateKeyPem,
  includedPublicKeyPem,
  payload
) {
  const ts = await getTimestamp();
  const signedMessage = constructSignedMessage(
    ts,
    privateKeyPem,
    includedPublicKeyPem,
    payload
  );

  // Do the RSA-KEM (Key Encapsulation Machanism) (https://digitalbazaar.github.io/forge/#rsakem)
  const kdf1 = new forge.kem.kdf1(forge.md.sha256.create());
  const kem = forge.kem.rsa.create(kdf1);
  // Creates a 16-byte key and encrypts&encapsulates it using the public key of server.
  const result = kem.encrypt(publicKeyServer, 16);
  // Now we have a symmetric key in `result.key` we can use for AES.
  const iv = forge.random.getBytesSync(12); // Initialization vector. GCM has a default size of 12.
  const cipher = forge.cipher.createCipher("AES-GCM", result.key); // Galois Counter Mode for performance reasons
  cipher.start({ iv: iv });
  cipher.update(forge.util.createBuffer(signedMessage));
  cipher.finish();
  const encrypted = cipher.output.getBytes();
  const tag = cipher.mode.tag.getBytes();
  console.log(encrypted.length);

  return Uint8Array.from([
    ...str2buffer(iv), // 12 B
    ...str2buffer(tag), // 16 B
    ...str2buffer(result.encapsulation), // 256 B
    ...ts2buffer(ts), // 8 B
    ...str2buffer(encrypted),
  ]);
}

/**
 * Gets the public key async.
 * This is a helper because in real-life (not POC),
 * this would check if the currently cached one is still valid.
 * If not: fetch. Otherwise: use the cached one.
 * That's why this is a promise-based function.
 * To keep the POC simpler, we just always fetch the public key.
 * @return {Promise<PublicKey>} The public key of the server.
 */
async function getPublicKey() {
  try {
    // Get the public key and then construct the message
    const pk = await fetch("/public-key").then((res) => res.text());

    // Convert the PEM public key to an instance for Forge.
    return forge.pki.publicKeyFromPem(pk);
  } catch (e) {
    throw e;
  }
}

/**
 * Brings up a download prompt using a data URL.
 * @param {string} dataUrl Data URL
 * @param {string} filename Downloaded file's filename
 */
function download(dataUrl, filename) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.setAttribute("download", filename);
  a.click();
}
