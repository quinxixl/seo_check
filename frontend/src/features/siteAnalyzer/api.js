import { checkSiteAvailability } from './utils.js';
import { analyzeWithGpt } from '../../services/gptAnalysis.js';

export async function analyzeUrl(url, plan = 'free') {
  // Проверка доступности URL, опционально можно оставить
  const availability = await checkSiteAvailability(url);
  if (!availability.available) {
    throw new Error(availability.error || 'Сайт недоступен или не существует.');
  }

  // GPT-ONLY анализ
  return await analyzeWithGpt(url, plan);
}
