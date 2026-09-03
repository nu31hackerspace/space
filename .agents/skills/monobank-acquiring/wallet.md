# Wallet (Токенізація)

Card tokenization and wallet management operations.

---

## GET /api/merchant/wallet

**Список карток у гаманці** — List tokenized cards in a wallet.

### Request

**Headers:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| X-Token | string | yes | Merchant token |

**Query Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| walletId | string | yes | Buyer's wallet ID |

### Response 200

```json
{
  "wallet": [
    {
      "cardToken": "67XZtXdR4NpKU3",
      "maskedPan": "424242******4242",
      "country": "804"
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| wallet | []WalletItem | yes | List of tokenized cards |
| wallet[].cardToken | string | yes | Card token. Example: `67XZtXdR4NpKU3` |
| wallet[].maskedPan | string | yes | Masked card number. Example: `424242******4242` |
| wallet[].country | string | no | Bank country (ISO 3166-1 numeric). Example: `804` |

### Errors
400, 403, 405, 429, 500 — see common errors in SKILL.md

---

## DELETE /api/merchant/wallet/card

**Видалення токенізованої картки** — Delete a tokenized card.

### Request

**Headers:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| X-Token | string | yes | Merchant token |

**Query Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| cardToken | string | yes | Card token to delete |

### Response 200

Empty response (card deleted).

### Errors
400, 403, 405, 429, 500 — see common errors in SKILL.md
