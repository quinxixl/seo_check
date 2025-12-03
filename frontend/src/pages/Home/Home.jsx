import React from "react";
import "./Home.scss";
import { useDispatch, useSelector } from "react-redux";
import InputURLForm from "../../components/InputURLForm/InputURLForm.jsx";
import ReportCard from "../../components/ReportCard/ReportCard.jsx";
import { analyzeUrlThunk } from "../../features/siteAnalyzer/analyzerSlice.js";
import { canPerformAnalysis, getRemainingAnalyses } from "../../utils/planLimits.js";
import { incrementAnalysesCount } from "../../features/payments/paymentSlice.js";

const Home = () => {
  const dispatch = useDispatch();
  const { loading, report, error } = useSelector(state => state.siteAnalyzer);
  const currentPlan = useSelector(state => state.payments.plan);
  const analysesToday = useSelector(state => state.payments.analysesToday);
  const user = useSelector(state => state.auth.user);

  const handleAnalyze = (url) => {
    // Проверяем лимиты тарифа только для зарегистрированных пользователей
    if (user) {
      if (!canPerformAnalysis(currentPlan, analysesToday)) {
        alert(`Достигнут дневной лимит анализов для бесплатного тарифа (3 анализа). Обновите тариф для неограниченного количества анализов.`);
        return;
      }
      dispatch(incrementAnalysesCount());
    }

    dispatch(analyzeUrlThunk(url));
  };

  const remaining = user ? getRemainingAnalyses(currentPlan, analysesToday) : 'Неограниченно';

  return (
    <div className="container home-page">
      <div className="home-page__content">
        <h1>Онлайн аудит сайта</h1>
        <p className="home-desc">Проверьте производительность, SEO и безопасность вашего сайта за секунды.</p>
        {user && currentPlan === 'free' && (
          <div className="home-limit-info">
            <span className="home-limit-info__text">
              Осталось анализов сегодня: <strong>{remaining}</strong>
            </span>
          </div>
        )}
        <InputURLForm onSubmit={handleAnalyze} loading={loading} error={error} />
        {report && <ReportCard report={report} />}
      </div>
    </div>
  );
};

export default Home;
