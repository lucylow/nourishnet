// skills/telegram-send/index.js

module.exports = {
  name: 'telegram-send',
  description:
    'Send a Telegram message via Bot API or mock to console (this repo provides a mock by default)',

  async execute(args, context) {
    const { chat_id, message } = args;

    // If a real sender is wired up in context, delegate
    if (context && typeof context.sendTelegram === 'function') {
      await context.sendTelegram(chat_id, message);
      return { success: true };
    }

    // Fallback: log to stdout so behaviour is observable in demos
    // eslint-disable-next-line no-console
    console.log(`[Telegram stub] To ${chat_id}: ${message}`);
    return { success: true };
  }
};

