// agents/scout/index.js
const { Agent } = require('openclaw');

class ScoutAgent extends Agent {
  async initialize() {
    // Connect to the message bus
    if (typeof this.connectToMessageBus === 'function') {
      await this.connectToMessageBus();
    }

    // Register event handlers
    this.on('scan.request', this.handleScanRequest.bind(this));

    // Set up cron jobs
    this.schedule('*/30 * * * *', this.performScan.bind(this));

    this.log('Scout Agent initialized');
  }

  async performScan() {
    this.log('Performing scheduled scan for surplus food');

    // Fetch listings from business feeds
    const feedUrl = this.env.BUSINESS_FEED_URL;
    const listings = await this.fetchListings(feedUrl);

    for (const listing of listings) {
      await this.processListing(listing);
    }
  }

  async handleScanRequest(event) {
    const { businessId, manual } = event.payload;
    this.log(`Manual scan requested for business ${businessId} (manual=${manual})`);

    const listing = await this.fetchBusinessListing(businessId);
    await this.processListing(listing, { manual: true });
  }

  async processListing(listing, options = {}) {
    // Use FLock skill to extract data
    const extraction = await this.executeSkill('flock-extract', {
      text: listing.text,
      business: listing.business
    });

    if (!extraction.success) {
      this.error('Extraction failed', extraction.error);
      return;
    }

    const data = extraction.data;

    // Check confidence
    if (data.confidence >= 0.9) {
      // High confidence - publish event
      await this.publishEvent('surplus.detected', {
        source: 'scout',
        business: data.business,
        food_items: data.food_items,
        quantity: data.quantity,
        expiry: data.expiry,
        category: data.category,
        timestamp: new Date().toISOString()
      });

      this.log(`Published surplus.detected for ${data.business}`);
    } else {
      // Low confidence - ask human
      this.log(`Low confidence (${data.confidence}), requesting human help`);

      const humanResponse = await this.executeSkill('human-request', {
        message: 'Please clarify this food listing:',
        schema: {
          type: 'object',
          properties: {
            food_items: { type: 'array', items: { type: 'string' } },
            quantity: { type: 'integer' },
            expiry: { type: 'string', format: 'date' },
            category: { type: 'string', enum: ['bakery', 'hot_meal', 'grocery', 'other'] }
          },
          required: ['food_items', 'quantity', 'expiry', 'category']
        },
        data: {
          original_listing: listing.text,
          business: listing.business,
          extracted: data
        }
      });

      if (humanResponse.success) {
        // Human provided clarification
        await this.publishEvent('surplus.detected', {
          source: 'scout',
          business: listing.business,
          ...humanResponse.data,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  async fetchListings(feedUrl) {
    // Implementation to fetch from business feeds.
    // For demo, return mock data.
    this.log(`Fetching listings from ${feedUrl} (mocked)`);
    return [
      { business: 'Sunrise Bakery', text: '3 unsold sandwiches, best before today' },
      { business: 'Green Cafe', text: '5 croissants and 2 baguettes from this morning' }
    ];
  }

  async fetchBusinessListing(businessId) {
    // Mock single listing fetch for demo
    return {
      business: `Business ${businessId}`,
      text: 'Some surplus food listing text'
    };
  }
}

// Start the agent
const agent = new ScoutAgent();
agent.start();

