// Monobank Acquiring — Node.js Example Server
//
// Мінімальний сервер з 3 ендпоінтами:
// - POST /pay         — створити invoice та повернути посилання на оплату
// - GET  /status/:id  — перевірити статус invoice
// - POST /webhook     — прийняти та верифікувати webhook
//
// Запуск:
//   npm install express
//   export MONOBANK_TOKEN="uSe5P..."   # токен мерчанта
//   node server.js
//
// Де взяти токен:
//   1. Тестовий — https://api.monobank.ua/ (авторизація через QR у додатку monobank)
//   2. Бойовий — https://web.monobank.ua/ (розділ "Мерчант" у особистому кабінеті)

const express = require("express");
const crypto = require("crypto");

// ============================================================
// Налаштування
// ============================================================
// X-Token мерчанта — читаємо з env-змінної MONOBANK_TOKEN.
// Збережи в .env або export перед запуском:
//   export MONOBANK_TOKEN="uSe5P..."
const TOKEN = process.env.MONOBANK_TOKEN || "";
const WEBHOOK_URL = process.env.MONOBANK_WEBHOOK_URL || "https://your-domain.com/webhook";
const MONO_API = "https://api.monobank.ua";
const PORT = 3000;

const app = express();

// Зберігаємо raw body для верифікації підпису webhook'ів
app.use("/webhook", express.raw({ type: "*/*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Кеш публічного ключа
let cachedPubKey = null;

// ============================================================
// Допоміжні функції
// ============================================================

async function monoRequest(method, path, body) {
  const options = {
    method,
    headers: {
      "X-Token": TOKEN,
      "Content-Type": "application/json",
    },
  };
  if (body) options.body = JSON.stringify(body);

  // [DEBUG] Лише для прикладу — у продакшен-коді цей вивід потрібно прибрати!
  console.log(`[DEBUG] ${method} ${path} request:`, body ? JSON.stringify(body) : "");

  const resp = await fetch(`${MONO_API}${path}`, options);
  const data = await resp.json();

  // [DEBUG] Лише для прикладу — у продакшен-коді цей вивід потрібно прибрати!
  console.log(`[DEBUG] ${method} ${path} response (${resp.status}):`, JSON.stringify(data));

  if (!resp.ok) throw new Error(JSON.stringify(data));
  return data;
}

async function getPubKey() {
  if (!cachedPubKey) {
    const data = await monoRequest("GET", "/api/merchant/pubkey");
    cachedPubKey = data.key;
  }
  return cachedPubKey;
}

function resetPubKey() {
  cachedPubKey = null;
}

async function verifySignature(bodyBytes, xSignB64) {
  const pubKeyB64 = await getPubKey();

  // Декодуємо публічний ключ: base64 -> PEM
  const pemStr = Buffer.from(pubKeyB64, "base64").toString("utf-8");

  // Декодуємо підпис з base64
  const signature = Buffer.from(xSignB64, "base64");

  // Перевіряємо ECDSA підпис (SHA-256)
  const verify = crypto.createVerify("SHA256");
  verify.update(bodyBytes);
  return verify.verify(pemStr, signature);
}

// ============================================================
// Ендпоінти
// ============================================================

// Головна сторінка з формою для тесту
app.get("/", (req, res) => {
  res.send(`
    <h1>Monobank Acquiring Test</h1>
    <form action="/pay" method="POST">
      <label>Сума (копійки): <input name="amount" value="4200"></label><br><br>
      <label>Опис: <input name="description" value="Тестовий платіж"></label><br><br>
      <button type="submit">Оплатити</button>
    </form>
  `);
});

// Створити invoice
app.post("/pay", async (req, res) => {
  try {
    const amount = parseInt(req.body.amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "amount is required and must be > 0" });
    }

    // Формуємо тіло запиту — лише обов'язкові поля + те, що прийшло
    const body = {
      amount,
      redirectUrl: `${req.protocol}://${req.get("host")}/`,
      webHookUrl: WEBHOOK_URL,
    };

    const merchantPaymInfo = {};
    if (req.body.description) merchantPaymInfo.destination = req.body.description;
    if (req.body.reference) merchantPaymInfo.reference = req.body.reference;
    if (Object.keys(merchantPaymInfo).length > 0) body.merchantPaymInfo = merchantPaymInfo;

    const data = await monoRequest("POST", "/api/merchant/invoice/create", body);

    res.json({
      invoiceId: data.invoiceId,
      pageUrl: data.pageUrl,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Перевірити статус invoice
app.get("/status/:invoiceId", async (req, res) => {
  try {
    const data = await monoRequest(
      "GET",
      `/api/merchant/invoice/status?invoiceId=${req.params.invoiceId}`
    );
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Прийняти webhook
app.post("/webhook", async (req, res) => {
  const bodyBytes = req.body; // raw Buffer
  const xSign = req.headers["x-sign"];

  if (!xSign) return res.status(400).send("Missing X-Sign header");

  try {
    let valid = await verifySignature(bodyBytes, xSign);

    if (!valid) {
      // Ключ міг оновитися — пробуємо з новим
      resetPubKey();
      valid = await verifySignature(bodyBytes, xSign);
    }

    if (!valid) return res.status(400).send("Invalid signature");

    // Підпис вірний — обробляємо дані
    const data = JSON.parse(bodyBytes.toString());

    // [DEBUG] Лише для прикладу — у продакшен-коді цей вивід потрібно прибрати!
    console.log("[DEBUG] Webhook received:", JSON.stringify(data));

    // Тут твоя бізнес-логіка: оновити замовлення, надіслати email тощо

    res.send("OK");
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).send("Error");
  }
});

if (!TOKEN) {
  console.error('MONOBANK_TOKEN is not set. Export it before running:');
  console.error('  export MONOBANK_TOKEN="uSe5P..."');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
