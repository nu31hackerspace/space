# Датчик світла NU31 (ESP32-C3, MicroPython)

Пристрій вмикається в розетку і, поки є світло, кожні 30 секунд надсилає
запит на `https://nu31.space/api/nu31electricity?token=...`. Сайт показує
«Світла немає», якщо останній запит був понад 3 хвилини тому.

## Як працює

- **Wi-Fi**: перед кожним запитом перевіряється з'єднання; якщо його немає,
  пристрій пробує перепідключитися (до 15 с на спробу) і повторює це в
  кожному наступному циклі, доки Wi-Fi не з'явиться.
- **Watchdog**: апаратний watchdog на 60 с. Він «годується» раз на цикл
  (30 с), тож якщо прошивка зависне, плата перезавантажиться.
- **Збої мережі**: якщо 20 запитів поспіль (≈10 хв) не пройшли, плата
  перезавантажується сама.

## Прошивка

1. Встанови MicroPython на ESP32-C3. Образ v1.29.0 лежить у `firmware/`
   (новіші версії — на [micropython.org](https://micropython.org/download/ESP32_GENERIC_C3/)):

    ```bash
    pip install esptool mpremote
    esptool --chip esp32c3 erase-flash
    esptool --chip esp32c3 write-flash -z 0x0 ../ESP32_GENERIC_C3-20260824-v1.29.0.bin
    ```

2. Створи `config.py` із шаблону і заповни SSID, пароль Wi-Fi та токен
   (значення секрету `NU31_ELECTRICITY_TOKEN`):

    ```bash
    cp config.example.py config.py
    ```

3. Залий файли на плату і перезавантаж її:

    ```bash
    mpremote cp config.py :config.py
    mpremote cp main.py :main.py
    mpremote reset
    ```

Логи можна дивитися через `mpremote repl`.

> `config.py` містить секрети і не комітиться в git.

> Якщо плата ESP32-C3 SuperMini не підключається до Wi-Fi, допомагає
> зменшити потужність передавача: додай `wlan.config(txpower=8.5)` після
> `wlan.active(True)` у `main.py`.
