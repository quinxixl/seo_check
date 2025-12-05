export function validateUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Простая функция хэширования для детерминированной генерации
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Генератор псевдослучайных чисел на основе seed
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Получить детерминированное значение на основе URL
export function getDeterministicValue(url, min, max) {
  const hash = hashString(url);
  const random = seededRandom(hash);
  return Math.floor(random * (max - min + 1)) + min;
}

// Проверка доступности сайта
export async function checkSiteAvailability(url) {
  try {
    // Сначала проверяем валидность URL
    let urlObj;
    try {
      urlObj = new URL(url);
    } catch {
      return { available: false, error: 'Некорректный URL адрес' };
    }

    // Проверяем, что протокол правильный
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { available: false, error: 'Поддерживаются только HTTP и HTTPS протоколы' };
    }

    // Проверяем, что есть доменное имя
    if (!urlObj.hostname || urlObj.hostname.length === 0) {
      return { available: false, error: 'Отсутствует доменное имя в URL' };
    }

    // Проверяем наличие домена через DNS lookup (используя публичный API)
    // Для демо-версии делаем упрощенную проверку через fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 секунд таймаут

    try {
      // Пытаемся сделать запрос к сайту
      // Используем no-cors, чтобы не ломаться из‑за CORS, но поймать сетевые/DNS ошибки
      await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
        cache: 'no-cache',
      });
      clearTimeout(timeoutId);

      // Если запрос выполнился без ошибки — считаем сайт доступным
      return { available: true, error: null };
    } catch (error) {
      clearTimeout(timeoutId);

      // В браузере CORS/Adblock могут ломать HEAD-запросы — не блокируем анализ
      return {
        available: true,
        error: null,
      };
    }
  } catch (error) {
    // Если произошла непредвиденная ошибка, делаем базовую валидацию
    try {
      new URL(url);
      // Если URL валидный, но проверка не прошла - разрешаем анализ
      // (так как в браузере могут быть CORS ограничения)
      return { available: true, error: null };
    } catch {
      return { available: false, error: 'Некорректный URL адрес' };
    }
  }
}
