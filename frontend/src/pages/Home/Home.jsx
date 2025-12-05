import React from "react";
import "./Home.scss";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import InputURLForm from "../../components/InputURLForm/InputURLForm.jsx";
import ReportCard from "../../components/ReportCard/ReportCard.jsx";
import { analyzeUrlThunk } from "../../features/siteAnalyzer/analyzerSlice.js";
import { canPerformAnalysis, getRemainingAnalyses, canAddSite } from "../../utils/planLimits.js";
import { incrementAnalysesCount } from "../../features/payments/paymentSlice.js";

const PLAN_DATA = [
  {
    id: 'free',
    name: "Start",
    price: "0₽",
    description: "Попробовать сервис и увидеть базовые проблемы сайта.",
    features: [
      "1 анализ в сутки",
      "Базовый SEO-аудит: meta, H1–H3, sitemap/robots",
      "Базовый тест скорости и HTTPS",
      "Оценка качества контента",
      "SEO-резюме без детальных рекомендаций",
    ],
  },
  {
    id: 'pro',
    name: "PRO",
    price: "500₽/мес",
    description: "Полная диагностика + рекомендации от ИИ, чтобы быстро расти в поиске.",
    features: [
      "До 10 сайтов, без лимита по частоте",
      "Полный SEO-аудит + рекомендации ИИ (title/description, структура)",
      "Продвинутый аудит скорости (Core Web Vitals, инструкции по исправлению)",
      "Расширенная безопасность: XSS, CSP, библиотеки",
      "UX-советы по конверсии",
      "История и динамика улучшений",
      "Экспорт отчётов в PDF",
    ],
    highlighted: true,
  },
  {
    id: 'business',
    name: "Business",
    price: "2000₽/мес",
    description: "Максимум мощности и автоматизации для агентств и команд.",
    features: [
      "До 100 сайтов, автоаудит раз в неделю",
      "Тех. SEO-аудит: краулинг до 10k страниц, дубли, каноникал",
      "Конкурентный анализ с лидерами ниши",
      "Мониторинг скорости и uptime",
      "Security Scan: SQLi, заголовки, cookies",
      "Приоритизация задач + White Label PDF",
      "Доступ для команды и приоритетная поддержка",
    ],
  },
];

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, report, error } = useSelector(state => state.siteAnalyzer);
  const history = useSelector(state => state.siteAnalyzer.history);
  const currentPlan = useSelector(state => state.payments.plan);
  const analysesToday = useSelector(state => state.payments.analysesToday);
  const user = useSelector(state => state.auth.user);

  const handleAnalyze = (url) => {
    // Проверяем лимиты тарифа только для зарегистрированных пользователей
    if (user) {
      if (!canPerformAnalysis(currentPlan, analysesToday)) {
        alert(`Достигнут лимит анализов для текущего тарифа. Обновите тариф, чтобы проводить больше проверок.`);
        return;
      }

      if (!canAddSite(currentPlan, history, url)) {
        alert(`Достигнут лимит сайтов для вашего тарифа. Обновите тариф, чтобы анализировать больше сайтов.`);
        return;
      }
      dispatch(incrementAnalysesCount());
    }

    dispatch(analyzeUrlThunk(url));
  };

  const remaining = user ? getRemainingAnalyses(currentPlan, analysesToday) : 'Неограниченно';

  const handleChoosePlan = (planId) => {
    if (!user) {
      // Если пользователь не авторизован — отправляем на логин,
      // после чего он сможет выбрать тариф в кабинете
      navigate("/login");
      return;
    }
    navigate(`/payment?plan=${planId}`);
  };

  return (
    <div className="container home-page">
      <div className="home-page__content">
        <div className="home-page__badge">AI SEO & Performance Audit</div>
        <h1>Поймите, что мешает вашему сайту расти</h1>
        <p className="home-desc">
          Умный аудит скорости, SEO и безопасности, который переводит «технический шум»
          в понятный список действий: что поправить, чтобы ускорить сайт и вырасти в поиске.
        </p>
        {user && currentPlan === 'free' && (
          <div className="home-limit-info">
            <span className="home-limit-info__text">
              Осталось анализов сегодня: <strong>{remaining}</strong>
            </span>
          </div>
        )}
        <InputURLForm onSubmit={handleAnalyze} loading={loading} error={error} />
        {report && <ReportCard report={report} />}

        <section className="home-example">
          <div className="home-example__grid">
            <div className="home-example__text">
              <h2>Как работает сервис</h2>
              <p>
                Введите адрес страницы — и за один запуск вы получаете взгляд сразу трёх экспертов:
                аналитика по скорости, SEO и базовой безопасности.
              </p>
              <ul className="home-example__list">
                <li>Измеряем ключевые метрики скорости (LCP, FCP, время полной загрузки).</li>
                <li>Проверяем заголовки, мета‑описания и структуру документа под требования поиска.</li>
                <li>Сканируем важные заголовки безопасности (HSTS, CSP и др.).</li>
              </ul>
              <div className="home-example__benefits">
                <h3>Почему этот аудит сильнее классических чек‑листов</h3>
                <ul>
                  <li>Не просто «ошибки», а приоритезированный список задач с влиянием на трафик.</li>
                  <li>Человеческие формулировки — без перегруза терминами и редкими метриками.</li>
                  <li>Фокус на действиях: что сделать в ближайший час, а что можно запланировать позже.</li>
                </ul>
              </div>
            </div>
            <div className="home-example__preview" aria-hidden="true">
              <div className="home-example__badge">Пример отчёта</div>
              <div className="home-example__preview-card">
                <div className="home-example__preview-row">
                  <span className="home-example__preview-label">Производительность</span>
                  <span className="home-example__preview-score home-example__preview-score--good">92 / 100</span>
                </div>
                <div className="home-example__preview-bar">
                  <div className="home-example__preview-fill home-example__preview-fill--good" />
                </div>
                <div className="home-example__preview-row">
                  <span className="home-example__preview-label">SEO</span>
                  <span className="home-example__preview-score home-example__preview-score--medium">78 / 100</span>
                </div>
                <div className="home-example__preview-bar">
                  <div className="home-example__preview-fill home-example__preview-fill--medium" />
                </div>
                <p className="home-example__preview-note">
                  Сервис сам подсвечивает быстрые победы — правки, которые быстрее всего дадут
                  прирост скорости и позиций.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="home-pricing">
          <h2>Тарифы для разного масштаба задач</h2>
          <p className="home-pricing__subtitle">
            Начните с бесплатного аудита, а когда команда и задачи вырастут — в один клик
            переключитесь на Про или Бизнес.
          </p>
          <div className="home-pricing__grid">
            {PLAN_DATA.map(plan => (
              <div
                key={plan.id}
                className={`home-pricing-card ${plan.highlighted ? "home-pricing-card--highlighted" : ""}`}
              >
                {plan.highlighted && (
                  <div className="home-pricing-card__label">
                    Самый популярный
                  </div>
                )}
                <div className="home-pricing-card__header">
                  <div className="home-pricing-card__name">{plan.name}</div>
                  <div className="home-pricing-card__price">{plan.price}</div>
                </div>
                <p className="home-pricing-card__description">{plan.description}</p>
                <ul className="home-pricing-card__features">
                  {plan.features.map(feature => (
                    <li key={feature} className="home-pricing-card__feature">
                      <span className="home-pricing-card__check">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.id === 'free' ? (
                  <button
                    type="button"
                    className="home-pricing-card__button"
                    onClick={() => navigate("/")}
                  >
                    Начать бесплатно
                  </button>
                ) : (
                  <button
                    type="button"
                    className="home-pricing-card__button"
                    onClick={() => handleChoosePlan(plan.id)}
                  >
                    Выбрать тариф
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
