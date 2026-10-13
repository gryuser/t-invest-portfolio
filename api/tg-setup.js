const BOT_TOKEN = '8892862279:AAE47Ux4Y9WrYKBrrLEDHKGk5RU9HjJPuFc';
const USER_ID = '919927871';
const WEB_APP_URL = 'https://weather-telegram-bot-beta.vercel.app';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const results = {};

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
            url: WEB_APP_URL
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
            url: WEB_APP_URL
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
        text: '🚀 <b>Инвестиционный портфель Т-Банка успешно обновлён!</b>\n\n✅ Ошибка 404 устранена\n✅ Дашборд Т-Инвестиций развернут на Vercel\n✅ Доступна синхронизация с Т-Банком в реальном времени\n\nНажмите кнопку ниже или используйте Меню в левом нижнем углу:',
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📊 Открыть Портфель Т-Инвестиции',
                web_app: {
                  url: WEB_APP_URL
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
