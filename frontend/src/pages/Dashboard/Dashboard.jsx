import React, { useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setPlan } from '../../features/payments/paymentSlice.js';
import { getPlanLimits, getRemainingAnalyses } from '../../utils/planLimits.js';
import "./Dashboard.scss";

const PLAN_DATA = [
  {
    id: 'free',
    name: "Start",
    price: "0₽",
    features: [
      "1 анализ в сутки",
      "Базовый SEO-аудит: meta, H1–H3, sitemap/robots",
      "Базовый тест скорости и HTTPS",
      "Оценка качества контента",
      "SEO-резюме без детальных рекомендаций"
    ],
  },
  {
    id: 'pro',
    name: "PRO",
    price: "500₽/мес",
    features: [
      "До 10 сайтов без лимита по частоте",
      "Полный SEO-аудит + рекомендации ИИ",
      "Core Web Vitals + инструкции по исправлению",
      "Расширенная безопасность: XSS, CSP, библиотеки",
      "UX-советы по конверсии",
      "История улучшений, экспорт в PDF",
      "Приоритетная поддержка"
    ],
  },
  {
    id: 'business',
    name: "Business",
    price: "2000₽/мес",
    features: [
      "До 100 сайтов, автоаудит еженедельно",
      "Технический SEO: краулинг до 10k страниц, дубли, каноникал",
      "Конкурентный анализ и сравнение с лидерами",
      "Мониторинг скорости и uptime",
      "Security Scan: SQLi, заголовки, cookies",
      "Приоритизация задач, White Label PDF",
      "Доступ для команды, приоритетная поддержка"
    ],
  },
];

const Dashboard = () => {
  const user = useSelector(state => state.auth.user);
  const allHistory = useSelector(state => state.siteAnalyzer.history);
  const currentPlan = useSelector(state => state.payments.plan);
  const unlockedPlans = useSelector(state => state.payments.unlockedPlans || ['free']);
  const analysesToday = useSelector(state => state.payments.analysesToday);
  const planLimits = getPlanLimits(currentPlan);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPlanSelection, setShowPlanSelection] = useState(false);

  // Ограничиваем историю в зависимости от тарифа
  const history = planLimits.maxHistoryItems === Infinity 
    ? allHistory 
    : allHistory.slice(0, planLimits.maxHistoryItems);
  
  const remainingAnalyses = user ? getRemainingAnalyses(currentPlan, analysesToday) : 'Неограниченно';

  const handlePlanChange = (planId) => {
    // Любой уже купленный тариф (включая бесплатный) можно просто сделать текущим
    if (unlockedPlans.includes(planId)) {
      dispatch(setPlan(planId));
      setShowPlanSelection(false);
      return;
    }

    // Остальные тарифы требуют оплаты
    navigate(`/payment?plan=${planId}`);
  };

  return (
    <div className="container dashboard-page">
      <h2>Личный кабинет</h2>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <p className="dashboard-welcome">
              Добро пожаловать{user?.name ? ", " + user.name : ""}!
            </p>
            <div className="dashboard-plan">
              <span className="dashboard-plan__label">Текущий тариф:</span>
              <span className="dashboard-plan__name">
                {PLAN_DATA.find(p => p.id === currentPlan)?.name || 'Бесплатно'}
              </span>
            </div>
            {currentPlan === 'free' && user && (
              <div className="dashboard-plan-limit">
                <span className="dashboard-plan-limit__text">
                  Анализов сегодня: {analysesToday} / {planLimits.maxAnalysesPerDay}
                </span>
                <span className="dashboard-plan-limit__remaining">
                  Осталось: {remainingAnalyses}
                </span>
              </div>
            )}
          </div>
          <button 
            className="dashboard-plan-btn"
            onClick={() => setShowPlanSelection(!showPlanSelection)}
          >
            {showPlanSelection ? "Отменить" : "Изменить тариф"}
          </button>
        </div>

        {showPlanSelection && (
          <div className="dashboard-plans">
            <h3>Выберите тариф</h3>
            <div className="dashboard-plans-grid">
              {PLAN_DATA.map(plan => (
                <div 
                  key={plan.id} 
                  className={`dashboard-plan-card ${currentPlan === plan.id ? 'dashboard-plan-card--active' : ''}`}
                >
                  <div className="dashboard-plan-card__header">
                    <div className="dashboard-plan-card__name">{plan.name}</div>
                    <div className="dashboard-plan-card__price">{plan.price}</div>
                  </div>
                  <ul className="dashboard-plan-card__features">
                    {plan.features.map((f, i) => (
                      <li key={i} className="dashboard-plan-card__feature">
                        <span className="dashboard-plan-card__check">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`dashboard-plan-card__btn ${currentPlan === plan.id ? 'dashboard-plan-card__btn--active' : ''}`}
                    onClick={() => handlePlanChange(plan.id)}
                    disabled={currentPlan === plan.id}
                  >
                    {currentPlan === plan.id
                      ? 'Активен'
                      : unlockedPlans.includes(plan.id)
                        ? 'Сделать текущим'
                        : 'Оформить оплату'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {history.length > 0 ? (
          <div className="dashboard-history">
            <div className="dashboard-history__header">
              <h3>История анализов</h3>
              {planLimits.maxHistoryItems !== Infinity && allHistory.length > planLimits.maxHistoryItems && (
                <div className="dashboard-history__limit">
                  Показано {history.length} из {allHistory.length} анализов
                  {currentPlan === 'free' && (
                    <Link to="/payment?plan=pro" className="dashboard-history__upgrade">
                      Обновить тариф →
                    </Link>
                  )}
                </div>
              )}
            </div>
            <div className="history-list">
              {history.map((report, index) => (
                <div key={index} className="history-item">
                  <div className="history-item__header">
                    <Link to="/" className="history-item__url">{report.url}</Link>
                    <span className="history-item__date">
                      {report.timestamp 
                        ? new Date(report.timestamp).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : new Date().toLocaleDateString('ru-RU')
                      }
                    </span>
                  </div>
                  <div className="history-item__scores">
                    <div className="score-item">
                      <span className="score-label">Производительность:</span>
                      <span className="score-value">{report.performance.score}/100</span>
                    </div>
                    <div className="score-item">
                      <span className="score-label">SEO:</span>
                      <span className="score-value">{report.seo.score}/100</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="dashboard-empty">
            <p>У вас пока нет сохранённых анализов.</p>
            <Link to="/" className="dashboard-link">
              Провести анализ →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
