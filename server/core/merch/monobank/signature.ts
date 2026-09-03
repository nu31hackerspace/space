// ECDSA verification for monobank webhooks.
//
// The webhook URL is public, so the signature is the only thing separating a
// real payment notification from someone marking their own order paid. Every
// failure path returns false rather than throwing: a malformed key, a truncated
// signature and a tampered body are all simply "not verified".

import { createPublicKey, createVerify } from 'node:crypto'

// pubKeyBase64 is the base64 blob from GET /api/merchant/pubkey, which decodes
// to a PEM-wrapped x.509 key. xSignBase64 is the X-Sign header. body must be
// the raw request bytes — re-serialising the parsed JSON changes the hash.
export function verifyWebhookSignature(
    pubKeyBase64: string,
    xSignBase64: string,
    body: string
): boolean {
    if (!pubKeyBase64 || !xSignBase64 || !body) {
        return false
    }

    try {
        const pem = Buffer.from(pubKeyBase64, 'base64').toString('utf-8')
        const publicKey = createPublicKey(pem)

        const verifier = createVerify('SHA256')
        verifier.update(body)
        verifier.end()

        return verifier.verify(publicKey, Buffer.from(xSignBase64, 'base64'))
    } catch {
        return false
    }
}
