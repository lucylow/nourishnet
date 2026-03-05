// agents/coordinator/index.js
const { Agent } = require('openclaw');

class CoordinatorAgent extends Agent {
  async initialize() {
    // Connect to the message bus
    if (typeof this.connectToMessageBus === 'function') {
      await this.connectToMessageBus();
    }

    // Subscribe to surplus events
    this.on('surplus.detected', this.handleSurplus.bind(this));

    // Load recipient database (mock for now)
    this.recipients = await this.loadRecipients();

    this.log('Coordinator Agent initialized');
  }

  async handleSurplus(event) {
    const surplus = event.payload || event;
    this.log(`Processing surplus from ${surplus.business}`);

    // Find potential recipients (within radius)
    const candidates = this.findCandidates(surplus);

    if (candidates.length === 0) {
      this.log('No recipients found, archiving surplus');
      await this.archiveSurplus(surplus);
      return;
    }

    // Score urgency for each candidate
    const scored = [];
    for (const recipient of candidates) {
      const urgency = await this.scoreUrgency(recipient, surplus);
      scored.push({ recipient, urgency });
    }

    // Sort by urgency (highest first)
    scored.sort((a, b) => b.urgency - a.urgency);

    // Take top matches
    const topMatches = scored.slice(0, 3);

    for (const match of topMatches) {
      // Determine channel based on recipient type
      const channel = match.recipient.type === 'individual' ? 'whatsapp' : 'telegram';

      // Publish match event
      await this.publishEvent('match.ready', {
        source: 'coordinator',
        surplus,
        recipient: match.recipient,
        urgency: match.urgency,
        channel,
        match_id: this.generateMatchId(),
        timestamp: new Date().toISOString()
      });

      this.log(`Matched surplus with ${match.recipient.name} (urgency: ${match.urgency})`);
    }
  }

  async scoreUrgency(recipient, surplus) {
    // Use FLock urgency scoring skill
    const result = await this.executeSkill('flock-urgency', {
      recipient,
      surplus,
      prompt: `Score urgency (0-1) for ${recipient.type} at distance 1km receiving ${surplus.food_items?.[0] || 'food items'}`
    });

    if (result && result.success && typeof result.score === 'number') {
      return result.score;
    }

    // Fallback to rule-based scoring
    return this.ruleBasedUrgency(recipient, surplus);
  }

  ruleBasedUrgency(recipient, surplus) {
    // Simple fallback logic
    let score = 0.5;
    if (recipient.type === 'ngo' && recipient.families > 20) score += 0.2;
    if (surplus.expiry === 'today') score += 0.2;
    return Math.min(score, 1.0);
  }

  findCandidates(surplus) {
    // In production, query database with geospatial query
    if (!this.recipients) return [];
    return this.recipients.filter(() => this.calculateDistance(null, null) < 2);
  }

  calculateDistance(loc1, loc2) {
    // Simple mock - return 1km for demo
    return 1.0;
  }

  async loadRecipients() {
    // Load from database or config (mock for now)
    return [
      { id: 'ngo1', type: 'ngo', name: 'City Food Bank', location: { lat: 51.5, lon: -0.12 }, families: 50 },
      { id: 'user1', type: 'individual', name: '+447911123456', location: { lat: 51.51, lon: -0.13 }, preferences: ['sandwich'] }
    ];
  }

  generateMatchId() {
    return 'match_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  }

  async archiveSurplus(surplus) {
    // Store for later potential matching (if storage available)
    if (this.storage && typeof this.storage.set === 'function') {
      await this.storage.set(`surplus:${surplus.id || surplus.business}`, surplus);
    }
  }
}

const agent = new CoordinatorAgent();
agent.start();

