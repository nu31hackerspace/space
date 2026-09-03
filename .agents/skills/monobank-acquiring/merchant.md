# Merchant (Мерчант)

Merchant data, submerchants, and employee management.

---

## GET /api/merchant/details

**Дані мерчанта** — Get merchant data.

### Request

**Headers:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| X-Token | string | yes | Merchant token |

### Response 200

```json
{
  "merchantId": "12o4Vv7EWy",
  "merchantName": "Your Favourite Company",
  "edrpou": "4242424242"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| merchantId | string | yes | Merchant identifier. Example: `12o4Vv7EWy` |
| merchantName | string | yes | Merchant name. Example: `Your Favourite Company` |
| edrpou | string | yes | EDRPOU code. Example: `4242424242` |

### Errors
400, 403, 405, 429, 500 — see common errors in SKILL.md

---

## GET /api/merchant/submerchant/list

**Список субмерчантів** — List submerchants. This API is needed for a limited set of merchants who need to explicitly specify a terminal when creating an invoice.

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
      "code": "0a8637b3bccb42aa93fdeb791b8b58e9",
      "iban": "UA213996220000026007233566001",
      "edrpou": "4242424242",
      "owner": "ТОВ Ворона"
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| list | []object | yes | List of submerchants |
| list[].code | string | yes | Terminal identifier. Example: `0a8637b3bccb42aa93fdeb791b8b58e9` |
| list[].iban | string | yes | Terminal owner IBAN. Example: `UA213996220000026007233566001` |
| list[].edrpou | string | no | Terminal owner EDRPOU. Example: `4242424242` |
| list[].owner | string | no | Terminal owner name. Example: `ТОВ Ворона` |

### Errors
400, 403, 405, 429, 500 — see common errors in SKILL.md

---

## GET /api/merchant/employee/list

**Список співробітників** — List employees who can receive tips. To add employees, contact support. With a test token, returns test objects for integration testing.

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
      "id": "3QFX7e7mZfo3R",
      "name": "Артур Дент",
      "extRef": "abra_kadabra"
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| list | []object | yes | List of employees |
| list[].id | string | yes | Employee ID in acquiring system. Example: `3QFX7e7mZfo3R` |
| list[].name | string | yes | Employee name. Example: `Артур Дент` |
| list[].extRef | string | yes | Employee ID in merchant's system. Example: `abra_kadabra` |

### Errors
400, 403, 405, 429, 500 — see common errors in SKILL.md
