const https = require('https');

const token = process.env.TINKOFF_TOKEN || 't.ff0AViTsDB1k9Ph2W255v5u09UE6HKKbnacYYaKOgnOADzsEo5bWpQJyNDjwO8FFlnV_EEILMcYBo_JZ7hgN-w';

function money(obj) {
  if (!obj) return 0;
  return Number(obj.units || 0) + Number(obj.nano || 0) / 1e9;
}

function tinkoffPost(endpoint, body = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const req = https.request({
      hostname: 'invest-public-api.tinkoff.ru',
      path: '/rest/tinkoff.public.invest.api.contract.v1.' + endpoint,
      method: 'POST',
      rejectUnauthorized: false,
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          resolve(null);
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

const META = {
  'DATA': { name: 'Группа Аренадата', sector: 'IT и технологии', industry: 'Корпоративное ПО и СУБД', divPayer: true, type: 'stock' },
  'NVTK': { name: 'НОВАТЭК', sector: 'Нефть и газ', industry: 'Добыча СПГ и природного газа', divPayer: true, type: 'stock' },
  'PLZL': { name: 'Полюс', sector: 'Металлургия и добыча', industry: 'Добыча золота', divPayer: true, type: 'stock' },
  'SNGS': { name: 'Сургутнефтегаз', sector: 'Нефть и газ', industry: 'Добыча нефти и газа', divPayer: true, type: 'stock' },
  'TRNFP': { name: 'Транснефть - прив.', sector: 'Нефть и газ', industry: 'Транспортировка нефти', divPayer: true, type: 'stock' },
  'T': { name: 'Т-Технологии', sector: 'Финансовый сектор', industry: 'Финтех и экосистема', divPayer: true, type: 'stock' },
  'TATN': { name: 'Татнефть', sector: 'Нефть и газ', industry: 'Нефтедобыча и нефтехимия', divPayer: true, type: 'stock' },
  'SIBN': { name: 'Газпром нефть', sector: 'Нефть и газ', industry: 'Нефтепереработка и добыча', divPayer: true, type: 'stock' },
  'SNGSP': { name: 'Сургутнефтегаз - прив.', sector: 'Нефть и газ', industry: 'Добыча нефти / валютная кубышка', divPayer: true, type: 'stock' },
  'OZPH': { name: 'Озон Фармацевтика', sector: 'Здравоохранение', industry: 'Фармацевтика и дженерики', divPayer: true, type: 'stock' },
  'AQUA': { name: 'ИНАРКТИКА', sector: 'Потребительский сектор', industry: 'Аквакультура (лосось/форель)', divPayer: true, type: 'stock' },
  'SBER': { name: 'Сбербанк', sector: 'Финансовый сектор', industry: 'Банки и экосистемы', divPayer: true, type: 'stock' },
  'TATNP': { name: 'Татнефть - прив.', sector: 'Нефть и газ', industry: 'Нефтедобыча и нефтехимия', divPayer: true, type: 'stock' },
  'ROSN': { name: 'Роснефть', sector: 'Нефть и газ', industry: 'Интегрированная нефтегазовая компания', divPayer: true, type: 'stock' },
  'LKOH': { name: 'ЛУКОЙЛ', sector: 'Нефть и газ', industry: 'Интегрированная нефтегазовая компания', divPayer: true, type: 'stock' },
  'AFLT': { name: 'Аэрофлот', sector: 'Транспорт', industry: 'Авиаперевозки', divPayer: false, type: 'stock' },
  'SVCB': { name: 'Совкомбанк', sector: 'Финансовый сектор', industry: 'Банковские услуги и страхование', divPayer: true, type: 'stock' },
  'SBERP': { name: 'Сбербанк - прив.', sector: 'Финансовый сектор', industry: 'Банки и экосистемы', divPayer: true, type: 'stock' },
  'HNFG': { name: 'Хэндерсон', sector: 'Потребительский сектор', industry: 'Ритейл мужской одежды', divPayer: true, type: 'stock' },
  'VTBR': { name: 'Банк ВТБ', sector: 'Финансовый сектор', industry: 'Банковский сектор', divPayer: false, type: 'stock' },
  'NMTP': { name: 'НМТП', sector: 'Транспорт', industry: 'Морские порты и стивидоры', divPayer: true, type: 'stock' },
  'MTSS': { name: 'МТС', sector: 'Телекоммуникации', industry: 'Телеком и цифровая экосистема', divPayer: true, type: 'stock' },
  'RU000A10DS74': { name: 'Сбербанк 001Р-SBER51', sector: 'Финансовый сектор', industry: 'Облигации', divPayer: true, type: 'bond' },
  'RU000A10BGJ4': { name: 'Аэрофлот П02-БО-01', sector: 'Транспорт', industry: 'Облигации', divPayer: true, type: 'bond' }
};

async function syncTinkoff() {
  const accountsRes = await tinkoffPost('UsersService/GetAccounts');
  if (!accountsRes || !accountsRes.accounts) {
    throw new Error('Не удалось получить список счетов от Т-Инвестиций');
  }

  const keyMap = {
    'G ACC': 'G_ACC',
    'S ACC': 'S_ACC',
    '26 тысяч': 'ACC_26K'
  };

  const accounts = [];
  for (const a of accountsRes.accounts) {
    const portRes = await tinkoffPost('OperationsService/GetPortfolio', { accountId: a.id });
    if (!portRes) continue;

    const accountKey = keyMap[a.name] || a.name;
    const positions = [];

    let totalStockValue = 0;
    let totalStockCost = 0;
    let totalCurrencyValue = 0;

    for (const pos of (portRes.positions || [])) {
      if (pos.ticker === 'RUB000UTSTOM') continue;
      if (pos.ticker === 'CNYRUB_TOM_CETS') {
        const qty = money(pos.quantity);
        const curPrice = money(pos.currentPrice);
        totalCurrencyValue += qty * curPrice;
        continue;
      }

      const qty = money(pos.quantity);
      const buyPrice = money(pos.averagePositionPrice);
      const currentPrice = money(pos.currentPrice);
      const totalValue = qty * currentPrice;
      const totalCost = qty * buyPrice;
      const plRub = totalValue - totalCost;
      const plPercent = totalCost > 0 ? (plRub / totalCost) * 100 : 0;

      totalStockValue += totalValue;
      totalStockCost += totalCost;

      const m = META[pos.ticker] || { name: pos.ticker, sector: 'Другое', industry: '', divPayer: false, type: 'stock' };

      positions.push({
        accountKey: accountKey,
        accountTitle: a.name,
        ticker: pos.ticker,
        name: m.name,
        type: m.type,
        sector: m.sector,
        industry: m.industry,
        divPayer: m.divPayer,
        quantity: qty,
        buyPrice: Math.round(buyPrice * 100) / 100,
        currentPrice: Math.round(currentPrice * 100) / 100,
        totalValue: Math.round(totalValue * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        plRub: Math.round(plRub * 100) / 100,
        plPercent: Math.round(plPercent * 100) / 100
      });
    }

    const debtRub = -5000;
    const totalAssetValue = totalStockValue + totalCurrencyValue;
    const netAccountBalance = totalAssetValue + debtRub;
    const totalPlRub = totalStockValue - totalStockCost;
    const totalPlPercent = totalStockCost > 0 ? (totalPlRub / totalStockCost) * 100 : 0;

    accounts.push({
      accountKey,
      accountTitle: a.name,
      totalAssetValue: Math.round(totalAssetValue * 100) / 100,
      totalStockValue: Math.round(totalStockValue * 100) / 100,
      totalCurrencyValue: Math.round(totalCurrencyValue * 100) / 100,
      debtRub,
      netAccountBalance: Math.round(netAccountBalance * 100) / 100,
      totalStockCost: Math.round(totalStockCost * 100) / 100,
      totalPlRub: Math.round(totalPlRub * 100) / 100,
      totalPlPercent: Math.round(totalPlPercent * 100) / 100,
      positions
    });
  }

  // Grand totals
  let grandTotalAssetValue = 0;
  let grandTotalCost = 0;
  let grandTotalNetBalance = 0;
  accounts.forEach(a => {
    grandTotalAssetValue += a.totalAssetValue;
    grandTotalCost += a.totalStockCost;
    grandTotalNetBalance += a.netAccountBalance;
  });
  const grandTotalPlRub = grandTotalAssetValue - grandTotalCost;
  const grandTotalPlPercent = grandTotalCost > 0 ? (grandTotalPlRub / grandTotalCost) * 100 : 0;

  // Consolidated stocks
  const stockMap = {};
  accounts.forEach(acc => {
    acc.positions.forEach(p => {
      if (!stockMap[p.ticker]) {
        stockMap[p.ticker] = {
          ticker: p.ticker,
          name: p.name,
          type: p.type,
          sector: p.sector,
          industry: p.industry,
          divPayer: p.divPayer,
          totalQuantity: 0,
          totalCost: 0,
          totalValue: 0,
          currentPrice: p.currentPrice,
          accounts: []
        };
      }
      stockMap[p.ticker].totalQuantity += p.quantity;
      stockMap[p.ticker].totalCost += p.totalCost;
      stockMap[p.ticker].totalValue += p.totalValue;
      stockMap[p.ticker].accounts.push({
        accountKey: acc.accountKey,
        accountTitle: acc.accountTitle,
        quantity: p.quantity,
        buyPrice: p.buyPrice,
        currentPrice: p.currentPrice,
        totalValue: p.totalValue,
        plRub: p.plRub,
        plPercent: p.plPercent
      });
    });
  });

  const consolidatedStocks = Object.values(stockMap).map(s => {
    const weightedBuyPrice = s.totalQuantity > 0 ? s.totalCost / s.totalQuantity : s.currentPrice;
    const plRub = s.totalValue - s.totalCost;
    const plPercent = s.totalCost > 0 ? (plRub / s.totalCost) * 100 : 0;
    const sharePercent = grandTotalAssetValue > 0 ? (s.totalValue / grandTotalAssetValue) * 100 : 0;
    return {
      ...s,
      weightedBuyPrice: Math.round(weightedBuyPrice * 100) / 100,
      totalCost: Math.round(s.totalCost * 100) / 100,
      totalValue: Math.round(s.totalValue * 100) / 100,
      plRub: Math.round(plRub * 100) / 100,
      plPercent: Math.round(plPercent * 100) / 100,
      sharePercent: Math.round(sharePercent * 100) / 100,
      isSimulated: false
    };
  }).sort((a, b) => b.totalValue - a.totalValue);

  // Sector breakdown
  const secMap = {};
  consolidatedStocks.forEach(s => {
    if (!secMap[s.sector]) {
      secMap[s.sector] = { sector: s.sector, totalValue: 0, count: 0, tickers: [] };
    }
    secMap[s.sector].totalValue += s.totalValue;
    secMap[s.sector].count += 1;
    secMap[s.sector].tickers.push(s.ticker);
  });
  const sectorBreakdown = Object.values(secMap).map(sec => ({
    ...sec,
    totalValue: Math.round(sec.totalValue * 100) / 100,
    sharePercent: grandTotalAssetValue > 0 ? Math.round((sec.totalValue / grandTotalAssetValue) * 10000) / 100 : 0
  })).sort((a, b) => b.totalValue - a.totalValue);

  // Cross account duplicates
  const crossAccountDuplicates = consolidatedStocks
    .filter(s => s.accounts.length > 1)
    .map(s => ({
      ticker: s.ticker,
      name: s.name,
      sector: s.sector,
      accountCount: s.accounts.length,
      totalQuantity: s.totalQuantity,
      weightedBuyPrice: s.weightedBuyPrice,
      currentPrice: s.currentPrice,
      totalValue: s.totalValue,
      totalCost: s.totalCost,
      plRub: s.plRub,
      plPercent: s.plPercent,
      items: s.accounts
    }));

  const now = new Date();
  const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Europe/Moscow' });
  const dateStr = now.toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' });

  return {
    updatedAt: dateStr + ' ' + timeStr,
    depositRate: 15.5,
    freeMarginTotal: 15000,
    annualMarginEarned: 2325,
    monthlyMarginEarned: 193.75,
    grandTotalAssetValue: Math.round(grandTotalAssetValue * 100) / 100,
    grandTotalNetBalance: Math.round(grandTotalNetBalance * 100) / 100,
    grandTotalCost: Math.round(grandTotalCost * 100) / 100,
    grandTotalPlRub: Math.round(grandTotalPlRub * 100) / 100,
    grandTotalPlPercent: Math.round(grandTotalPlPercent * 100) / 100,
    accounts,
    consolidatedStocks,
    sectorBreakdown,
    crossAccountDuplicates,
    concentration: {
      top1Ticker: consolidatedStocks[0]?.ticker || '',
      top1Percent: consolidatedStocks[0]?.sharePercent || 0,
      top3Percent: Math.round(consolidatedStocks.slice(0, 3).reduce((sum, s) => sum + s.sharePercent, 0) * 100) / 100
    },
    topGainers: [...consolidatedStocks].sort((a, b) => b.plPercent - a.plPercent).slice(0, 3),
    topLosers: [...consolidatedStocks].sort((a, b) => a.plPercent - b.plPercent).slice(0, 3),
    dividendShare: Math.round((consolidatedStocks.filter(s => s.divPayer).reduce((sum, s) => sum + s.totalValue, 0) / grandTotalAssetValue) * 10000) / 100
  };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const liveData = await syncTinkoff();
    return res.status(200).json({ ok: true, data: liveData });
  } catch (err) {
    console.error('T-Invest sync error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};
