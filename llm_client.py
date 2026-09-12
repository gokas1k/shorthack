"""
Обёртка над YandexGPT / Yandex AI Studio.

Тут два РАЗНЫХ API, и это осознанно:
1. Chat Completions API (client) — для analyze_message: быстрый структурированный
   разбор обращения (категория/приоритет/локация/уверенность). Своей базы знаний
   не требует.
2. Responses API (assistant_client) — для вызова уже готового агента dormwise,
   настроенного в консоли Yandex AI Studio (Agent Atelier). У него уже подключена
   база знаний через инструмент "Поиск по файлам" — сами мы там ничего не ищем.

Если агент dormwise недоступен (не настроен DORMWISE_AGENT_ID, сеть моргнула и т.п.) —
answer_question() подстраховывается локальным поиском по knowledge_base/ (см. tools.py),
чтобы демо не падало на ровном месте.
"""

import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from tools import SEARCH_TOOL, search_knowledge_base

load_dotenv()

YANDEX_API_KEY = os.environ["YANDEX_API_KEY"]
YANDEX_FOLDER_ID = os.environ["YANDEX_FOLDER_ID"]
DORMWISE_AGENT_ID = os.environ.get("DORMWISE_AGENT_ID", "")

# Обычные текстовые запросы (классификация)
client = OpenAI(
    api_key=YANDEX_API_KEY,
    base_url="https://ai.api.cloud.yandex.net/v1",
    project=YANDEX_FOLDER_ID,
    timeout=60.0,
)

# Вызов готового агента dormwise, настроенного в Agent Atelier
assistant_client = OpenAI(
    api_key=YANDEX_API_KEY,
    base_url="https://rest-assistant.api.cloud.yandex.net/v1",
    project=YANDEX_FOLDER_ID,
    timeout=60.0,
)

# Серверу нужен полный URI модели — короткое имя ("yandexgpt/rc") вызывало
# ошибку "Failed to parse model URI" на этом аккаунте.
MODEL = f"gpt://{YANDEX_FOLDER_ID}/yandexgpt/rc"

CATEGORIES = [
    "Wi-Fi/интернет", "Сантехника", "Электрика", "Мебель и техника",
    "Пропуск/ключи", "Клининг", "Дезинсекция", "Оплата", "Другое",
]

ANALYSIS_SCHEMA = {
    "name": "ticket_analysis",
    "schema": {
        "type": "object",
        "properties": {
            "issues": {
                "type": "array",
                "description": "Один элемент на каждую ОТДЕЛЬНУЮ проблему в сообщении",
                "items": {
                    "type": "object",
                    "properties": {
                        "type": {
                            "type": "string",
                            "enum": ["request", "question"],
                            "description": "request — нужно действие (что-то сломалось/нужна услуга), question — просто вопрос",
                        },
                        "category": {"type": "string", "enum": CATEGORIES},
                        "summary": {"type": "string", "description": "Суть проблемы или вопроса одним предложением"},
                        "priority": {"type": "string", "enum": ["низкий", "средний", "высокий"]},
                        "location": {
                            "type": "string",
                            "description": "Номер комнаты/этаж/корпус, если указаны. Пустая строка, если не указаны.",
                        },
                        "missing_fields": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Только для type=request: чего не хватает для передачи в работу. Для type=question всегда пусто.",
                        },
                        "confidence": {
                            "type": "number",
                            "description": "Уверенность модели в разборе, число от 0 до 1",
                        },
                    },
                    "required": ["type", "category", "summary", "priority", "location", "missing_fields", "confidence"],
                },
            }
        },
        "required": ["issues"],
    },
}

SYSTEM_PROMPT = """Ты — ассистент коменданта общежития, который разбирает обращения студентов.
Раздели обращение на отдельные issues. Если проблем/вопросов несколько — верни несколько элементов.

Для каждого issue определи type:
- "request" — нужно действие: что-то сломалось, нужна услуга (уборка, дезинсекция и т.п.)
- "question" — студент просто спрашивает, чинить ничего не надо. Ответ на вопрос ищет
  ОТДЕЛЬНЫЙ агент с доступом к базе знаний — тебе достаточно выделить сам вопрос
  в summary, отвечать на него самому не нужно.

Для type=request твоя ЕДИНСТВЕННАЯ задача — собрать и структурировать информацию
(категория, место, что случилось, приоритет) для передачи живому мастеру.
НИКОГДА не объясняй пользователю, как починить проблему самому, даже если это просто
(например, "перезагрузите роутер") — такие советы не должны попадать ни в одно поле.

Категории:
- Wi-Fi/интернет
- Сантехника (краны, раковина, душ, туалет, отопление, горячая/холодная вода)
- Электрика (розетки, свет, проводка)
- Мебель и техника (кровать, шкаф, стиральная машина, плита)
- Пропуск/ключи (доступ в здание/комнату)
- Клининг (уборка комнаты или общих зон)
- Дезинсекция (тараканы, клопы и т.п.)
- Оплата (вопросы или проблемы, связанные с оплатой общежития)
- Другое

Приоритет (важен только для type=request):
- высокий: протечка воды, короткое замыкание/искрит/пахнет гарью, нет отопления, не работает пропуск
- средний: не работает Wi-Fi, сломана техника, нужна дезинсекция
- низкий: перегорела лампочка, косметические мелочи, плановая уборка

location — номер комнаты/этаж/корпус, если указаны, иначе пустая строка.

missing_fields (только для type=request) — чего РЕАЛЬНО не хватает для передачи в работу
(чаще всего это номер комнаты). Для type=question всегда пустой список."""

