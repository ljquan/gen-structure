// bad certificate
error = {
  message1:
    "Certificate keyUsage or basicConstraints conflict " +
    "or indicate that the certificate is not a CA. " +
    "If the certificate is the only one in the chain or " +
    "isn\"t the first then the certificate must be a " +
    "valid CA.",
  message2:
    'Certificate keyUsage or basicConstraints conflict ' +
    'or indicate that the certificate is not a CA. ' +
    'If the certificate is the only one in the chain or ' +
    'isn\'t the first then the certificate must be a ' +
    'valid CA.',
    message3:
      `Certificate keyUsage or basicConstraints conflict ` +
      `or indicate that the certificate is not a CA. ` +
      `If the certificate is the only one in the chain or ` +
      `isn\`t the first then the certificate must be a ` +
      `valid CA.`,
  error: pki.certificateError.bad_certificate
};
