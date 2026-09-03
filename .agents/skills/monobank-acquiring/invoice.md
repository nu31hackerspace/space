# Invoice (Рахунки)

Core invoice operations for internet acquiring, QR, in-app, and split payments.

---

## POST /api/merchant/invoice/create

**Створення рахунку** — Create an invoice for payment.

### Request

**Headers:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| X-Token | string | yes | Merchant token |
| X-Cms | string | no | CMS name |
| X-Cms-Version | string | no | CMS version |

**Body** (application/json):
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | integer | yes | Amount in minor currency units (kopecks for UAH). Example: `4200` |
| ccy | integer | no | ISO 4217 currency code, default 980 (UAH). Example: `980` |
| merchantPaymInfo | MerchantPaymInfoItem | no | Order information (see SKILL.md for type details) |
| redirectUrl | string | no | URL for redirect after payment (GET). Example: `https://example.com/your/website/result/page` |
| webHookUrl | string | no | Callback URL (POST) for payment status changes (except `expired`). Example: `https://example.com/mono/acquiring/webhook/...` |
| validity | integer | no | Invoice validity in seconds, default 24h. Example: `3600` |
| paymentType | string | no | `debit` (default) or `hold` (9-day hold, auto-cancelled if not finalized). Enum: `debit`, `hold` |
| qrId | string | no | QR cashier ID to set payment amount on existing QR. Example: `XJ_DiM4rTd5V` |
| code | string | no | Submerchant terminal code (limited access). Example: `0a8637b3bccb42aa93fdeb791b8b58e9` |
| saveCardData | object | no | Card tokenization data |
| saveCardData.saveCard | boolean | yes* | Save card flag (*required if saveCardData is present) |
| saveCardData.walletId | string | no | User wallet ID. Example: `69f780d841a0434aa535b08821f4822c` |
| tipsEmployeeId | string | no | Employee ID for tips (from employee list API) |
| agentFeePercent | number | no | Agent fee percentage. Example: `1.42` |

### Response 200

