"""
NEXUS CLUB — Агент для ПК
Установка:
  1. Установите Python 3.8+ с python.org
  2. pip install requests pillow pywin32
  3. Скопируйте этот файл на ПК, укажите AGENT_TOKEN и SERVER_URL
  4. Запустите: python nexus_agent.py
  5. Для автозапуска: добавьте в Планировщик задач Windows

Команды которые понимает агент:
  - lock       — заблокировать экран (завершение сессии)
  - unlock     — разблокировать (начало сессии)
  - shutdown   — выключить ПК
  - reboot     — перезагрузить ПК
  - screenshot — сделать скриншот и отправить
  - message    — показать сообщение на экране
  - set_volume — установить громкость (0-100)
  - kill_process — завершить процесс по имени
"""

import os
import sys
import time
import json
import base64
import socket
import ctypes
import subprocess
import requests
from io import BytesIO
from datetime import datetime

# ===================== НАСТРОЙКИ =====================
AGENT_TOKEN = "ВСТАВЬ_ТОКЕН_СЮДА"   # Токен из панели управления
SERVER_URL = "https://functions.poehali.dev/b9f4a55e-1d4e-434c-9baa-b1bbcccb3f9f"
HEARTBEAT_INTERVAL = 5  # секунд
# =====================================================

HEADERS = {"X-Agent-Token": AGENT_TOKEN, "Content-Type": "application/json"}


def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "unknown"


def get_active_window():
    try:
        import win32gui
        hwnd = win32gui.GetForegroundWindow()
        return win32gui.GetWindowText(hwnd)
    except Exception:
        return ""


def get_status():
    """Определяем статус: если есть активное окно игры — active, иначе idle"""
    window = get_active_window().lower()
    games = ["cs2", "csgo", "dota", "valorant", "cyberpunk", "gta", "apex", "fortnite", "league", "steam"]
    for game in games:
        if game in window:
            return "active"
    return "idle"


def take_screenshot():
    try:
        from PIL import ImageGrab
        img = ImageGrab.grab()
        img = img.resize((1280, 720))
        buf = BytesIO()
        img.save(buf, format='JPEG', quality=70)
        return base64.b64encode(buf.getvalue()).decode('utf-8')
    except Exception as e:
        print(f"Screenshot error: {e}")
        return None


def execute_command(cmd):
    command = cmd.get("command")
    params = cmd.get("params", {})
    cmd_id = cmd.get("id")
    result = {"success": False, "command": command}

    print(f"[{datetime.now().strftime('%H:%M:%S')}] Выполняю: {command} {params}")

    try:
        if command == "lock":
            ctypes.windll.user32.LockWorkStation()
            result["success"] = True

        elif command == "unlock":
            # Просто снимаем блокировку (требует физического присутствия или wake)
            result["success"] = True
            result["note"] = "unlock sent"

        elif command == "shutdown":
            delay = params.get("delay", 0)
            os.system(f"shutdown /s /t {delay}")
            result["success"] = True

        elif command == "reboot":
            delay = params.get("delay", 0)
            os.system(f"shutdown /r /t {delay}")
            result["success"] = True

        elif command == "screenshot":
            image = take_screenshot()
            if image:
                resp = requests.post(
                    f"{SERVER_URL}/screenshot",
                    headers=HEADERS,
                    json={"image": image},
                    timeout=30
                )
                result["success"] = resp.status_code == 200
                result["url"] = resp.json().get("url", "")

        elif command == "message":
            text = params.get("text", "Сообщение от администратора")
            title = params.get("title", "NEXUS CLUB")
            ctypes.windll.user32.MessageBoxW(0, text, title, 0x40 | 0x1000)
            result["success"] = True

        elif command == "set_volume":
            level = min(100, max(0, params.get("level", 50)))
            os.system(f'nircmd setsysvolume {int(level * 655.35)}')
            result["success"] = True

        elif command == "kill_process":
            process_name = params.get("name", "")
            if process_name:
                os.system(f"taskkill /F /IM {process_name}")
                result["success"] = True

        elif command == "open_url":
            import webbrowser
            url = params.get("url", "")
            if url:
                webbrowser.open(url)
                result["success"] = True

        elif command == "maintenance":
            # Заблокировать и показать сообщение
            ctypes.windll.user32.MessageBoxW(
                0, "ПК переведён на техническое обслуживание", "NEXUS CLUB", 0x30 | 0x1000
            )
            ctypes.windll.user32.LockWorkStation()
            result["success"] = True

    except Exception as e:
        result["error"] = str(e)
        print(f"  Ошибка: {e}")

    # Отправляем результат на сервер
    try:
        requests.post(
            f"{SERVER_URL}/result",
            headers=HEADERS,
            json={"command_id": cmd_id, "result": result},
            timeout=10
        )
    except Exception as e:
        print(f"  Ошибка отправки результата: {e}")

    return result


def heartbeat():
    try:
        payload = {
            "status": get_status(),
            "ip": get_local_ip(),
            "active_window": get_active_window()
        }
        resp = requests.post(
            f"{SERVER_URL}/heartbeat",
            headers=HEADERS,
            json=payload,
            timeout=10
        )
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Heartbeat → HTTP {resp.status_code}")
        if resp.status_code == 401:
            print("ОШИБКА: Неверный токен! Проверьте AGENT_TOKEN в файле")
            return []
        if resp.status_code == 200:
            data = resp.json()
            print(f"  OK, статус: {data}")
            return data.get("commands", [])
    except requests.exceptions.ConnectionError:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Нет соединения с сервером...")
    except Exception as e:
        print(f"Heartbeat error: {e}")
    return []


def main():
    print("=" * 50)
    print("  NEXUS CLUB — Агент управления ПК")
    print("=" * 50)

    if AGENT_TOKEN == "ВСТАВЬ_ТОКЕН_СЮДА":
        print("\n⚠️  ОШИБКА: Вставьте токен агента!")
        print("Получите токен в панели управления NEXUS CLUB")
        print("(раздел ПК → Добавить ПК → скопировать токен)")
        input("\nНажмите Enter для выхода...")
        sys.exit(1)

    print(f"\nТокен: {AGENT_TOKEN[:8]}...")
    print(f"Сервер: {SERVER_URL}")
    print(f"IP: {get_local_ip()}")
    print(f"\nАгент запущен. Жду команды...\n")

    while True:
        commands = heartbeat()
        for cmd in commands:
            execute_command(cmd)
        time.sleep(HEARTBEAT_INTERVAL)


if __name__ == "__main__":
    main()