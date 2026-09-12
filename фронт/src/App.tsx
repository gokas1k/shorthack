import { useState } from "react";

const SERVICES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
    title: "Ремонт мебели и техники",
    description: "Подайте заявку на ремонт кровати, стола, стула, холодильника, стиральной машины или другого оборудования. Отслеживайте статус в реальном времени.",
    color: "#6366F1",
    bg: "#EEF2FF",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: "Ответы на вопросы",
    description: "ИИ-помощник отвечает 24/7 на любые вопросы о проживании, правилах, документах, расписании и услугах общежития.",
    color: "#00C9A7",
    bg: "#E6FBF7",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    title: "Заявка на клининг",
    description: "Закажите уборку комнаты или общественных помещений. Выберите удобное время и тип уборки — стандартная или генеральная.",
    color: "#F59E0B",
    bg: "#FEF9EE",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
      </svg>
    ),
    title: "Дезинсекция",
    description: "Обнаружили насекомых или грызунов? Подайте заявку на дезинсекцию. Профессиональная обработка в течение 24 часов.",
    color: "#EF4444",
    bg: "#FEF2F2",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    title: "Уведомления",
    description: "Получайте актуальные уведомления о происшествиях, плановых работах, мероприятиях и важных событиях вашего общежития.",
    color: "#8B5CF6",
    bg: "#F5F3FF",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Безопасность",
    description: "Сообщите о нарушениях или происшествиях. Ваше обращение будет анонимно передано администрации для оперативного реагирования.",
    color: "#0EA5E9",
    bg: "#F0F9FF",
  },
];

const STEPS = [
  { num: "01", title: "Выберите услугу", desc: "Откройте чат и выберите нужную категорию или напишите вопрос в свободной форме." },
  { num: "02", title: "Заполните заявку", desc: "ИИ-помощник уточнит детали и поможет оформить заявку в несколько касаний." },
  { num: "03", title: "Получите результат", desc: "Отслеживайте статус заявки и получайте уведомления прямо в чате." },
];

const CHAT_MESSAGES = [
  { from: "user", text: "Привет! Хочу подать заявку на ремонт." },
  { from: "bot", text: "Привет! Я DormWise — ваш помощник в Горняке. Что именно нужно починить?" },
  { from: "user", text: "Сломалась ручка у шкафа в комнате 314." },
  { from: "bot", text: "Принял! Заявка #2847 создана. Мастер придёт завтра с 10:00 до 14:00. Вам придёт уведомление за час." },
];

const STATS = [
  { value: "98%", label: "заявок решено в срок" },
  { value: "< 2 мин", label: "время ответа ИИ" },
  { value: "2 000+", label: "студентов Горняка" },
  { value: "24/7", label: "работает помощник" },
];

