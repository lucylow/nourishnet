// agents/logistics/index.js
const { Agent } = require('openclaw');
const axios = require('axios');

class LogisticsAgent extends Agent {
  async initialize() {
    // Connect to the message bus
    if (typeof this.connectToMessageBus === 'function') {
      await this.connectToMessageBus();
    }

    // Subscribe to match events
    this.on('match.ready', this.handleMatch.bind(this));

    // Track active conversations
    this.conversations = new Map();

    // Set up channel webhooks
    await this.setupChannels();

    this.log('Logistics Agent initialized');
  }

  async handleMatch(event) {
    const match = event.payload || event;
    this.log(`Handling match ${match.match_id} for ${match.recipient.name}`);

    // Format message
    const message = this.formatAlertMessage(match);

    // Send via appropriate channel
    if (match.channel === 'whatsapp') {
      await this.executeSkill('whatsapp-send', {
        to: match.recipient.name,
        message
      });
    } else {
      await this.executeSkill('telegram-send', {
        chat_id: match.recipient.name,
        message
      });
    }

    // Store conversation
    this.conversations.set(match.recipient.id, {
      match,
      state: 'awaiting_reply',
      retries: 0,
      last_contact: new Date().toISOString()
    });

    // Schedule reminder if no reply
    this.scheduleReminder(match.recipient.id, 30); // 30 minutes
  }

  async handleIncomingMessage(channel, userId, text) {
    this.log(`Incoming ${channel} message from ${userId}: "${text}"`);

    const conv = this.conversations.get(userId);
    if (!conv) {
      // New conversation - handle help request
      await this.sendHelpResponse(channel, userId);
      return;
    }

    if (conv.state === 'awaiting_reply') {
      // Use FLock to understand intent
      const intent = await this.classifyIntent(text, conv);

      if (intent === 'confirm_pickup') {
        await this.confirmPickup(userId, conv);
      } else if (intent === 'ask_directions') {
        await this.sendDirections(userId, conv);
      } else if (intent === 'ask_code') {
        await this.sendCode(userId, conv);
      } else {
        // General question - use FLock Q&A
        await this.answerQuestion(channel, userId, text, conv);
      }
    }
  }

  async classifyIntent(text, conversation) {
    const result = await this.executeSkill('flock-chat', {
      task: 'classify',
      text,
      context: conversation,
      options: ['confirm_pickup', 'ask_directions', 'ask_code', 'help', 'other']
    });

    return result && result.success ? result.intent : 'other';
  }

  async confirmPickup(userId, conversation) {
    // Publish pickup confirmed event
    await this.publishEvent('pickup.confirmed', {
      source: 'logistics',
      match_id: conversation.match.match_id,
      recipient_id: userId,
      surplus: conversation.match.surplus,
      timestamp: new Date().toISOString()
    });

    // Send thank you message
    const thankYou =
      "🎉 Thank you! You've helped reduce food waste. Enjoy your meal!";
    await this.sendMessage(conversation.match.channel, userId, thankYou);

    // Update conversation state
    conversation.state = 'confirmed';
    conversation.confirmed_at = new Date().toISOString();

    this.log(`Pickup confirmed for user ${userId}`);
  }

  async sendDirections(userId, conversation) {
    const directions =
      '📍 The food is at ' +
      conversation.match.surplus.business +
      ', located at 45 High Street. It is about 5 minutes away.';
    await this.sendMessage(conversation.match.channel, userId, directions);
  }

  async sendCode(userId, conversation) {
    // Generate unique code (simplified)
    const code = `NOURISH${Math.floor(Math.random() * 1000)}`;
    const message = `🔑 Your pickup code is: ${code}. Show this at the counter.`;
    await this.sendMessage(conversation.match.channel, userId, message);
  }

  async answerQuestion(channel, userId, question, conversation) {
    const result = await this.executeSkill('flock-chat', {
      task: 'answer',
      question,
      context: conversation
    });

    const answer =
      result && result.success
        ? result.answer
        : "I'm not sure about that. Would you like to speak with a human supervisor?";

    await this.sendMessage(channel, userId, answer);
  }

  async sendMessage(channel, recipient, message) {
    if (channel === 'whatsapp') {
      await this.executeSkill('whatsapp-send', { to: recipient, message });
    } else {
      await this.executeSkill('telegram-send', { chat_id: recipient, message });
    }
  }

  async sendHelpResponse(channel, userId) {
    const help =
      "👋 Hi! I'm the NourishNet assistant. I can help you with:\n" +
      '- Finding nearby surplus food\n' +
      '- Pickup codes and directions\n' +
      '- Answering questions about food rescue\n\n' +
      'Just let me know what you need!';
    await this.sendMessage(channel, userId, help);
  }

  scheduleReminder(userId, minutes) {
    setTimeout(async () => {
      const conv = this.conversations.get(userId);
      if (conv && conv.state === 'awaiting_reply' && conv.retries < 2) {
        conv.retries++;
        const reminder =
          '⏰ Reminder: Your food is waiting! Reply "confirm" if you have picked it up.';
        await this.sendMessage(conv.match.channel, userId, reminder);

        // Schedule another reminder if needed
        if (conv.retries < 2) {
          this.scheduleReminder(userId, 30);
        } else {
          // Mark as expired
          conv.state = 'expired';
          this.log(`Match ${conv.match.match_id} expired - no response`);
        }
      }
    }, minutes * 60 * 1000);
  }

  formatAlertMessage(match) {
    const surplus = match.surplus;
    return (
      '🍱 *FREE FOOD ALERT!*\n\n' +
      `${surplus.business} has ${surplus.quantity} ${surplus.food_items.join(', ')} available.\n` +
      `Pick up before ${surplus.expiry}.\n\n` +
      'Reply with:\n' +
      '• "confirm" to claim\n' +
      '• "directions" for location\n' +
      '• "code" for pickup code'
    );
  }

  async setupChannels() {
    // Configure channel webhooks based on config
    if (this.config.channels?.whatsapp?.enabled) {
      await this.setupWhatsApp();
    }
    if (this.config.channels?.telegram?.enabled) {
      await this.setupTelegram();
    }
  }

  async setupWhatsApp() {
    // Register webhook with Twilio (mock: just register local handler)
    if (typeof this.registerWebhook === 'function') {
      this.registerWebhook('/webhook/whatsapp', async (req) => {
        const { From, Body } = req.body;
        const from = (From || '').replace('whatsapp:', '');
        await this.handleIncomingMessage('whatsapp', from, Body);
      });
    }
  }

  async setupTelegram() {
    const token = this.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      this.warn('TELEGRAM_BOT_TOKEN not set; skipping Telegram webhook setup');
      return;
    }

    const webhookUrl = `${this.publicUrl || ''}/webhook/telegram`;
    try {
      await axios.post(`https://api.telegram.org/bot${token}/setWebhook`, {
        url: webhookUrl
      });
    } catch (err) {
      this.error('Failed to set Telegram webhook', err.message);
    }

    if (typeof this.registerWebhook === 'function') {
      this.registerWebhook('/webhook/telegram', async (req) => {
        const { message } = req.body;
        if (message) {
          await this.handleIncomingMessage(
            'telegram',
            message.chat.id.toString(),
            message.text
          );
        }
      });
    }
  }
}

const agent = new LogisticsAgent();
agent.start();

