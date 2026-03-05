// skills/flock-chat/index.js

module.exports = {
  name: 'flock-chat',
  description: 'Use FLock-backed chat model for intent classification and short answers (stub)',

  /**
   * This is a lightweight stub that performs simple rule-based behaviour so
   * the Logistics Agent can run without full FLock wiring.
   *
   * args.task: "classify" | "answer"
   */
  async execute(args, context) {
    const { task, text = '', question, options = [] } = args;
    const lower = (text || question || '').toLowerCase();

    if (task === 'classify') {
      let intent = 'other';
      if (lower.includes('confirm') || lower.includes('on my way')) {
        intent = 'confirm_pickup';
      } else if (lower.includes('where') || lower.includes('directions')) {
        intent = 'ask_directions';
      } else if (lower.includes('code')) {
        intent = 'ask_code';
      } else if (lower.includes('help')) {
        intent = 'help';
      }

      if (Array.isArray(options) && options.length && !options.includes(intent)) {
        intent = options[0];
      }

      return {
        success: true,
        intent
      };
    }

    if (task === 'answer') {
      const answer =
        'The food can be picked up at the partner location shown in your last message. ' +
        'Show your pickup code at the counter and arrive before the listed expiry time.';
      return {
        success: true,
        answer
      };
    }

    return {
      success: false,
      error: 'Unsupported task for flock-chat stub',
      data: null
    };
  }
};

