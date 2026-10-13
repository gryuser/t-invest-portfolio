const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const USER_ID = '919927871';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const targetUrl = req.query?.url || 'https://t-invest-portfolio.vercel.app';
  const results = { targetUrl };

  // 1. setChatMenuButton (default menu button for all users)
  try {
    const resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: {
          type: 'web_app',
          text: 'Портфель Т-Банк',
          web_app: {
            url: targetUrl
          }
        }
      })
    });
    results.setChatMenuButton = await resp.json();
  } catch (err) {
    results.setChatMenuButton = { error: err.message };
  }

  // 2. setChatMenuButton specifically for chat_id 919927871
  try {
    const resp2 = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: USER_ID,
        menu_button: {
          type: 'web_app',
          text: 'Портфель Т-Банк',
          web_app: {
            url: targetUrl
          }
        }
      })
    });
    results.setUserChatMenuButton = await resp2.json();
  } catch (err) {
    results.setUserChatMenuButton = { error: err.message };
  }

  // 3. Send test message with Web App inline button to user
  try {
    const resp3 = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: USER_ID,
        text: '🚀 <b>Инвестиционный портфель Т-Банка полностью отделен и готов!</b>\n\n✅ Отдельный репозиторий: <code>Mrlee1121/t-invest-portfolio</code>\n✅ Независимый проект Vercel: <code>' + targetUrl + '</code>\n✅ Синхронизация с OpenAPI Т-Банка в реальном времени\n\nНажмите кнопку ниже или используйте Меню в левом нижнем углу для открытия дашборда:',
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📊 Открыть Т-Инвестиции',
                web_app: {
                  url: targetUrl
                }
              }
            ]
          ]
        }
      })
    });
    results.sendMessage = await resp3.json();
  } catch (err) {
    results.sendMessage = { error: err.message };
  }

  return res.status(200).json({ ok: true, results });
};
