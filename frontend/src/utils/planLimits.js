// Конфигурация ограничений и возможностей для каждого тарифа

export const PLAN_LIMITS = {
  free: {
    name: 'Start',
    maxAnalysesPerDay: 1, // один анализ в 24ч
    maxHistoryItems: 3,
    maxSites: 1, // один сайт в сутках
    detailedMetrics: false,
    exportEnabled: false,
    pdfExport: false,
    comparisonEnabled: false,
    apiAccess: false,
  },
  pro: {
    name: 'Про',
    maxAnalysesPerDay: Infinity,
    maxHistoryItems: 50,
    maxSites: 10,
    detailedMetrics: true,
    exportEnabled: true,
    pdfExport: true,
    comparisonEnabled: true,
    apiAccess: false,
  },
  business: {
    name: 'Бизнес',
    maxAnalysesPerDay: Infinity,
    maxHistoryItems: Infinity,
    maxSites: 100,
    detailedMetrics: true,
    exportEnabled: true,
    pdfExport: true,
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

function getDomainFromUrl(url) {
  try {
    const { hostname } = new URL(url);
    return hostname?.replace(/^www\./, '') || '';
  } catch {
    return '';
  }
}

export function canAddSite(planId, history, url) {
  const limits = getPlanLimits(planId);
  if (!limits.maxSites || limits.maxSites === Infinity) {
    return true;
  }

  const domain = getDomainFromUrl(url);
  if (!domain) return false;

  const uniqueDomains = new Set(
    (history || []).map(item => getDomainFromUrl(item.url)).filter(Boolean)
  );

  // если домен уже есть — разрешаем, иначе проверяем лимит
  if (uniqueDomains.has(domain)) return true;

  return uniqueDomains.size < limits.maxSites;
}