type Section = "home" | "services" | "how" | "chat";

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>("home");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{ from: string; text: string }[]>(CHAT_MESSAGES);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeService, setActiveService] = useState<number | null>(null);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = { from: "user", text: chatInput };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Понял вас! Уточните, пожалуйста, ваш номер комнаты и корпус (Горняк-1 или Горняк-2)?" },
      ]);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span className="text-lg font-800 tracking-tight text-slate-900" style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
              dorn<span style={{ color: "#00C9A7" }}>wise</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Услуги", id: "services" },
              { label: "Как работает", id: "how" },
              { label: "Чат", id: "chat-demo" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="nav-link text-sm font-600 text-slate-600 hover:text-slate-900 transition-colors"
                style={{ fontWeight: 600 }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollTo("chat-demo")}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #00C9A7, #00A589)", fontWeight: 700 }}
            >
              Открыть чат
            </button>
            <button
              className="md:hidden p-2 text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileMenuOpen
                  ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                  : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
                }
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-6 py-4 flex flex-col gap-4">
            {[
              { label: "Услуги", id: "services" },
              { label: "Как работает", id: "how" },
              { label: "Чат", id: "chat-demo" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-left text-sm font-600 text-slate-700"
                style={{ fontWeight: 600 }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="gradient-hero pt-32 pb-20 px-6 relative overflow-hidden">
        {/* bg decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-96 h-96 rounded-full opacity-5" style={{ background: "#00C9A7", filter: "blur(80px)" }} />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-5" style={{ background: "#6366F1", filter: "blur(60px)" }} />
          {/* grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>
          </svg>
        </div>

        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 border" style={{ borderColor: "rgba(0,201,167,0.3)", background: "rgba(0,201,167,0.08)" }}>
                <span className="w-2 h-2 rounded-full pulse-dot" style={{ background: "#00C9A7" }} />
                <span className="tag" style={{ color: "#00C9A7" }}>МИСИС · Горняк-1 и Горняк-2</span>
              </div>

              <h1 className="text-5xl lg:text-6xl text-white mb-6 leading-tight" style={{ fontWeight: 900, letterSpacing: "-0.025em", lineHeight: 1.1 }}>
                Умный помощник{" "}
                <span style={{ color: "#00C9A7" }}>общежития</span>
              </h1>

              <p className="text-lg text-slate-300 mb-10 leading-relaxed" style={{ fontWeight: 400, maxWidth: "480px" }}>
                DormWise — ИИ-ассистент для студентов МИСИС. Подавайте заявки, получайте ответы и оставайтесь в курсе событий — всё в одном чате.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => scrollTo("chat-demo")}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-700 transition-all hover:scale-105 glow-accent"
                  style={{ background: "linear-gradient(135deg, #00C9A7, #00A589)", fontWeight: 700, fontSize: "15px" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  Написать помощнику
                </button>
                <button
                  onClick={() => scrollTo("services")}
                  className="px-7 py-3.5 rounded-xl font-700 border transition-all hover:bg-white/10"
                  style={{ fontWeight: 700, fontSize: "15px", borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.85)" }}
                >
                  Все услуги
                </button>
              </div>
            </div>

            {/* Right — chat preview */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border" style={{ background: "#FFFFFF", borderColor: "rgba(255,255,255,0.12)", boxShadow: "0 40px 80px rgba(0,0,0,0.4)" }}>
                {/* Chat header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #00C9A7, #00A589)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-slate-800" style={{ fontWeight: 700 }}>DormWise</div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#22C55E" }} />
                      <span className="text-xs text-slate-500">Онлайн · Горняк-1 и Горняк-2</span>
                    </div>
                  </div>
                </div>

                {/* Chat messages */}
                <div className="p-5 flex flex-col gap-3" style={{ minHeight: "260px" }}>
                  {CHAT_MESSAGES.map((msg, i) => (
                    <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.from === "bot" && (
                        <div className="w-7 h-7 rounded-lg mr-2 flex-shrink-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #00C9A7, #00A589)", marginTop: "2px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          </svg>
                        </div>
                      )}
                      <div
                        className="px-4 py-2.5 rounded-2xl text-sm max-w-xs"
                        style={{
                          fontWeight: 500,
                          lineHeight: 1.5,
                          background: msg.from === "user" ? "linear-gradient(135deg, #00C9A7, #00A589)" : "#F1F5F9",
                          color: msg.from === "user" ? "#fff" : "#1E293B",
                          borderRadius: msg.from === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat input */}
                <div className="px-4 pb-4">
                  <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 border" style={{ borderColor: "#E2E8F0", background: "#F8FAFC" }}>
                    <span className="text-sm text-slate-400 flex-1" style={{ fontWeight: 500 }}>Напишите вопрос или выберите услугу...</span>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #00C9A7, #00A589)" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* floating badge */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl px-4 py-2.5 flex items-center gap-2 border border-slate-100">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#E6FBF7" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C9A7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-slate-800" style={{ fontWeight: 700 }}>Заявка #2847</div>
                  <div className="text-xs text-slate-500">Мастер придёт завтра</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-16 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl lg:text-4xl text-white mb-1" style={{ fontWeight: 900, color: "#00C9A7" }}>{s.value}</div>
                <div className="text-sm text-slate-400" style={{ fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <div className="tag mb-4" style={{ color: "#00C9A7" }}>Возможности</div>
            <h2 className="text-4xl lg:text-5xl text-slate-900 mb-4" style={{ fontWeight: 900, letterSpacing: "-0.025em" }}>
              Все услуги<br />в одном месте
            </h2>
            <p className="text-slate-500 text-lg max-w-md" style={{ fontWeight: 400 }}>
              DormWise покрывает весь спектр потребностей жителей Горняка — от мелкого ремонта до экстренных уведомлений.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((s, i) => (
              <div
                key={i}
                className="card-hover rounded-2xl p-6 border border-slate-100 cursor-pointer"
                style={{ background: activeService === i ? s.bg : "#FAFBFC" }}
                onClick={() => setActiveService(activeService === i ? null : i)}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: s.bg, color: s.color }}
                >
                  {s.icon}
                </div>
                <h3 className="text-base text-slate-900 mb-2" style={{ fontWeight: 700 }}>{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed" style={{ fontWeight: 400 }}>{s.description}</p>
                <div className="mt-4 flex items-center gap-1" style={{ color: s.color }}>
                  <span className="text-xs font-700" style={{ fontWeight: 700 }}>Подать заявку</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 px-6" style={{ background: "#F4F6FB" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="tag mb-4" style={{ color: "#00C9A7" }}>Как работает</div>
              <h2 className="text-4xl lg:text-5xl text-slate-900 mb-6" style={{ fontWeight: 900, letterSpacing: "-0.025em" }}>
                Три шага до решения
              </h2>
              <p className="text-slate-500 text-lg mb-10" style={{ fontWeight: 400 }}>
                Никаких очередей, бумаг и звонков. Просто напишите DormWise — и всё остальное сделает ИИ.
              </p>

              <div className="flex flex-col gap-6">
                {STEPS.map((step, i) => (
                  <div key={i} className="flex gap-5 items-start">
                    <div
                      className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-white"
                      style={{ background: "linear-gradient(135deg, #0D1B35, #162040)", fontWeight: 800, fontSize: "13px" }}
                    >
                      {step.num}
                    </div>
                    <div>
                      <div className="text-slate-900 mb-1" style={{ fontWeight: 700 }}>{step.title}</div>
                      <div className="text-sm text-slate-500 leading-relaxed" style={{ fontWeight: 400 }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "⚡", title: "Мгновенно", desc: "Ответ ИИ за секунды, без ожидания" },
                { icon: "🔔", title: "Push-уведомления", desc: "Статус заявки прямо в чате" },
                { icon: "📍", title: "Горняк-1 и 2", desc: "Для обоих корпусов" },
                { icon: "🔒", title: "Безопасно", desc: "Ваши данные защищены" },
              ].map((f, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 card-hover">
                  <div className="text-3xl mb-3">{f.icon}</div>
                  <div className="text-sm text-slate-900 mb-1" style={{ fontWeight: 700 }}>{f.title}</div>
                  <div className="text-xs text-slate-500" style={{ fontWeight: 400 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DORMITORIES */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="tag mb-4 text-center" style={{ color: "#00C9A7" }}>Общежития</div>
          <h2 className="text-4xl text-slate-900 mb-12 text-center" style={{ fontWeight: 900, letterSpacing: "-0.02em" }}>
            МИСИС · Горняк
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: "Горняк-1",
                address: "г. Москва, Ленинский просп., 4к2",
                rooms: "800+ мест",
                img: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=700&h=400&fit=crop&auto=format",
                floors: "9 этажей",
              },
              {
                name: "Горняк-2",
                address: "г. Москва, Ленинский просп., 6",
                rooms: "700+ мест",
                img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=700&h=400&fit=crop&auto=format",
                floors: "12 этажей",
              },
            ].map((d, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-slate-100 card-hover">
                <div className="relative h-48 bg-slate-200">
                  <img src={d.img} alt={d.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(13,27,53,0.6), transparent)" }} />
                  <div className="absolute bottom-4 left-5">
                    <div className="text-2xl text-white" style={{ fontWeight: 800 }}>{d.name}</div>
                  </div>
                </div>
                <div className="p-5 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-500 mb-0.5" style={{ fontWeight: 500 }}>{d.address}</div>
                    <div className="flex gap-3 mt-2">
                      <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: "#E6FBF7", color: "#00A589", fontWeight: 700 }}>{d.rooms}</span>
                      <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: "#EEF2FF", color: "#6366F1", fontWeight: 700 }}>{d.floors}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => scrollTo("chat-demo")}
                    className="text-xs px-4 py-2 rounded-lg text-white font-700 transition-opacity hover:opacity-90"
                    style={{ background: "#0D1B35", fontWeight: 700 }}
                  >
                    Открыть чат
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE CHAT */}
      <section id="chat-demo" className="py-24 px-6 gradient-hero">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="pt-4">
              <div className="tag mb-4" style={{ color: "#00C9A7" }}>Попробуйте сейчас</div>
              <h2 className="text-4xl lg:text-5xl text-white mb-6" style={{ fontWeight: 900, letterSpacing: "-0.025em" }}>
                Напишите DormWise прямо сейчас
              </h2>
              <p className="text-slate-300 text-lg mb-10" style={{ fontWeight: 400 }}>
                Спросите о любой услуге, подайте заявку или задайте вопрос — ИИ ответит мгновенно на русском языке.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  "Починить кровать",
                  "Заказать уборку",
                  "Дезинсекция",
                  "Когда горячая вода?",
                  "Сообщить о поломке",
                  "Мероприятия недели",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => setChatInput(q)}
                    className="text-left text-xs px-3 py-2.5 rounded-xl border transition-all hover:bg-white/10"
                    style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.75)", fontWeight: 600 }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive chat */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "#FFFFFF", boxShadow: "0 40px 80px rgba(0,0,0,0.4)" }}>
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #00C9A7, #00A589)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-slate-800" style={{ fontWeight: 700 }}>DormWise</div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#22C55E" }} />
                    <span className="text-xs text-slate-500">Онлайн · МИСИС Горняк</span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
              </div>

              {/* Messages */}
              <div className="p-5 flex flex-col gap-3 overflow-y-auto" style={{ minHeight: "320px", maxHeight: "400px" }}>
                {messages.map((msg, i) => (
                  <div key={i} className={`chat-bubble flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.from === "bot" && (
                      <div className="w-7 h-7 rounded-lg mr-2 flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background: "linear-gradient(135deg, #00C9A7, #00A589)" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                      </div>
                    )}
                    <div
                      className="px-4 py-2.5 text-sm max-w-xs"
                      style={{
                        fontWeight: 500,
                        lineHeight: 1.55,
                        background: msg.from === "user" ? "linear-gradient(135deg, #00C9A7, #00A589)" : "#F1F5F9",
                        color: msg.from === "user" ? "#fff" : "#1E293B",
                        borderRadius: msg.from === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="px-4 pb-4 border-t pt-3" style={{ borderColor: "#E2E8F0" }}>
                <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 border" style={{ borderColor: "#E2E8F0", background: "#F8FAFC" }}>
                  <input
                    className="flex-1 text-sm text-slate-700 bg-transparent outline-none placeholder-slate-400"
                    placeholder="Напишите сообщение..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500 }}
                  />
                  <button
                    onClick={sendMessage}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-80"
                    style={{ background: "linear-gradient(135deg, #00C9A7, #00A589)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </div>
                <div className="text-center mt-2 text-xs text-slate-400" style={{ fontWeight: 500 }}>
                  Нажмите Enter для отправки
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NOTIFICATIONS PREVIEW */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="tag mb-4 text-center" style={{ color: "#00C9A7" }}>Уведомления</div>
          <h2 className="text-4xl text-slate-900 mb-4 text-center" style={{ fontWeight: 900, letterSpacing: "-0.02em" }}>
            Всегда в курсе событий
          </h2>
          <p className="text-center text-slate-500 mb-12 text-lg" style={{ fontWeight: 400 }}>
            Важные уведомления от администрации прямо в чате
          </p>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                type: "Плановые работы",
                time: "Сегодня, 10:00",
                text: "Горняк-2, этажи 3-5: отключение горячей воды с 10:00 до 14:00 в связи с плановой заменой труб.",
                icon: "🔧",
                color: "#F59E0B",
                bg: "#FEF9EE",
              },
              {
                type: "Мероприятие",
                time: "15 сен, 18:00",
                text: "Приглашаем на студенческий фестиваль «Горняк Фест» в холле общежития Горняк-1. Вход свободный!",
                icon: "🎉",
                color: "#6366F1",
                bg: "#EEF2FF",
              },
              {
                type: "Важное",
                time: "14 сен, 09:00",
                text: "Напоминаем: до 20 сентября необходимо сдать копию паспорта и студенческого билета в комендатуру.",
                icon: "📋",
                color: "#EF4444",
                bg: "#FEF2F2",
              },
            ].map((n, i) => (
              <div key={i} className="rounded-2xl p-5 border border-slate-100 card-hover">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: n.bg }}>
                    {n.icon}
                  </div>
                  <div>
                    <div className="text-xs mb-0.5" style={{ fontWeight: 700, color: n.color }}>{n.type}</div>
                    <div className="text-xs text-slate-400" style={{ fontWeight: 500 }}>{n.time}</div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed" style={{ fontWeight: 400 }}>{n.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="gradient-hero py-14 px-6 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <span className="text-lg text-white" style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
                  dorn<span style={{ color: "#00C9A7" }}>wise</span>
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed" style={{ fontWeight: 400 }}>
                ИИ-помощник для студентов МИСИС в общежитиях Горняк-1 и Горняк-2.
              </p>
            </div>

            <div>
              <div className="text-white mb-4 text-sm" style={{ fontWeight: 700 }}>Услуги</div>
              <div className="flex flex-col gap-2">
                {["Ремонт мебели и техники", "Клининг", "Дезинсекция", "Уведомления", "Ответы на вопросы"].map((s) => (
                  <span key={s} className="text-sm text-slate-400 cursor-pointer hover:text-white transition-colors" style={{ fontWeight: 400 }}>{s}</span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-white mb-4 text-sm" style={{ fontWeight: 700 }}>Корпуса</div>
              <div className="flex flex-col gap-3">
                <div>
                  <div className="text-sm text-white" style={{ fontWeight: 600 }}>Горняк-1</div>
                  <div className="text-xs text-slate-400" style={{ fontWeight: 400 }}>Ленинский просп., 4к2</div>
                </div>
                <div>
                  <div className="text-sm text-white" style={{ fontWeight: 600 }}>Горняк-2</div>
                  <div className="text-xs text-slate-400" style={{ fontWeight: 400 }}>Ленинский просп., 6</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="text-xs text-slate-500" style={{ fontWeight: 500 }}>
              © 2024 DormWise · МИСИС Горняк
            </div>
            <div className="text-xs text-slate-500" style={{ fontWeight: 500 }}>
              Сделано для студентов с заботой ❤️
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
