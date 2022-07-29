let config = {};

config.doctorPublicKey = "-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzxb0Im4sbuqnI2kYipOQf6/Jcf+Pa1NpNYE1Qgk2qELxww9v9ipq4Wqs5+WA2sFm4mkgiZfOVuTRPfjvGRth7nbz5wZEx6sbr2PMC+V/+nhH397ULLeoeAk8WhLpBmp9zaup0S0YCquehrXSrsupfTYIEYu0kZjXiL12B+Ha9K5tG4gvwW01ThtVzVzNhNrG6tTARNW2kuBMyekXz2+MW432tPK/k5ClZ0IjDIgmsD3bRUagMe8GwPkl1SjwYeOct2+krHxIGQuMgAw6lcChB1AvydWT7JCibFsBeSj/KTAiIT0lpyU86eo89gW/dR9RXjvbKpwm6PJPPWX6AutZ6wIDAQAB-----END PUBLIC KEY-----";
config.doctorPrivateKey = "-----BEGIN RSA PRIVATE KEY-----MIIEpAIBAAKCAQEAzxb0Im4sbuqnI2kYipOQf6/Jcf+Pa1NpNYE1Qgk2qELxww9v9ipq4Wqs5+WA2sFm4mkgiZfOVuTRPfjvGRth7nbz5wZEx6sbr2PMC+V/+nhH397ULLeoeAk8WhLpBmp9zaup0S0YCquehrXSrsupfTYIEYu0kZjXiL12B+Ha9K5tG4gvwW01ThtVzVzNhNrG6tTARNW2kuBMyekXz2+MW432tPK/k5ClZ0IjDIgmsD3bRUagMe8GwPkl1SjwYeOct2+krHxIGQuMgAw6lcChB1AvydWT7JCibFsBeSj/KTAiIT0lpyU86eo89gW/dR9RXjvbKpwm6PJPPWX6AutZ6wIDAQABAoIBAEX8n2hNbKXVlsPQXlNi+Ig2m/FzaYBfkaRb9OhK3dZyvWrrOi7q+fERkLrUZL5Jc2BcH/twOvNB5Hc5vHBzQR8Kw3YVt8P1D2ewZgK1PpGi+cNudq1gKkba9DMKxgb9kWOjOsJvJ3tfsbUcGMYrHS4sRwDLAqzcByd2xD94tHtRJexDdHtssktUIqvej3Bqo5Ji6d0+e+8y0VyCv5tPTqbnXQuG7nj66T76aUxzscYd5pW/1aZI2pJWHxXnFuL/S51FZP7nml3C+xGK3zfZNSJS9fWbUUDBQt+H7+zc2ikhiwBw4yUf4rkoi5UZmi4wGobNwUbgs0zE0BCevvZ+F3UCgYEA7N6QU82FlIr7iecKMjTrcjvNplIMhqdLv3q9wF6HrGp6mh1Sn92fnXaylSslFSZ3dmUwsMwPvtB7JWVm7YszDnr/AqkXHxsQOk7Y5fxwfvsVtSq2X/dcFnPV1be8eOeOXbT+fnUNW2GAvv6ThxrDLrhvXNLpI59tB89uh/FM490CgYEA39Csd5BriPmPHWo03Q5uztODBuvpEZ4wP3ut4VHiWDQu5mjTddPB84XtbA/xry9D7UkB6tHH5m/SjUlIrIx+mtzhmd3wb19YX5x09Kr4IMI2pl/5txA0lHf0AR/6wttiahmvTLvxizEHI6pTpp3A2i8FoZsFZ4nyDniG/lUVnGcCgYEAx7mywLbfF61JA7KIamUs0hmTAdbVMQUHXeFE9lu+0qbF0gU/kgTxfXiEhDro/bh9qpsQP0MRU7e+3n1uGIXy+xbCx5+EG3paaI/rW6FLygY0+5mURb7xKw1pFNfkV54H8QOYQ1C3foHsaR+HjbgHM/HYFNDSPHNFH/zMGlxglRECgYEAqd3qx+QoeZFO+Xg+HvhxSTBm5b3u6pww6j2oPrazH1absewlcewB7B3dkIKZX+hzmYgrmFkXauG739ea/Lq07DxwTSOQ9DZdEFPiwD9yiwpcB/IXyMTX40cXPjNTUsjG7NgJoCeUr5vKW1tOmcppMC84CutpMqgTur/nVOimukkCgYAvT8Y7qtr68CYMCE2GgFpJPFoseIRtKok3PH8mIptiebd23Rrb569mkVM0KZ5TyvD+U0gGpqqPYLF1xNwWZ2PEuUCuKIqxYT+tu/J3LdPA7AFzqnLY9UHaI1acScXzznrjfekwFkE4k5U0Y0fewifA2XJOoirr9J17tBEFG4PCrQ==-----END RSA PRIVATE KEY-----";

if (typeof module !== 'undefined' && module.exports) { // Makes it work in both browser & server
  module.exports = config;
}
