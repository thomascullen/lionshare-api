import Router     from 'koa-router';
import fetch      from 'isomorphic-fetch';

import Exchange from '../exchange/Exchange';
import { getCurrencyRate } from '../exchange/Currencies';
import redis from '../db/redis';

const router = new Router();
const exchange = new Exchange();

router.get('/', async (ctx) => {
  try {
    const redisData = await redis.getAsync('api-markets');
    let markets = JSON.parse(redisData);

    if (!markets) {
      markets = await exchange.getMarketData();
      await redis.setAsync('api-markets', JSON.stringify(markets));
    }

    const currency = ctx.query.currency;
    const currencyRate = await getCurrencyRate(currency);

    const marketCaps = {};
    for (let symbol in markets) {
      marketCaps[symbol] = (markets[symbol]['marketCap'] * currencyRate)
    }
    ctx.body = { data: marketCaps };
  } catch(e) {
    console.log('Market data API failed');
    console.log(e);
  }

});

export default router;
