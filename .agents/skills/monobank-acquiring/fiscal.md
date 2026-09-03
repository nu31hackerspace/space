# Fiscal (Фіскалізація)

Fiscal checks and receipts operations.

---

## GET /api/merchant/invoice/fiscal-checks

**Фіскальні чеки** — Get fiscal check data and statuses for an invoice.

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
  "checks": [
    {
      "id": "a2fd4aef-cdb8-4e25-9b36-b6d4672c554d",
      "status": "done",
      "type": "sale",
      "fiscalizationSource": "monopay",
      "statusDescription": "",
      "taxUrl": "https://cabinet.tax.gov.ua/cashregs/check",
      "file": "CJFVBERi0xLj4QKJaqrr..."
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| checks | []object | yes | List of fiscal checks |
| checks[].id | string | yes | Check ID. Example: `a2fd4aef-cdb8-4e25-9b36-b6d4672c554d` |
| checks[].status | string | yes | Enum: `new`, `process`, `done`, `failed` |
| checks[].type | string | yes | Enum: `sale`, `return` |
| checks[].fiscalizationSource | string | yes | Enum: `checkbox`, `monopay` |
| checks[].statusDescription | string | no | Status description |
| checks[].taxUrl | string | no | Link to the check on tax authority website |
| checks[].file | string | no | Base64-encoded PDF file of the check |

### Errors
400, 403, 404, 405, 429, 500 — see common errors in SKILL.md

---

## GET /api/merchant/invoice/receipt

**Квитанція** — Get receipt and optionally send it to an email address.

### Request

**Headers:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| X-Token | string | yes | Merchant token |

**Query Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| invoiceId | string | yes | Invoice ID |
| email | string | no | Email address to send receipt to |

### Response 200

```json
{
  "file": "CJFVBERi0xLj4QKJaqrr..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | string | no | Base64-encoded PDF receipt file |

### Errors
400, 403, 404, 405, 429, 500 — see common errors in SKILL.md
