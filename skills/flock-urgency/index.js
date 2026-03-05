// skills/flock-urgency/index.js

module.exports = {
  name: 'flock-urgency',
  description: 'Score recipient urgency for surplus food between 0 and 1',

  /**
   * Minimal stub implementation.
   * In production, call FLock with the provided prompt and context.
   */
  async execute(args, context) {
    const { recipient, surplus } = args;

    // Simple heuristic fallback so the skill is usable without external wiring
    let score = 0.5;
    if (recipient?.type === 'ngo' && recipient?.families > 20) score += 0.2;
    if (surplus?.expiry === 'today') score += 0.2;
    score = Math.min(score, 1.0);

    return {
      success: true,
      score
    };
  }
};

