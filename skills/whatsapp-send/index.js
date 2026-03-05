// skills/whatsapp-send/index.js

module.exports = {
  name: 'whatsapp-send',
  description:
    'Send a WhatsApp message via Twilio or mock to console (this repo provides a mock by default)',

  async execute(args, context) {
    const { to, message } = args;

    // If a real sender is wired up in context, delegate
    if (context && typeof context.sendWhatsApp === 'function') {
      await context.sendWhatsApp(to, message);
      return { success: true };
    }

    // Fallback: log to stdout so behaviour is observable in demos
    // eslint-disable-next-line no-console
    console.log(`[WhatsApp stub] To ${to}: ${message}`);
    return { success: true };
  }
};

