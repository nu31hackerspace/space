import { generateKeyPairSync, createSign } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { verifyWebhookSignature } from './signature'

// monobank hands out an ECDSA P-256 key, base64-encoded around a PEM body.
const { privateKey, publicKey } = generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
})

const pubKeyBase64 = Buffer.from(
    publicKey.export({ type: 'spki', format: 'pem' }) as string
).toString('base64')

function sign(body: string): string {
    const signer = createSign('SHA256')
    signer.update(body)
    signer.end()
    return signer.sign(privateKey).toString('base64')
}

const body = JSON.stringify({ invoiceId: 'p2_9ZgpZVsl3', status: 'success' })

describe('monobank webhook signature', () => {
    it('accepts a body signed with the matching key', () => {
        expect(verifyWebhookSignature(pubKeyBase64, sign(body), body)).toBe(
            true
        )
    })

    it('rejects a body that was modified in transit', () => {
        const signature = sign(body)
        const tampered = JSON.stringify({
            invoiceId: 'p2_9ZgpZVsl3',
            status: 'failure',
        })

        expect(verifyWebhookSignature(pubKeyBase64, signature, tampered)).toBe(
            false
        )
    })

    it('rejects a signature made with a different key', () => {
        const other = generateKeyPairSync('ec', { namedCurve: 'prime256v1' })
        const signer = createSign('SHA256')
        signer.update(body)
        signer.end()
        const foreignSignature = signer
            .sign(other.privateKey)
            .toString('base64')

        expect(
            verifyWebhookSignature(pubKeyBase64, foreignSignature, body)
        ).toBe(false)
    })

    it('returns false instead of throwing on malformed input', () => {
        expect(verifyWebhookSignature('', sign(body), body)).toBe(false)
        expect(verifyWebhookSignature(pubKeyBase64, '', body)).toBe(false)
        expect(verifyWebhookSignature(pubKeyBase64, sign(body), '')).toBe(false)
        expect(verifyWebhookSignature('not-a-key', sign(body), body)).toBe(
            false
        )
        expect(
            verifyWebhookSignature(pubKeyBase64, 'not-a-signature', body)
        ).toBe(false)
    })
})
