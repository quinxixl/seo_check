// Остальные проверки и вспомогательные функции для доступности и валидации

// Проверка валидности URL
export function validateUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Генератор описан выше, оставляем только доступные функции:

// Проверка доступности сайта (тот же код)
export async function checkSiteAvailability(url) {
  try {
    let urlObj;
    try {
      urlObj = new URL(url);
    } catch {
      return { available: false, error: 'Некорректный URL адрес' };
    }
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { available: false, error: 'Поддерживаются только HTTP и HTTPS протоколы' };
    }
    if (!urlObj.hostname || urlObj.hostname.length === 0) {
      return { available: false, error: 'Отсутствует доменное имя в URL' };
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
        cache: 'no-cache',
      });
      clearTimeout(timeoutId);
      return { available: true, error: null };
    } catch (error) {
      clearTimeout(timeoutId);
      return { available: false, error: 'Сайт не отвечает или недоступен. Проверьте адрес.' };
    }
  } catch {
    return { available: false, error: 'Ошибка доступа к сайту' };
  }
}

// Остальные функции экспорта лимитов — не трогать.
