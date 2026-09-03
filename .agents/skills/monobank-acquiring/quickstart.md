# Monobank Acquiring — Quick Start

Покроковий гайд: створити платіж, прийняти оплату, перевірити статус, обробити webhook.

---

## 1. Отримати тестовий токен

1. Перейди на https://api.monobank.ua/
2. Авторизуйся через QR у додатку monobank
3. Скопіюй токен — це твій `X-Token` для всіх запитів

Тестовий токен працює в sandbox-режимі: гроші не списуються, можна тестувати скільки завгодно.

Бойовий токен видається на https://web.monobank.ua/ (розділ "Мерчант" у особистому кабінеті).

Збережи токен в env-змінну, щоб не тримати його в коді:
```bash
export MONOBANK_TOKEN="uSe5P..."
```

---

## 2. Створити платіж (invoice)

```bash
curl -X POST https://api.monobank.ua/api/merchant/invoice/create \
  -H "X-Token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 4200,
    "merchantPaymInfo": {
      "reference": "order-001",
      "destination": "Оплата замовлення #001"
    },
    "redirectUrl": "https://your-site.com/payment/success",
    "webHookUrl": "https://your-site.com/webhook"
  }'
```

**Що тут:**
| Поле | Опис |
|------|------|
| `amount` | Сума в копійках. `4200` = 42.00 грн |
| `redirectUrl` | Куди повернеться користувач після оплати |
| `webHookUrl` | Куди monobank надішле повідомлення про зміну статусу |
| `reference` | Твій номер замовлення (опціонально) |
| `destination` | Призначення платежу — буде показано на сторінці оплати |

**Відповідь:**
```json
{
  "invoiceId": "p2_9ZgpZVsl3",
  "pageUrl": "https://pay.mbnk.biz/p2_9ZgpZVsl3"
}
```

- `invoiceId` — збережи, потрібен для перевірки статусу
- `pageUrl` — посилання на сторінку оплати

> Повна документація: [invoice.md](invoice.md) — всі поля створення, скасування, фіналізація холду.

---

## 3. Перенаправити користувача

Відправ користувача на `pageUrl` — це платіжна сторінка monobank.

```html
<a href="https://pay.mbnk.biz/p2_9ZgpZVsl3">Оплатити</a>
```

Або редирект з бекенду:
```
HTTP/1.1 302 Found
Location: https://pay.mbnk.biz/p2_9ZgpZVsl3
```

Після оплати користувач повернеться на `redirectUrl` (GET-запитом).

---

## 4. Перевірити статус

```bash
curl "https://api.monobank.ua/api/merchant/invoice/status?invoiceId=p2_9ZgpZVsl3" \
  -H "X-Token: YOUR_TOKEN"
```

**Відповідь:**
```json
{
  "invoiceId": "p2_9ZgpZVsl3",
  "status": "success",
  "amount": 4200,
  "ccy": 980,
  "finalAmount": 4200,
  "createdDate": "2023-01-01T00:00:00Z",
  "modifiedDate": "2023-01-01T00:01:00Z"
}
```

**Статуси:**
| Статус | Що означає |
|--------|-----------|
| `created` | Рахунок створено, чекаємо оплату |
| `processing` | Оплата обробляється |
| `hold` | Гроші заморожені на картці (для `paymentType: "hold"`) |
| `success` | Оплата пройшла |
| `failure` | Оплата не вдалася |
| `reversed` | Платіж скасовано (refund) |
| `expired` | Рахунок прострочено |

> Повна документація: [invoice.md](invoice.md#get-apimerchantinvoicestatus)

---

## 5. Прийняти webhook

Після оплати monobank відправить POST-запит на `webHookUrl` з тілом як у status endpoint.

### Що приходить

Тіло запиту — JSON зі статусом invoice (те саме що повертає `/api/merchant/invoice/status`).

Заголовок `X-Sign` — ECDSA-підпис тіла запиту для верифікації.

### Як верифікувати підпис

1. **Отримай публічний ключ** (один раз, потім кешуй):
```bash
curl "https://api.monobank.ua/api/merchant/pubkey" \
  -H "X-Token: YOUR_TOKEN"
```
Відповідь: `{"key": "LS0tLS1CRUd..."}` — base64-encoded ECDSA public key.

2. **Перевір підпис:**
   - Декодуй `key` з base64 → отримаєш PEM-формат ECDSA public key
   - Декодуй заголовок `X-Sign` з base64 → отримаєш байти підпису
   - Порахуй SHA-256 хеш тіла запиту (raw body bytes)
   - Перевір ECDSA підпис: `verify(publicKey, sha256(body), signature)`

3. **Якщо верифікація не пройшла** — запитай ключ заново (він міг оновитися)

> Готові приклади верифікації на 6 мовах: дивись [examples/](examples/)
> Повна документація: [webhook.md](webhook.md)

---

## 6. Тестування

З тестовим токеном (отриманим на https://api.monobank.ua/):
- Invoices створюються в sandbox, гроші не списуються
- Можна проходити повний флоу: створення → оплата → webhook
- Для webhook'ів потрібен публічний URL — використовуй [ngrok](https://ngrok.com/) або подібний тунель

### Швидкий тест через ngrok

```bash
# 1. Запусти свій сервер
python server.py  # або node server.js, go run main.go тощо

# 2. В іншому терміналі прокинь порт
ngrok http 3000

# 3. Скопіюй https URL від ngrok (наприклад https://abc123.ngrok.io)
#    Використовуй його як webHookUrl при створенні invoice
```

---

## Готові приклади

Повні робочі сервери на 6 мовах — кожен в одному файлі з 3 ендпоінтами (створити платіж, перевірити статус, прийняти webhook):

| Мова | Файл | Запуск |
|------|------|--------|
| Python | [examples/python/server.py](examples/python/server.py) | `pip install flask requests ecdsa && export MONOBANK_TOKEN="..." && python server.py` |
| Node.js | [examples/nodejs/server.js](examples/nodejs/server.js) | `npm install express && export MONOBANK_TOKEN="..." && node server.js` |
| Go | [examples/go/main.go](examples/go/main.go) | `export MONOBANK_TOKEN="..." && go run main.go` |
| PHP | [examples/php/server.php](examples/php/server.php) | `export MONOBANK_TOKEN="..." && php -S localhost:3000 server.php` |
| C# | [examples/csharp/Program.cs](examples/csharp/Program.cs) | `export MONOBANK_TOKEN="..." && dotnet run` |
| Java | [examples/java/MonobankServer.java](examples/java/MonobankServer.java) | `javac MonobankServer.java && export MONOBANK_TOKEN="..." && java MonobankServer` |
