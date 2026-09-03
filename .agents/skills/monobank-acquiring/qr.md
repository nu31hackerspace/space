# QR Acquiring (QR еквайринг)

QR cashier management endpoints.

---

## GET /api/merchant/qr/details

**Інформація про QR-касу** — Get QR cashier information. Only for activated QR cashiers.

### Request

**Headers:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| X-Token | string | yes | Merchant token |

**Query Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| qrId | string | yes | QR cashier ID |

### Response 200

```json
{
  "shortQrId": "OBJE",
  "amount": 4200,
  "ccy": 980,
  "invoiceId": "4EwIUTA12JIZ"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| shortQrId | string | yes | Short QR cashier ID. Example: `OBJE` |
| amount | integer | no | Amount in minor units (present if amount is set). Example: `4200` |
| ccy | integer | no | ISO 4217 currency code. Example: `980` |
| invoiceId | string | no | Invoice ID (present only when amount is set). Example: `4EwIUTA12JIZ` |

### Errors
400, 403, 404, 405, 429, 500 — see common errors in SKILL.md

---

## GET /api/merchant/qr/list

**Список QR-кас** — List all QR cashiers.

### Request

**Headers:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| X-Token | string | yes | Merchant token |

### Response 200

```json
{
  "list": [
    {
      "qrId": "XJ_DiM4rTd5V",
      "shortQrId": "OBJE",
      "amountType": "merchant",
      "pageUrl": "https://pay.mbnk.biz/XJ_DiM4rTd5V"
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| list | []QrListItem | yes | List of QR cashiers |
| list[].qrId | string | yes | QR cashier ID. Example: `XJ_DiM4rTd5V` |
| list[].shortQrId | string | yes | Short QR cashier ID. Example: `OBJE` |
| list[].amountType | string | yes | Enum: `merchant` (merchant sets amount), `client` (client sets amount), `fix` (fixed amount) |
| list[].pageUrl | string | yes | Payment page URL. Example: `https://pay.mbnk.biz/XJ_DiM4rTd5V` |

### Errors
400, 403, 405, 429, 500 — see common errors in SKILL.md

---

## POST /api/merchant/qr/reset-amount

**Видалення суми оплати** — Remove the set payment amount from a QR cashier.

### Request

**Headers:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| X-Token | string | yes | Merchant token |

**Body** (application/json):
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| qrId | string | yes | QR cashier ID. Example: `XJ_DiM4rTd5V` |

### Response 200

Empty response (amount removed).

### Errors
400, 403, 404, 405, 429, 500 — see common errors in SKILL.md
