import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import "./ReportCard.scss";
import { getPlanLimits } from "../../utils/planLimits.js";

const getScoreColor = (score) => {
  if (score >= 80) return "good";
  if (score >= 60) return "medium";
  return "bad";
};

const getScoreLabel = (score) => {
  if (score >= 80) return "Отлично";
  if (score >= 60) return "Хорошо";
  if (score >= 40) return "Удовлетворительно";
  return "Требует внимания";
};

const exportReport = (report, format = 'json') => {
  const data = {
    url: report.url,
    timestamp: report.timestamp,
    performance: report.performance,
    seo: report.seo,
    security: report.security,
  };

  if (format === 'json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${report.url.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } else if (format === 'csv') {
    const csv = [
      ['Параметр', 'Значение'],
      ['URL', report.url],
      ['Дата анализа', new Date(report.timestamp).toLocaleString('ru-RU')],
      ['Производительность', report.performance?.score || 0],
      ['SEO', report.seo?.score || 0],
      ['Проблемы SEO', report.seo?.issues || 0],
      ['Заголовки безопасности', report.security?.headers?.join(', ') || 'Нет'],
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${report.url.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
};

const ReportCard = ({ report }) => {
  const currentPlan = useSelector(state => state.payments.plan);
  const planLimits = getPlanLimits(currentPlan);
  
  if (!report) return null;

  const perfScore = report.performance?.score || 0;
  const seoScore = report.seo?.score || 0;
  const showDetailedMetrics = planLimits.detailedMetrics;

  return (
    <div className="report-card" aria-live="polite">
      <div className="report-card__header">
        <div>
          <h2>Результаты анализа</h2>
          <div className="report-card__url">{report.url}</div>
        </div>
        {planLimits.exportEnabled && (
          <div className="report-card__actions">
            <button 
              className="report-export-btn"
              onClick={() => exportReport(report, 'json')}
              title="Экспорт в JSON"
            >
              📥 JSON
            </button>
            <button 
              className="report-export-btn"
              onClick={() => exportReport(report, 'csv')}
              title="Экспорт в CSV"
            >
              📥 CSV
            </button>
          </div>
        )}
      </div>

      <div className="report-section">
        <div className="report-section__header">
          <div className="report-section__title">
            <span className="report-icon">⚡</span>
            <span>Производительность</span>
          </div>
          <div className={`report-badge report-badge--${getScoreColor(perfScore)}`}>
            {getScoreLabel(perfScore)}
          </div>
        </div>
        <div className="report-progress">
          <div className="report-progress__bar">
            <div 
              className={`report-progress__fill report-progress__fill--${getScoreColor(perfScore)}`}
              style={{ width: `${perfScore}%` }}
            ></div>
          </div>
          <div className="report-progress__value">{perfScore} из 100</div>
        </div>
        <p className="report-description">
          {perfScore >= 80 
            ? "Ваш сайт загружается быстро и обеспечивает отличный пользовательский опыт."
            : perfScore >= 60
            ? "Производительность хорошая, но есть возможности для улучшения скорости загрузки."
            : "Рекомендуется оптимизировать скорость загрузки для улучшения пользовательского опыта."
          }
        </p>
        {showDetailedMetrics && report.performance?.metrics && (
          <div className="report-metrics">
            <div className="report-metric-item">
              <span className="report-metric-label">Время загрузки:</span>
              <span className="report-metric-value">{report.performance.metrics.loadTime} мс</span>
            </div>
            <div className="report-metric-item">
              <span className="report-metric-label">First Contentful Paint:</span>
              <span className="report-metric-value">{report.performance.metrics.firstContentfulPaint} мс</span>
            </div>
          </div>
        )}
        {!showDetailedMetrics && (
          <div className="report-upgrade-hint">
            <Link to="/pricing" className="report-upgrade-link">
              Обновите тариф для просмотра детальных метрик →
            </Link>
          </div>
        )}
      </div>

      <div className="report-section">
        <div className="report-section__header">
          <div className="report-section__title">
            <span className="report-icon">🔍</span>
            <span>Поисковая оптимизация (SEO)</span>
          </div>
          <div className={`report-badge report-badge--${getScoreColor(seoScore)}`}>
            {getScoreLabel(seoScore)}
          </div>
        </div>
        <div className="report-progress">
          <div className="report-progress__bar">
            <div 
              className={`report-progress__fill report-progress__fill--${getScoreColor(seoScore)}`}
              style={{ width: `${seoScore}%` }}
            ></div>
          </div>
          <div className="report-progress__value">{seoScore} из 100</div>
        </div>
        <p className="report-description">
          {seoScore >= 80
            ? "Ваш сайт хорошо оптимизирован для поисковых систем."
            : seoScore >= 60
            ? "SEO на хорошем уровне, но есть что улучшить."
            : "Рекомендуется улучшить SEO-оптимизацию для лучшей видимости в поисковых системах."
          }
        </p>
        {report.seo?.issues && report.seo.issues > 0 && (
          <div className="report-issues">
            Найдено {report.seo.issues} {report.seo.issues === 1 ? 'проблема' : report.seo.issues < 5 ? 'проблемы' : 'проблем'}
          </div>
        )}
      </div>

      <div className="report-section">
        <div className="report-section__header">
          <div className="report-section__title">
            <span className="report-icon">🔒</span>
            <span>Безопасность</span>
          </div>
        </div>
        <div className="report-security">
          {report.security?.headers && report.security.headers.length > 0 ? (
            <>
              <p className="report-description">
                Ваш сайт использует следующие заголовки безопасности:
              </p>
              <ul className="report-list">
                {report.security.headers.map((h, i) => (
                  <li key={i} className="report-tag">
                    <span className="report-tag__icon">✓</span>
                    {h}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="report-description report-description--warning">
              ⚠️ Не обнаружены заголовки безопасности. Рекомендуется их добавить для защиты пользователей.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
