import { checkSiteAvailability, getDeterministicValue } from './utils.js';

// Кэш для хранения результатов анализа
const analysisCache = new Map();

export async function analyzeUrl(url) {
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
  
  // Проверяем кэш
  if (analysisCache.has(normalizedUrl)) {
    const cachedResult = analysisCache.get(normalizedUrl);
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
        
        // Генерируем стабильные оценки на основе хэша URL
        const performanceScore = getDeterministicValue(normalizedUrl + '_perf', 60, 100);
        const seoScore = getDeterministicValue(normalizedUrl + '_seo', 40, 95);
        const loadTime = getDeterministicValue(normalizedUrl + '_load', 500, 2500);
        const fcp = getDeterministicValue(normalizedUrl + '_fcp', 300, 1800);
        const seoIssues = getDeterministicValue(normalizedUrl + '_issues', 0, 8);
        
        // Детерминированно определяем заголовки безопасности
        const securityHeaders = [
          { name: 'HSTS', seed: normalizedUrl + '_hsts' },
          { name: 'X-Frame-Options', seed: normalizedUrl + '_xfo' },
          { name: 'X-Content-Type-Options', seed: normalizedUrl + '_xcto' },
          { name: 'Content-Security-Policy', seed: normalizedUrl + '_csp' }
        ]
        .filter(header => {
          const value = getDeterministicValue(header.seed, 0, 100);
          return value > 40; // 60% вероятность наличия заголовка
        })
        .map(header => header.name);

        const result = {
          url: normalizedUrl,
          timestamp: new Date().toISOString(),
          performance: { 
            score: performanceScore,
            metrics: {
              loadTime: loadTime,
              firstContentfulPaint: fcp,
            }
          },
          seo: { 
            score: seoScore,
            issues: seoIssues
          },
          security: { 
            headers: securityHeaders.length > 0 ? securityHeaders : ['Нет заголовков безопасности']
          }
        };

        // Сохраняем в кэш (без timestamp для стабильности)
        const cacheEntry = {
          ...result,
          timestamp: null, // Не кэшируем timestamp
        };
        analysisCache.set(normalizedUrl, cacheEntry);

        resolve(result);
      }, 1000); // Стабильная задержка 1 секунда
    } catch (error) {
      reject(new Error(error.message || 'Ошибка при проверке доступности сайта.'));
    }
  });
}
