// Конфигурация ограничений и возможностей для каждого тарифа

export const PLAN_LIMITS = {
  free: {
    name: 'Бесплатно',
    maxAnalysesPerDay: 3,
    maxHistoryItems: 3,
    detailedMetrics: false,
    exportEnabled: false,
    comparisonEnabled: false,
    apiAccess: false,
  },
  pro: {
    name: 'Про',
    maxAnalysesPerDay: Infinity,
    maxHistoryItems: 50,
    detailedMetrics: true,
    exportEnabled: true,
    comparisonEnabled: true,
    apiAccess: false,
  },
  business: {
    name: 'Бизнес',
    maxAnalysesPerDay: Infinity,
    maxHistoryItems: Infinity,
    detailedMetrics: true,
    exportEnabled: true,
    comparisonEnabled: true,
    apiAccess: true,
  },
};

export function getPlanLimits(planId) {
  return PLAN_LIMITS[planId] || PLAN_LIMITS.free;
}

export function canPerformAnalysis(planId, analysesToday) {
  const limits = getPlanLimits(planId);
  return analysesToday < limits.maxAnalysesPerDay;
}

export function getRemainingAnalyses(planId, analysesToday) {
  const limits = getPlanLimits(planId);
  if (limits.maxAnalysesPerDay === Infinity) {
    return 'Неограниченно';
  }
  const remaining = limits.maxAnalysesPerDay - analysesToday;
  return Math.max(0, remaining);
}

