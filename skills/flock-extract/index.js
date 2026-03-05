// skills/flock-extract/index.js
const axios = require('axios');

module.exports = {
  name: 'flock-extract',
  description: 'Extract structured food data from text using FLock API',

  async execute(args, context) {
    const { text, business } = args;
    const apiKey = context.env.FLOCK_API_KEY;

    try {
      const response = await axios.post(
        'https://api.flock.io/v1/chat/completions',
        {
          model: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
          messages: [
            {
              role: 'system',
              content:
                'You extract structured data from food surplus messages. Respond with JSON only.'
            },
            {
              role: 'user',
              content: `Extract from: "${text}"`
            }
          ],
          temperature: 0.1,
          max_tokens: 200
        },
        {
          headers: { Authorization: `Bearer ${apiKey}` }
        }
      );

      const content = response.data.choices[0].message.content;
      // Parse JSON, handling markdown code fences
      const jsonStr = content.replace(/```json\n?|```/g, '').trim();
      const extracted = JSON.parse(jsonStr);

      return {
        success: true,
        data: {
          business,
          ...extracted,
          raw_text: text,
          confidence: module.exports.estimateConfidence(extracted)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  },

  estimateConfidence(data) {
    const required = ['food_items', 'quantity', 'expiry', 'category'];
    const present = required.filter((k) => data[k]).length;
    return present / required.length;
  }
};

