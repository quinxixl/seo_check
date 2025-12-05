import { checkSiteAvailability, getDeterministicValue } from './utils.js';

// Кэш для хранения результатов анализа
const analysisCache = new Map();

export async function analyzeUrl(url, plan = 'free') {
  // Нормализуем URL для кэширования
  let normalizedUrl = url.trim().toLowerCase();
  
  // Убираем trailing slash
  normalizedUrl = normalizedUrl.replace(/\/$/, '');
  
  // Нормализуем протокол - всегда используем https если не указан http
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }
  
  // Приводим к единому виду протокола (предпочитаем https)
  normalizedUrl = normalizedUrl.replace(/^http:\/\//, 'https://');
  
  // Убираем www для единообразия (опционально, можно оставить)
  // normalizedUrl = normalizedUrl.replace(/^https?:\/\/www\./, 'https://');
  
  // Проверяем кэш: учитываем тариф, так как отчёты для разных тарифов отличаются
  const cacheKey = `${normalizedUrl}__${plan}`;
  if (analysisCache.has(cacheKey)) {
    const cachedResult = analysisCache.get(cacheKey);
    // Возвращаем кэшированный результат с обновленным timestamp
    return {
      ...cachedResult,
      timestamp: new Date().toISOString(),
    };
  }

  return new Promise(async (resolve, reject) => {
    try {
      // Проверяем доступность сайта
      const availability = await checkSiteAvailability(normalizedUrl);
      
      if (!availability.available) {
        reject(new Error(availability.error || 'Сайт недоступен или не существует.'));
        return;
      }

      // Небольшая задержка для показа процесса анализа
      await new Promise(resolve => setTimeout(resolve, 500));

      // Имитация задержки сети
      setTimeout(() => {
        // Используем детерминированную генерацию на основе URL
        // Это гарантирует стабильные результаты для одного и того же URL
        
        // Генерируем стабильные оценки на основе хэша URL и тарифа
        const perfMin = plan === 'free' ? 40 : plan === 'pro' ? 55 : 60;
        const perfMax = plan === 'free' ? 85 : plan === 'pro' ? 100 : 100;
        const seoMin = plan === 'free' ? 35 : plan === 'pro' ? 50 : 55;
        const seoMax = plan === 'free' ? 85 : plan === 'pro' ? 98 : 100;

        const performanceScore = getDeterministicValue(
          normalizedUrl + '_' + plan + '_perf',
          perfMin,
          perfMax
        );
        const seoScore = getDeterministicValue(
          normalizedUrl + '_' + plan + '_seo',
          seoMin,
          seoMax
        );

        // Чем выше тариф, тем точнее и детальнее метрики
        const loadTime = getDeterministicValue(
          normalizedUrl + '_' + plan + '_load',
          plan === 'free' ? 800 : plan === 'pro' ? 600 : 500,
          plan === 'free' ? 3000 : plan === 'pro' ? 2500 : 2200
        );
        const fcp = getDeterministicValue(
          normalizedUrl + '_' + plan + '_fcp',
          plan === 'free' ? 500 : plan === 'pro' ? 400 : 300,
          plan === 'free' ? 2200 : plan === 'pro' ? 1800 : 1500
        );

        // На платных тарифах показываем чуть более точную картину по проблемам
        const issuesMax = plan === 'free' ? 10 : plan === 'pro' ? 8 : 6;
        const seoIssues = getDeterministicValue(
          normalizedUrl + '_' + plan + '_issues',
          0,
          issuesMax
        );
        
        // Детерминированно определяем заголовки безопасности
        const securityHeaders = [
          { name: 'HSTS', seed: normalizedUrl + '_' + plan + '_hsts' },
          { name: 'X-Frame-Options', seed: normalizedUrl + '_' + plan + '_xfo' },
          { name: 'X-Content-Type-Options', seed: normalizedUrl + '_' + plan + '_xcto' },
          { name: 'Content-Security-Policy', seed: normalizedUrl + '_' + plan + '_csp' }
        ]
          .filter(header => {
            const threshold = plan === 'free' ? 60 : plan === 'pro' ? 45 : 35;
            const value = getDeterministicValue(header.seed, 0, 100);
            return value > threshold;
          })
          .map(header => header.name);

        // Контентное качество (упрощённо)
        const contentQualityScore = getDeterministicValue(
          normalizedUrl + '_' + plan + '_content',
          plan === 'free' ? 50 : plan === 'pro' ? 60 : 70,
          plan === 'free' ? 80 : plan === 'pro' ? 90 : 95
        );

        // Генерация рекомендаций под тариф
        const performanceRecommendations =
          plan === 'free'
            ? []
            : [
                "Оптимизируйте тяжёлые изображения (webp/avif, lazy-load).",
                "Вынесите неcritical JS в defer/async, уменьшите bundle.",
                "Включите кэширование статики и используйте HTTP/2/3."
              ];

        const seoRecommendations =
          plan === 'business'
            ? [
                "Проверьте дубли и каноникал для ключевых страниц.",
                "Улучшите внутреннюю перелинковку по продуктовым/категорийным страницам.",
                "Добавьте schema.org для товаров/организации/FAQ."
              ]
            : plan === 'pro'
            ? [
                "Сгенерируйте оптимизированные Title/Description для основных страниц.",
                "Убедитесь в единственном H1 и логике H2–H3.",
                "Добавьте понятные ЧПУ и корректный sitemap/robots."
              ]
            : [];

        const uxTips =
          plan === 'pro' || plan === 'business'
            ? [
                "Упростите первый экран: чёткий оффер + CTA.",
                "Уберите лишние поля из форм, сократите до 2–3 шагов.",
                "Добавьте социальное доказательство (отзывы, логотипы клиентов)."
              ]
            : [];

        // Business — дополнительные блоки
        const techSeo =
          plan === 'business'
            ? {
                crawlLimit: 10000,
                checks: ["Дубли", "Каноникал", "Редиректы", "Глубина вложенности"],
              }
            : null;

        const monitoring =
          plan === 'business'
            ? {
                uptime: true,
                speed: true,
                autoAuditWeekly: true,
              }
            : null;

        const competitiveAnalysis = plan === 'business';
        const whiteLabel = plan === 'business';
        const teamAccess = plan === 'business';
        const autoAudit = plan === 'business';

        const result = {
          url: normalizedUrl,
          timestamp: new Date().toISOString(),
          performance: { 
            score: performanceScore,
            metrics: {
              loadTime: loadTime,
              firstContentfulPaint: fcp,
            },
            recommendations: performanceRecommendations,
          },
          seo: { 
            score: seoScore,
            issues: seoIssues,
            recommendations: seoRecommendations,
          },
          security: { 
            headers: securityHeaders.length > 0 ? securityHeaders : ['Нет заголовков безопасности'],
            advanced: plan !== 'free',
          },
          content: {
            score: contentQualityScore,
            summary:
              plan === 'free'
                ? "Базовая оценка контента: проверьте читаемость, уникальность и релевантность ключевых запросов."
                : "Контент оценён, улучшите плотность ключей, структуру и семантическое покрытие.",
          },
          ux: {
            tips: uxTips,
          },
          techSeo,
          monitoring,
          competitiveAnalysis,
          whiteLabel,
          teamAccess,
          autoAudit,
          pdfExport: plan !== 'free',
        };

        // Сохраняем в кэш (без timestamp для стабильности)
        const cacheEntry = {
          ...result,
          timestamp: null, // Не кэшируем timestamp
        };
        analysisCache.set(cacheKey, cacheEntry);

        resolve(result);
      }, 1000); // Стабильная задержка 1 секунда
    } catch (error) {
      reject(new Error(error.message || 'Ошибка при проверке доступности сайта.'));
    }
  });
}
