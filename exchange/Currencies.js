import redis from '../db/redis';
import ApiClient from './ApiClient';

const redisKey = `api-currencies`;
const BASE_URL = 'http://api.fixer.io/latest?base=USD';
const apiClient = new ApiClient({ baseUrl: BASE_URL });

const getCurrencies = async () => {
  const response = await apiClient.get('')
  return response.rates;
}

export const updateCurrencies = async () => {
  const currencies = await getCurrencies()
  await redis.setAsync(redisKey, JSON.stringify(currencies))
}

export const getCurrencyRate = async (currency = "USD") => {
  const redisData = await redis.getAsync(redisKey);
  let currencies = JSON.parse(redisData);

  if (!currencies) {
    currencies = await getCurrencies()
    await redis.setAsync(redisKey, JSON.stringify(currencies))
  }

  return currencies[currency] || 1;
}
