"""
Веб-интерфейс: слева имитируем входящее письмо, справа — то, что видит оператор.
Запуск: streamlit run app.py
"""

import streamlit as st
import pandas as pd
from main import handle_incoming_message
from decision import load_tickets
from dotenv import load_dotenv
import os

load_dotenv()

st.set_page_config(page_title="Техподдержка общежития", layout="wide")
st.title("ИИ-помощник техподдержки общежития")

tickets_now = load_tickets()
incident_categories = sorted({t["category"] for t in tickets_now if t.get("incident")})
if incident_categories:
    st.error("Возможная авария сейчас по категориям: " + ", ".join(incident_categories))

col_input, col_queue = st.columns([1, 1])

if "pending_text" not in st.session_state:
    st.session_state.pending_text = ""

with col_input:
    st.subheader("Входящее обращение")
    if st.session_state.pending_text:
        st.caption("Продолжаем предыдущее обращение — ваш ответ добавится к нему.")
    text = st.text_area(
        "Сообщение студента",
        height=160,
        placeholder="Например: в комнате 305 течёт кран, вода на полу",
    )
    if st.button("Обработать", type="primary") and text.strip():
        full_text = f"{st.session_state.pending_text}\n{text}".strip() if st.session_state.pending_text else text

        with st.spinner("ИИ анализирует обращение..."):
            results = handle_incoming_message(full_text)

        still_pending = False
        for r in results:
            action = r["action"]
            if action == "create_ticket":
                st.success(r["reply"])
            elif action == "faq_answer":
                st.info(r["reply"])
            elif action == "clarify":
                st.warning(r["reply"])
                still_pending = True
            elif action in ("known_issue", "escalate_question"):
                st.warning(r["reply"])
            else:
                st.error(r["reply"])

        st.session_state.pending_text = full_text if still_pending else ""

with col_queue:
    st.subheader("Очередь заявок коменданта")
    tickets = load_tickets()
    if tickets:
        df = pd.DataFrame(tickets)
        show_cols = [c for c in ["id", "created_at", "category", "priority", "location", "summary", "status"] if c in df.columns]
        st.dataframe(df[show_cols], use_container_width=True, hide_index=True)
    else:
        st.caption("Пока пусто — заявки появятся здесь после обработки сообщений.")
