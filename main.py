"""
Склеивает llm_client.py (анализ) и decision.py (решение + действие).
Можно тестировать прямо из консоли, не поднимая Telegram-бота —
удобно, чтобы разработчики "мозгов" и "рук" не ждали разработчика бота.
"""

from llm_client import analyze_message
from decision import process_issue


def handle_incoming_message(text: str):
    """Возвращает список результатов — по одному на каждую найденную проблему в сообщении."""
    try:
        analysis = analyze_message(text)
        issues = analysis["issues"]
    except Exception as e:
        # Если LLM недоступен или вернул что-то не то — не роняем бота,
        # а мягко откатываемся на ручную обработку. Полезно на демо, если сеть моргнёт.
        # Настоящую причину печатаем в терминал, чтобы её можно было увидеть и починить.
        print(f"[main.py] Реальная ошибка при разборе сообщения: {e!r}")
        return [{
            "action": "error_fallback",
            "reply": "Приняли ваше сообщение. Не смогли разобрать автоматически — оператор посмотрит вручную.",
        }]

    return [process_issue(text, issue) for issue in issues]


if __name__ == "__main__":
    print("Тестовый режим. Пустая строка — выход.\n")
    while True:
        text = input("Сообщение пользователя: ").strip()
        if not text:
            break
        for result in handle_incoming_message(text):
            print("---")
            print(result["reply"])
        print()
