# Payment (Оплата)

Direct card payment, synchronous payment, and token-based payment operations.

---

## POST /api/merchant/invoice/payment-direct

**Оплата за реквізитами** — Create an invoice and pay with card details. Requires active PCI DSS certificate!

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
| amount | integer | yes | Amount in minor units. Example: `4200` |
| ccy | integer | no | ISO 4217 currency code, default 980. Example: `980` |
| cardData | object | yes | Card details |
| cardData.pan | string | yes | Card number. Example: `4242424242424242` |
| cardData.exp | string | yes | Expiry date `mmyy`. Example: `0642` |
| cardData.cvv | string | yes | CVV code. Example: `123` |
| merchantPaymInfo | MerchantPaymInfoItem | no | Order info (see SKILL.md) |
| redirectUrl | string | no | Redirect URL after payment |
| webHookUrl | string | no | Callback URL for status changes |
| paymentType | string | no | Enum: `debit`, `hold` |
| saveCardData | object | no | Card tokenization data |
| saveCardData.saveCard | boolean | yes* | Save card flag |
| saveCardData.walletId | string | no | Wallet ID |
| initiationKind | string | no | Enum: `merchant` (merchant-initiated, e.g. recurring), `client` (client-initiated, client is present) |

### Response 200

```json
{
  "invoiceId": "2210012MPLYwJjVUzchj",
  "status": "success",
  "amount": 4200,
  "ccy": 980,
  "createdDate": "2023-01-01T00:00:00Z",
  "modifiedDate": "2023-01-01T00:01:00Z",
  "failureReason": null,
  "tdsUrl": null
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| invoiceId | string | yes | Invoice ID |
| status | string | yes | Enum: `processing`, `success`, `failure` |
| amount | integer | yes | Amount in minor units |
| ccy | integer | yes | ISO 4217 currency code |
| createdDate | string | yes | Creation datetime |
| modifiedDate | string | yes | Last modification datetime |
| failureReason | string | no | Failure reason |
| tdsUrl | string | no | 3DS URL (if 3DS verification needed) |

### Errors
400, 403, 405, 429, 500 — see common errors in SKILL.md

---

## POST /api/merchant/invoice/sync-payment

**Синхронна оплата** — Synchronous payment API. Access granted via support, requires certain certificates. One of `cardData`, `applePay`, `googlePay` is required.

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
| amount | integer | yes | Amount in minor units. Example: `4200` |
| ccy | integer | yes | ISO 4217 currency code. Example: `980` |
| merchantPaymInfo | object | no | Order info |
| merchantPaymInfo.reference | string | no | Order reference |
| merchantPaymInfo.destination | string | no | Payment purpose |
| cardData | object | no | Card payment data (one of three required) |
| cardData.pan | string | yes | Card number |
| cardData.exp | string | yes | Expiry `mmyy` |
| cardData.eciIndicator | string | yes | ECI value |
| cardData.type | string | yes | Enum: `FPAN`, `DPAN` |
| cardData.cvv | string | no | CVV |
| cardData.cavv | string | no | CAVV |
| cardData.dsTranId | string | no | XID (DSTranID) |
| cardData.tid | string | no | Trace ID (first operation ID) |
| cardData.mit | string | no | Merchant Initiated Transaction: `1` = MIT, `2` = CIT |
| cardData.sst | number | no | Subsequent Transaction |
| cardData.tReqID | string | no | Token requestor ID |
| cardData.tavv | string | no | Token authentication verification value |
| applePay | object | no | Apple Pay crypto container data |
| applePay.token | string | yes | Card token |
| applePay.exp | string | yes | Expiry `mmyy` |
| applePay.eciIndicator | string | yes | ECI value |
| applePay.cryptogram | string | no | TAVV cryptogram |
| googlePay | object | no | Google Pay crypto container data |
| googlePay.token | string | yes | Card token |
| googlePay.exp | string | yes | Expiry `mmyy` |
| googlePay.eciIndicator | string | yes | ECI value |
| googlePay.cryptogram | string | no | TAVV cryptogram |

### Response 200

Returns the same schema as `GET /api/merchant/invoice/status` (InvoiceStatusResponse). See [invoice.md](invoice.md) for full field list.

### Errors
400, 403, 404, 405, 429, 500 — see common errors in SKILL.md

---

## POST /api/merchant/wallet/payment

**Оплата по токену** — Create a payment using a card token.

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
| cardToken | string | yes | Card token. Example: `67XZtXdR4NpKU3` |
| amount | integer | yes | Amount in minor units. Example: `4200` |
| ccy | integer | yes | ISO 4217 currency code. Example: `980` |
| initiationKind | string | yes | Enum: `merchant` (merchant-initiated, e.g. recurring), `client` (client-initiated) |
| merchantPaymInfo | MerchantPaymInfoItem | no | Order info (see SKILL.md) |
| redirectUrl | string | no | Redirect URL (for 3DS). Example: `https://example.com/your/website/result/page` |
| webHookUrl | string | no | Callback URL for status changes |
| paymentType | string | no | Enum: `debit`, `hold` |

### Response 200

```json
{
  "invoiceId": "2210012MPLYwJjVUzchj",
  "status": "success",
  "amount": 4200,
  "ccy": 980,
  "createdDate": "2023-01-01T00:00:00Z",
  "modifiedDate": "2023-01-01T00:01:00Z",
  "failureReason": null,
  "tdsUrl": null
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| invoiceId | string | yes | Invoice ID |
| status | string | yes | Enum: `processing`, `success`, `failure` |
| amount | integer | yes | Amount in minor units |
| ccy | integer | yes | ISO 4217 currency code |
| createdDate | string | yes | Creation datetime |
| modifiedDate | string | yes | Last modification datetime |
| failureReason | string | no | Failure reason |
| tdsUrl | string | no | 3DS URL (redirect user here if present) |

### Errors
400, 403, 405, 429, 500 — see common errors in SKILL.md