# Промпт для ЛОКАЛЬНОГО запасного поиска (используется только если dormwise недоступен)
QA_SYSTEM_PROMPT = """Ты отвечаешь на вопросы студентов общежития.
У тебя есть инструмент search_knowledge_base — ОБЯЗАТЕЛЬНО вызови его первым,
прежде чем отвечать на любой вопрос, даже если кажется, что ответ и так очевиден.
Отвечай ТОЛЬКО на основе того, что нашёл инструмент, коротко и по делу.
Если инструмент не нашёл ничего подходящего — прямо скажи, что не знаешь."""

NOT_FOUND_MARKER = "ОТВЕТ НЕ НАЙДЕН"
_NOT_FOUND_HINTS = ["не знаю", "нет информации", "не нашл", "не могу ответить", "не располагаю"]


def _looks_like_no_answer(text: str) -> bool:
    if not text:
        return True
    lowered = text.lower()
    if NOT_FOUND_MARKER.lower() in lowered:
        return True
    return any(hint in lowered for hint in _NOT_FOUND_HINTS)


def analyze_message(text: str) -> dict:
    """Возвращает dict вида {"issues": [ {...}, {...} ]}"""
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": text},
        ],
        temperature=0.2,
        response_format={"type": "json_schema", "json_schema": ANALYSIS_SCHEMA},
    )
    return json.loads(response.choices[0].message.content)


def ask_dormwise(query: str) -> str:
    """
    Спрашивает готового агента dormwise (настроен в Yandex AI Studio, Agent Atelier).
    У него уже подключена база знаний — искать самим ничего не нужно.
    Требует DORMWISE_AGENT_ID в .env (ID сохранённого агента из консоли).
    """
    if not DORMWISE_AGENT_ID:
        raise RuntimeError("DORMWISE_AGENT_ID не задан в .env")

    response = assistant_client.responses.create(
        prompt={"id": DORMWISE_AGENT_ID},
        input=query,
    )

    text = getattr(response, "output_text", None)
    if not text:
        try:
            text = response.output[0].content[0].text
        except Exception:
            text = ""
    text = (text or "").strip()

    return "" if _looks_like_no_answer(text) else text


def _local_answer_question(query: str) -> str:
    """Запасной вариант: агент с function calling, ищет по файлам в knowledge_base/."""
    messages = [
        {"role": "system", "content": QA_SYSTEM_PROMPT},
        {"role": "user", "content": query},
    ]

    first = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        tools=[SEARCH_TOOL],
        tool_choice="auto",
    )
    message = first.choices[0].message

    if not message.tool_calls:
        return ""

    messages.append({
        "role": "assistant",
        "content": message.content,
        "tool_calls": [
            {
                "id": tc.id,
                "type": "function",
                "function": {"name": tc.function.name, "arguments": tc.function.arguments},
            }
            for tc in message.tool_calls
        ],
    })

    found_anything = False
    for tc in message.tool_calls:
        args = json.loads(tc.function.arguments or "{}")
        results = search_knowledge_base(args.get("query", query))
        if results:
            found_anything = True
        tool_text = "\n\n".join(f"[{r['file']}]\n{r['content']}" for r in results) or "Ничего не найдено в базе."
        messages.append({"role": "tool", "tool_call_id": tc.id, "content": tool_text})

    if not found_anything:
        return ""

    final = client.chat.completions.create(model=MODEL, messages=messages)
    return (final.choices[0].message.content or "").strip()


def answer_question(query: str) -> str:
    """
    Главная точка входа для вопросов. Основной путь — dormwise: у него настоящие
    данные (ваша Google-таблица), а не примеры-заглушки. Локальный поиск по
    knowledge_base/ — только техническая подстраховка на случай, если dormwise
    недоступен (сеть, не настроен DORMWISE_AGENT_ID и т.п.), а не альтернативный
    источник фактов — файлы там мои примеры для демонстрации, не ваши реальные данные.

    Важно: сюда попадают ТОЛЬКО настоящие вопросы (type=question) — заявки на
    починку decision.py отправляет в другую ветку (_handle_request) и до dormwise
    вообще не доходят. Поэтому мешанина "спросили про сантехнику — ответили про
    прачечную" в этом пайплайне не должна повторяться: она возможна только если
    тестировать dormwise отдельно в консоли, без нашей классификации перед ним.
    """
    try:
        return ask_dormwise(query)
    except Exception:
        return _local_answer_question(query)


if __name__ == "__main__":
    demo_request = "В комнате 305 второй день течёт кран под раковиной, вода уже на полу"
    print("--- Разбор заявки ---")
    print(json.dumps(analyze_message(demo_request), ensure_ascii=False, indent=2))

    print("\n--- Ответ на вопрос (dormwise, если настроен, иначе локальный поиск) ---")
    print(answer_question("Когда работает прачечная?"))

    print("\n--- Ответ на вопрос без ответа в базе ---")
    print(repr(answer_question("Можно ли держать кота в комнате?")))
