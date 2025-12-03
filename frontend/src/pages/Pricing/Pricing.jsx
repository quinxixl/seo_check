import React from "react";
import "./Pricing.scss";

const PLAN_DATA = [
  {
    name: "Бесплатно",
    price: "0₽/мес",
    features: [
      "3 анализа в день",
      "Базовые отчёты",
      "История до 3 анализов",
      "Основные метрики"
    ],
  },
  {
    name: "Про",
    price: "499₽/мес",
    features: [
      "Неограниченное количество анализов",
      "Детальные метрики производительности",
      "История до 50 анализов",
      "Экспорт отчётов (JSON, CSV)",
      "Приоритетная поддержка"
    ],
  },
  {
    name: "Бизнес",
    price: "1990₽/мес",
    features: [
      "Всё из тарифа Про",
      "Неограниченная история",
      "Сравнение анализов",
      "API доступ",
      "VIP поддержка 24/7",
      "Персональный менеджер"
    ],
  },
];

const Pricing = () => (
  <div className="container pricing-page">
    <h2>Тарифы</h2>
    <div className="pricing-grid">
      {PLAN_DATA.map(plan => (
        <div key={plan.name} className="pricing-card">
          <div className="pricing-card__name">{plan.name}</div>
          <div className="pricing-card__price">{plan.price}</div>
          <ul className="pricing-card__features">
            {plan.features.map(f => (
              <li key={f} className="pricing-card__feature">{f}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

export default Pricing;
