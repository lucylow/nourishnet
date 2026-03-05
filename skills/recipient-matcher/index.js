// skills/recipient-matcher/index.js

module.exports = {
  name: 'recipient-matcher',
  description: 'Find potential recipients for a given surplus (stub implementation)',

  /**
   * For now this simply echoes back the recipients passed in via context, if any.
   * In a real deployment this would query a database or external service.
   */
  async execute(args, context) {
    const { surplus } = args;
    const recipients = context?.recipients || [];

    return {
      success: true,
      data: {
        surplus,
        recipients
      }
    };
  }
};

