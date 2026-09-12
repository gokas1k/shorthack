"""
Это и есть "агентная часть" проекта: программа сама решает, что делать
с разбором от LLM, и выполняет действие — а не просто печатает ответ модели.

Хранилище заявок — обычный JSON-файл. Для хакатона этого достаточно,
настоящая БД тут не нужна (случай, когда "обычной программной логики" хватает).
"""

import json
import time
from pathlib import Path
from llm_client import answer_question

STORE_PATH = Path(__file__).parent / "tickets.json"

# Если модель не уверена меньше этого порога — просим уточнить, а не заводим заявку вслепую
CONFIDENCE_THRESHOLD = 0.6

# Если пришло 3+ заявки одной категории за последние 2 часа — это, скорее всего,
# не отдельные случаи, а одна авария (потёк стояк, упал Wi-Fi роутер на этаже и т.п.)
# Обычная программная логика, LLM здесь не нужен — просто счётчик по времени.
INCIDENT_WINDOW_SECONDS = 2 * 60 * 60
INCIDENT_THRESHOLD = 3


def _load_tickets() -> list:
    if STORE_PATH.exists():
        return json.loads(STORE_PATH.read_text(encoding="utf-8"))
    return []


def _save_tickets(tickets: list) -> None:
    STORE_PATH.write_text(json.dumps(tickets, ensure_ascii=False, indent=2), encoding="utf-8")


def load_tickets() -> list:
    """Публичный доступ к списку заявок — используют интерфейсы (Streamlit-приложение и т.п.)."""
    return _load_tickets()


def _count_recent_same_category(tickets: list, category: str, now_ts: float) -> int:
    """Сколько заявок этой категории пришло за последнее окно времени."""
    return sum(
        1 for t in tickets
        if t.get("category") == category and now_ts - t.get("created_epoch", 0) <= INCIDENT_WINDOW_SECONDS
    )


def _find_active_incident(tickets: list, category: str, now_ts: float):
    """Ищем уже отмеченный как авария тикет той же категории в пределах окна."""
    matches = [
        t for t in tickets
        if t.get("category") == category
        and t.get("incident")
        and now_ts - t.get("created_epoch", 0) <= INCIDENT_WINDOW_SECONDS
    ]
    return matches[-1] if matches else None


def process_issue(raw_text: str, issue: dict) -> dict:
    """Разводит issue по двум веткам: вопрос — в _handle_question, всё остальное — в _handle_request."""
    if issue.get("type") == "question":
        return _handle_question(raw_text, issue)
    return _handle_request(raw_text, issue)


def _handle_question(raw_text: str, issue: dict) -> dict:
    """
    Отвечаем через агента с поиском по базе знаний (llm_client.answer_question,
    ищет в файлах knowledge_base/ через инструмент search_knowledge_base).
    Если ответа не нашлось — НЕ придумываем его, а честно передаём человеку.
    """
    query = issue.get("summary") or raw_text
    try:
        answer = answer_question(query)
    except Exception:
        answer = ""

    if answer:
        return {"action": "faq_answer", "reply": answer}

    # Прежде чем отдавать вопрос человеку "как есть", попробуем собрать чуть больше
    # контекста — так же, как для заявок на починку. Это и есть "уточняющий вопрос"
    # перед структурированной передачей человеку.
    location = issue.get("location", "")
    if not location:
        return {
            "action": "clarify",
            "issue": issue,
            "reply": (
                "Готового ответа на этот вопрос в базе нет. Уточните, пожалуйста, "
                "в какой комнате/корпусе вы находитесь и опишите чуть подробнее, "
                "в чём именно вопрос — передам это коменданту со всеми деталями."
            ),
        }

    tickets = _load_tickets()
    ticket = {
        "id": len(tickets) + 1,
        "created_at": time.strftime("%Y-%m-%d %H:%M"),
        "created_epoch": time.time(),
        "category": issue.get("category", "Другое"),
        "priority": "низкий",
        "location": issue.get("location", ""),
        "summary": issue.get("summary", raw_text[:120]),
        "raw_text": raw_text,
        "status": "вопрос без ответа",
        "incident": False,
    }
    tickets.append(ticket)
    _save_tickets(tickets)

    reply = (
        f"Спасибо за вопрос! Готового ответа в базе знаний не нашлось, поэтому передали его "
        f"коменданту вместе с деталями (**место:** {location}) — он ответит вам отдельно.  \n"
        f"Заодно добавим этот вопрос в базу на будущее."
    )
    return {"action": "escalate_question", "ticket": ticket, "reply": reply}


def _handle_request(raw_text: str, issue: dict) -> dict:
    """
    Принимает один issue из разбора LLM.
    Возвращает dict с полем "action" ("clarify", "known_issue" или "create_ticket")
    и готовым текстом ответа пользователю.
    """
    missing = issue.get("missing_fields") or []
    low_confidence = issue.get("confidence", 1) < CONFIDENCE_THRESHOLD

    if missing or low_confidence:
        if missing:
            question = "Уточните, пожалуйста: " + ", ".join(missing) + " — и я сразу передам заявку дальше."
        else:
            question = "Не получилось точно понять категорию обращения — опишите, пожалуйста, проблему чуть подробнее?"
        return {"action": "clarify", "issue": issue, "reply": question}

    now_ts = time.time()
    tickets = _load_tickets()

    # Если по этой категории уже объявлена авария — не плодим дубли заявок,
    # а просто засчитываем ещё одно подтверждение к уже существующей.
    active_incident = _find_active_incident(tickets, issue["category"], now_ts)
    if active_incident:
        active_incident["linked_reports"] = active_incident.get("linked_reports", 1) + 1
        _save_tickets(tickets)
        reply = (
            f"Спасибо за сообщение! Это уже известная проблема "
            f"(авария №{active_incident['id']}, категория «{issue['category']}») — мы уже разбираемся.  \n"
            f"Отдельную заявку заводить не будем, вы — подтверждение №{active_incident['linked_reports']}."
        )
        return {"action": "known_issue", "ticket": active_incident, "reply": reply}

    recent_count = _count_recent_same_category(tickets, issue["category"], now_ts)
    is_incident = recent_count + 1 >= INCIDENT_THRESHOLD

    ticket = {
        "id": len(tickets) + 1,
        "created_at": time.strftime("%Y-%m-%d %H:%M"),
        "created_epoch": now_ts,
        "category": issue["category"],
        "priority": "высокий" if is_incident else issue["priority"],
        "location": issue.get("location", ""),
        "summary": issue["summary"],
        "raw_text": raw_text,
        "status": "новая",
        "incident": is_incident,
        "linked_reports": 1 if is_incident else 0,
    }
    tickets.append(ticket)
    _save_tickets(tickets)

    reply = (
        f"Спасибо, заявка №{ticket['id']} принята!  \n"
        f"**Категория:** {ticket['category']}  \n"
        f"**Приоритет:** {ticket['priority']}"
    )
    if ticket["location"]:
        reply += f"  \n**Место:** {ticket['location']}"

    if is_incident:
        word = "я" if (recent_count + 1) % 10 == 1 else "й"
        reply += (
            f"\n\nПохоже, это не единичный случай — за последние 2 часа пришло "
            f"**{recent_count + 1}** обращени{word} по категории «{ticket['category']}». "
            f"Передаём это как возможную аварию, чтобы разобрались быстрее."
        )
    else:
        reply += "  \n\nМастер уже получил задачу — скоро всё поправим."

    return {"action": "create_ticket", "ticket": ticket, "reply": reply}
