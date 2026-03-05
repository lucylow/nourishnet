// skills/database-query/index.js

module.exports = {
  name: 'database-query',
  description: 'Run a simple database-style query against a provided adapter',

  /**
   * Expects context.db to expose an async query(sql, params) or find(collection, filter) API.
   * This is a thin abstraction layer; in this repo it can be wired to Redis or an in-memory store.
   */
  async execute(args, context) {
    const { kind = 'raw', sql, params, collection, filter } = args;

    if (!context || !context.db) {
      return {
        success: false,
        error: 'No database adapter found on context.db',
        data: null
      };
    }

    try {
      let result;
      if (kind === 'raw' && typeof context.db.query === 'function') {
        result = await context.db.query(sql, params || []);
      } else if (kind === 'collection' && typeof context.db.find === 'function') {
        result = await context.db.find(collection, filter || {});
      } else {
        return {
          success: false,
          error: 'Unsupported query kind or missing db methods',
          data: null
        };
      }

      return {
        success: true,
        data: result
      };
    } catch (err) {
      return {
        success: false,
        error: err.message,
        data: null
      };
    }
  }
};