```json
{
  "invoiceId": "p2_9ZgpZVsl3",
  "pageUrl": "https://pay.mbnk.biz/p2_9ZgpZVsl3"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| invoiceId | string | yes | Unique invoice ID |
| pageUrl | string | yes | Payment page URL |

### Errors
400, 403, 404, 405, 429, 500 — see common errors in SKILL.md

---

## GET /api/merchant/invoice/status

**Статус рахунку** — Check invoice status. Used for desynchronization or when webHookUrl was not specified.

### Request

**Headers:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| X-Token | string | yes | Merchant token |

**Query Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| invoiceId | string | yes | Invoice ID |

### Response 200

```json
{
  "invoiceId": "p2_9ZgpZVsl3",
  "status": "success",
  "amount": 4200,
  "ccy": 980,
  "finalAmount": 4200,
  "createdDate": "2023-01-01T00:00:00Z",
  "modifiedDate": "2023-01-01T00:01:00Z",
  "reference": "84d0070ee4e44667b31371d8f8813947",
  "destination": "Покупка щастя",
  "paymentInfo": {
    "maskedPan": "444403******1902",
    "approvalCode": "662476",
    "rrn": "060189181768",
    "tranId": "13194036",
    "terminal": "MI001088",
    "bank": "Універсал Банк",
    "paymentSystem": "visa",
    "paymentMethod": "pan",
    "country": "804",
    "fee": 0,
    "agentFee": 0
  },
  "cancelList": [],
  "tipsInfo": null,
  "walletData": null
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| invoiceId | string | yes | Invoice ID |
| status | string | yes | Enum: `created`, `processing`, `hold`, `success`, `failure`, `reversed`, `expired` |
| amount | integer | yes | Amount in minor units |
| ccy | integer | yes | ISO 4217 currency code |
| finalAmount | integer | no | Final amount after refunds |
| createdDate | string | no | Financial operation datetime |
| modifiedDate | string | no | Last modification datetime |
| reference | string | no | Merchant-defined reference |
| destination | string | no | Payment purpose |
| errCode | string | no | Error code if payment failed (see Errors section in docs) |
| failureReason | string | no | Failure reason description |
| paymentInfo | object | no | Payment details (present for processing/success/failure/reversed) |
| paymentInfo.maskedPan | string | yes | Masked card number |
| paymentInfo.approvalCode | string | no | Authorization code |
| paymentInfo.rrn | string | no | Transaction ID in payment system |
| paymentInfo.tranId | string | no | Transaction ID |
| paymentInfo.terminal | string | yes | Payment terminal ID |
| paymentInfo.bank | string | no | Card issuing bank name |
| paymentInfo.paymentSystem | string | yes | Enum: `visa`, `mastercard` |
| paymentInfo.paymentMethod | string | yes | Enum: `pan`, `apple`, `google`, `monobank`, `wallet`, `direct` |
| paymentInfo.country | string | no | Bank country (ISO 3166-1 numeric) |
| paymentInfo.fee | integer | no | Acquiring fee in minor units |
| paymentInfo.agentFee | integer | no | Agent fee in minor units |
| cancelList | []CancelListItem | no | Accepted cancel requests (see SKILL.md) |
| tipsInfo | object | no | Tips data (present if tipsEmployeeId was set) |
| tipsInfo.employeeId | string | yes | Employee ID |
| tipsInfo.amount | integer | no | Tips amount in minor units (absent if no successful tip payment) |
| walletData | object | no | Card tokenization data |
| walletData.cardToken | string | yes | Card token |
| walletData.walletId | string | yes | Wallet ID |
| walletData.status | string | yes | Enum: `new`, `created`, `failed` |

### Errors
400, 403, 404, 405, 429, 500 — see common errors in SKILL.md

---

## POST /api/merchant/invoice/cancel

**Скасування оплати** — Cancel a successful payment.

### Request

**Headers:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| X-Token | string | yes | Merchant token |

**Body** (application/json):
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| invoiceId | string | yes | Invoice ID. Example: `p2_9ZgpZVsl3` |
| amount | integer | no | Amount in minor units (for partial refund). Example: `5000` |
| extRef | string | no | Merchant-defined cancellation reference. Example: `635ace02599849e981b2cd7a65f417fe` |
| items | []FiscalizationItem | no | Items for return receipt (required if fiscalization is active). See SKILL.md |

### Response 200

```json
{
  "status": "processing",
  "createdDate": "2023-01-01T00:00:00Z",
  "modifiedDate": "2023-01-01T00:00:00Z"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | yes | Enum: `processing`, `success`, `failure` |
| createdDate | string | yes | Creation datetime |
| modifiedDate | string | yes | Last modification datetime |

### Errors
400, 403, 404, 405, 429, 500 — see common errors in SKILL.md

---

## POST /api/merchant/invoice/remove

**Інвалідація рахунку** — Invalidate an invoice that has not been paid yet.

### Request

**Headers:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| X-Token | string | yes | Merchant token |

**Body** (application/json):
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| invoiceId | string | yes | Invoice ID. Example: `p2_9ZgpZVsl3` |

### Response 200

Empty response (invoice deactivated).

### Errors
400, 403, 404, 405, 429, 500 — see common errors in SKILL.md

---

## POST /api/merchant/invoice/finalize

**Фіналізація суми холду** — Finalize a held amount (for `paymentType: "hold"` invoices).

### Request

**Headers:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| X-Token | string | yes | Merchant token |

**Body** (application/json):
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| invoiceId | string | yes | Invoice ID. Example: `p2_9ZgpZVsl3` |
| amount | integer | no | Amount in minor units. Example: `4200` |
| items | []FiscalizationItem | no | Items for fiscalization when finalize amount differs from original |

### Response 200

```json
{
  "status": "success"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | yes | Enum: `success` |

### Errors
400, 403, 404, 405, 429, 500 — see common errors in SKILL.md
