# Прошивка датчика світла NU31 для ESP32-C3 (MicroPython).
#
# Пристрій живиться від розетки: поки є світло, він кожні 30 секунд
# надсилає запит на backend. Якщо запити припинились — світла немає.

import time

import machine
import network

try:
    import requests
except ImportError:
    import urequests as requests

import config

PING_INTERVAL_MS = 30 * 1000
WATCHDOG_TIMEOUT_MS = 60 * 1000
WIFI_CONNECT_TIMEOUT_MS = 15 * 1000
HTTP_TIMEOUT_S = 10
# Якщо запити не проходять 10 хвилин поспіль — перезавантажуємо плату,
# щоб скинути можливий завислий стан Wi-Fi чи мережевого стека.
MAX_FAILED_PINGS = 20

# Watchdog перезавантажить плату, якщо її не "погодувати" протягом 60 с.
# Один цикл (підключення до Wi-Fi + запит) займає не більше ~25 с,
# тому за нормальної роботи watchdog ніколи не спрацює.
wdt = machine.WDT(timeout=WATCHDOG_TIMEOUT_MS)

wlan = network.WLAN(network.STA_IF)
wlan.active(True)


def connect_wifi():
    if wlan.isconnected():
        return True

    print('Connecting to Wi-Fi', config.WIFI_SSID)
    try:
        wlan.disconnect()
    except OSError:
        pass
    wlan.connect(config.WIFI_SSID, config.WIFI_PASSWORD)

    started = time.ticks_ms()
    while not wlan.isconnected():
        if time.ticks_diff(time.ticks_ms(), started) > WIFI_CONNECT_TIMEOUT_MS:
            print('Wi-Fi connection timed out')
            return False
        time.sleep_ms(500)

    print('Wi-Fi connected:', wlan.ifconfig()[0])
    return True


def send_ping():
    url = config.PING_URL + '?token=' + config.ELECTRICITY_TOKEN
    response = None
    try:
        response = requests.get(url, timeout=HTTP_TIMEOUT_S)
        ok = 200 <= response.status_code < 300
        print('Ping status:', response.status_code)
        return ok
    except Exception as error:
        print('Ping failed:', error)
        return False
    finally:
        if response is not None:
            response.close()


def main():
    failed_pings = 0

    while True:
        started = time.ticks_ms()

        if connect_wifi() and send_ping():
            failed_pings = 0
        else:
            failed_pings += 1
            if failed_pings >= MAX_FAILED_PINGS:
                print('Too many failed pings, resetting')
                machine.reset()

        wdt.feed()

        elapsed = time.ticks_diff(time.ticks_ms(), started)
        if elapsed < PING_INTERVAL_MS:
            time.sleep_ms(PING_INTERVAL_MS - elapsed)


main()
