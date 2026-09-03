# Webhook (Вебхуки)

Webhook signature verification and public key management.

---

## GET /api/merchant/pubkey

**Відкритий ключ для верифікації підписів** — Get public key for webhook signature verification.

The key can be cached. Request a new key only when verification with the current key stops working. Do NOT request the key on every webhook.

### Request

**Headers:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| X-Token | string | yes | Merchant token |

### Response 200

```json
{
  "key": "LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowREFRY0RRZ0FFK0UxRnBVZzczYmhGdmp2SzlrMlhJeTZtQkU1MQpib2F0RU1qU053Z1l5ZW55blpZQWh3Z3dyTGhNY0FpT25SYzNXWGNyMGRrY2NvVnFXcVBhWVQ5T3hRPT0KLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg=="
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| key | string | yes | Base64-encoded x.509 ECDSA public key |

### Errors
400, 403, 405, 429, 500 — see common errors in SKILL.md

---

## Webhook Format

When an invoice status changes, the acquiring backend will make up to 3 POST requests to the `webHookUrl` until it receives HTTP 200 OK.

**Headers:**
| Name | Description |
|------|-------------|
| X-Sign | ECDSA signature of the request body |

**Body:** Same schema as `GET /api/merchant/invoice/status` response (InvoiceStatusResponse).

**Important:** The webhook is NOT sent for `expired` status.

### Signature Verification (Go example)

```go
package main

import (
  "crypto/ecdsa"
  "crypto/sha256"
  "crypto/x509"
  "encoding/base64"
  "encoding/pem"
  "log"
)

func verifySignature(pubKeyBase64, xSignBase64 string, body []byte) bool {
  // 1. Decode the public key
  pubKeyBytes, _ := base64.StdEncoding.DecodeString(pubKeyBase64)
  pubKeyBlock, _ := pem.Decode(pubKeyBytes)
  pubKeyInterface, _ := x509.ParsePKIXPublicKey(pubKeyBlock.Bytes)
  pubKey := pubKeyInterface.(*ecdsa.PublicKey)

  // 2. Decode the signature
  sign, _ := base64.StdEncoding.DecodeString(xSignBase64)

  // 3. Hash the body and verify
  hash := sha256.Sum256(body)
  return ecdsa.VerifyASN1(pubKey, hash[:], sign)
}
```

### Verification Steps

1. Get the public key from `GET /api/merchant/pubkey` (cache it)
2. Decode the base64 public key to PEM, then parse ECDSA public key
3. Decode the `X-Sign` header from base64
4. Calculate SHA-256 hash of the raw request body
5. Verify the ECDSA signature against the hash using the public key
6. If verification fails, request a new public key and retry
