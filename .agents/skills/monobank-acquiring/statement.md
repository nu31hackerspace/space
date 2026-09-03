# Statement (Виписка)

Transaction history and reporting.

---

## GET /api/merchant/statement

**Виписка за період** — Get transaction statement for a time period.

### Request

**Headers:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| X-Token | string | yes | Merchant token |

**Query Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| from | integer | yes | Start time (UTC unix timestamp) |
| to | integer | no | End time (UTC unix timestamp) |
| code | string | no | Submerchant terminal identifier (used if merchant has submerchants) |

### Response 200

```json
{
  "list": [
    {
      "invoiceId": "2205175v4MfatvmUL2oR",
      "status": "success",
      "maskedPan": "444403******1902",
      "date": "2023-01-01T12:00:00Z",
      "amount": 4200,
      "ccy": 980,
      "profitAmount": 4100,
      "reference": "84d0070ee4e44667b31371d8f8813947",
      "destination": "Покупка щастя",
      "approvalCode": "662476",
      "rrn": "060189181768",
      "paymentScheme": "full",
      "shortQrId": null,
      "cancelList": []
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| list | []MerchantStatementItem | yes | Statement, ordered from newest to oldest |
| list[].invoiceId | string | yes | Invoice ID. Example: `2205175v4MfatvmUL2oR` |
| list[].status | string | yes | Enum: `hold`, `processing`, `success`, `failure` |
| list[].maskedPan | string | yes | Masked card number. Example: `444403******1902` |
| list[].date | string | yes | Financial operation datetime (RFC-3339) |
| list[].amount | integer | yes | Amount in minor units. Example: `4200` |
| list[].ccy | integer | yes | ISO 4217 currency code. Example: `980` |
| list[].profitAmount | integer | no | Amount merchant receives after bank settlement. Example: `4100` |
| list[].reference | string | no | Merchant-defined reference. Example: `84d0070ee4e44667b31371d8f8813947` |
| list[].destination | string | no | Payment purpose. Example: `Покупка щастя` |
| list[].approvalCode | string | no | Transaction authorization code. Example: `662476` |
| list[].rrn | string | no | Transaction ID in payment system. Example: `060189181768` |
| list[].paymentScheme | string | yes | Enum: `bnpl_later_30` (BNPL), `bnpl_parts_4` (4 parts), `full` (full payment) |
| list[].shortQrId | string | no | Short QR cashier ID. Example: `OBJE` |
| list[].cancelList | []object | no | List of cancellations |
| list[].cancelList[].amount | integer | yes | Amount in minor units |
| list[].cancelList[].ccy | integer | yes | ISO 4217 currency code |
| list[].cancelList[].date | string | yes | Datetime (RFC-3339) |
| list[].cancelList[].maskedPan | string | yes | Masked card number for refund |
| list[].cancelList[].approvalCode | string | no | Authorization code |
| list[].cancelList[].rrn | string | no | Transaction ID in payment system |

### Errors
400, 403, 405, 429, 500 — see common errors in SKILL.md
