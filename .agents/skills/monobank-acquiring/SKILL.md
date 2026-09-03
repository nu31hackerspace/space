---
name: monobank-acquiring
description: Monobank Acquiring API reference — endpoints, request/response schemas, authentication, error handling
---

# Monobank Acquiring API Skill

Reference documentation for the Monobank Acquiring API (https://monobank.ua/api-docs/acquiring).

## Overview

This skill provides complete API reference for integrating with Monobank's acquiring (payment processing) system via back-to-back API. Use it when building or modifying endpoints that interact with Monobank acquiring.

## Minimum Required Flow

Any integration MUST implement these steps as the baseline:

1. **Create invoice** — `POST /api/merchant/invoice/create` ([invoice.md](invoice.md)) — get `invoiceId` and `pageUrl`, redirect user to `pageUrl`
2. **Accept webhook** — `POST webHookUrl` ([webhook.md](webhook.md)) — receive payment status updates, verify ECDSA signature
3. **Check status** — `GET /api/merchant/invoice/status` ([invoice.md](invoice.md)) — poll as fallback when webhook is missed or for reconciliation
4. **Handle terminal statuses:**
   - `success` — payment completed, fulfill the order (deliver goods/services, update order status in DB, notify the customer)
   - `failure` — payment failed, show error to user, allow retry or cancel the order

Webhook is the primary mechanism for learning about status changes. Status polling is a fallback. Both must handle `success` and `failure` as terminal states. Status `expired` does NOT trigger a webhook — handle it via polling or invoice validity timeout.

## Quick Start

New to the API? See the **[Quick Start Guide](quickstart.md)** — step-by-step walkthrough: get a token, create a payment, check status, handle webhooks. No deep knowledge required.

## Examples

Ready-to-run single-file servers with 3 endpoints (create payment, check status, verify webhook).

All examples read `X-Token` from `MONOBANK_TOKEN` env variable — run `export MONOBANK_TOKEN="..."` before starting.

| Language | File | Framework | Run |
|----------|------|-----------|-----|
| Python | [server.py](examples/python/server.py) | Flask | `pip install flask requests ecdsa && python server.py` |
| Node.js | [server.js](examples/nodejs/server.js) | Express | `npm install express && node server.js` |
| Go | [main.go](examples/go/main.go) | net/http | `go run main.go` |
| PHP | [server.php](examples/php/server.php) | Built-in | `php -S localhost:3000 server.php` |
| C# | [Program.cs](examples/csharp/Program.cs) | ASP.NET Minimal | `dotnet run` |
| Java | [MonobankServer.java](examples/java/MonobankServer.java) | JDK HttpServer | `javac MonobankServer.java && java MonobankServer` |

Each example includes: invoice creation, status check, ECDSA webhook signature verification, and a test form at `http://localhost:3000`.

## Base URL

```
https://api.monobank.ua
```

## Authentication

All requests require the `X-Token` header:

```
X-Token: <token>
```

Token is obtained from the merchant dashboard at https://web.monobank.ua/ or a test token from https://api.monobank.ua/

Optional CMS headers (for CMS plugin developers):
- `X-Cms` — CMS name
- `X-Cms-Version` — CMS version

## Sections

The API is organized into these sections (see separate files for details):

| Section | File | Description |
|---------|------|-------------|
| Invoice | [invoice.md](invoice.md) | Create, check status, cancel, invalidate, finalize invoices |
| Payment | [payment.md](payment.md) | Direct card payment, sync payment, token payment |
| QR | [qr.md](qr.md) | QR cashier management |
| Wallet | [wallet.md](wallet.md) | Card tokenization and management |
| Merchant | [merchant.md](merchant.md) | Merchant data, submerchants, employees |
| Statement | [statement.md](statement.md) | Transaction history/reporting |
| Fiscal | [fiscal.md](fiscal.md) | Fiscal checks and receipts |
| Webhook | [webhook.md](webhook.md) | Webhook signature verification |

## Common Error Responses

All endpoints return these standard error responses:

### 400 Bad Request
```json
{
  "errCode": "BAD_REQUEST",
  "errText": "description of the error"
}
```

### 403 Forbidden
```json
{
  "errCode": "FORBIDDEN",
  "errText": "forbidden"
}
```

### 404 Not Found
```json
{
  "errCode": "NOT_FOUND",
  "errText": "invalid 'qrId'"
}
```

### 405 Method Not Allowed
```json
{
  "errCode": "METHOD_NOT_ALLOWED",
  "errText": "Method not allowed"
}
```

### 429 Too Many Requests
```json
{
  "errCode": "TMR",
  "errText": "too many requests"
}
```

### 500 Internal Server Error
```json
{
  "errCode": "INTERNAL_ERROR",
  "errText": "internal server error"
}
```

## Common Types

### MerchantPaymInfoItem
Used in invoice creation and payment endpoints:

```
merchantPaymInfo: object
  reference: string          — Order/receipt number (merchant-defined)
  destination: string        — Payment purpose
  comment: string            — Service info field
  customerEmails: []string   — Emails for fiscal receipt
  basketOrder: []BasketOrderItem  — Order items (required when fiscalization is active)
  discounts: []DiscountItem  — Cart-level discounts/surcharges for fiscalization
```

### BasketOrderItem
```
name: string        *REQUIRED* — Product name
qty: number         *REQUIRED* — Quantity
sum: integer        *REQUIRED* — Price per unit in minor currency units (kopecks)
code: string        *REQUIRED* — Product code (required for fiscalization)
icon: string                   — Product image URL
unit: string                   — Unit name (e.g. "шт.")
total: integer                 — Total for all units in minor currency
barcode: string                — Barcode value
header: string                 — Text before product name (fiscalization)
footer: string                 — Text after product name (fiscalization)
tax: []integer                 — Tax rates from Checkbox portal
uktzed: string                 — UKT ZED code
discounts: []DiscountItem      — Item-level discounts/surcharges
```

### DiscountItem
```
type: string   *REQUIRED* [enum: DISCOUNT | EXTRA_CHARGE]
mode: string   *REQUIRED* [enum: PERCENT | VALUE]
value: number  *REQUIRED* — Discount/surcharge value
```

### FiscalizationItem
Used in cancel and finalize endpoints:
```
name: string     *REQUIRED* — Product name
qty: number      *REQUIRED* — Quantity
sum: integer     *REQUIRED* — Price per unit in minor currency units
code: string     *REQUIRED* — Product code (required for fiscalization)
barcode: string             — Barcode value
header: string              — Text before product name
footer: string              — Text after product name
tax: []integer              — Tax rates
uktzed: string              — UKT ZED code
```

### CancelListItem
```
status: string       *REQUIRED* [enum: processing | success | failure]
createdDate: string  *REQUIRED* — Creation datetime
modifiedDate: string *REQUIRED* — Last modification datetime
amount: integer                 — Amount in minor units
ccy: integer                    — ISO 4217 currency code
approvalCode: string            — Authorization code
rrn: string                     — Transaction ID in payment system
extRef: string                  — Merchant-defined cancellation reference
```

## Currency

Amounts are always in minor currency units (kopecks for UAH). Currency codes follow ISO 4217 (default: 980 = UAH).

## Invoice Statuses

| Status | Description |
|--------|-------------|
| `created` | Invoice created, awaiting payment |
| `processing` | Payment is being processed |
| `hold` | Amount held on card |
| `success` | Payment successful |
| `failure` | Payment failed |
| `reversed` | Payment reversed |
| `expired` | Invoice expired |

## Payment Methods

| Method | Description |
|--------|-------------|
| `pan` | Card number entry |
| `apple` | Apple Pay |
| `google` | Google Pay |
| `monobank` | monobank app |
| `wallet` | Token-based |
| `direct` | Direct card payment |
