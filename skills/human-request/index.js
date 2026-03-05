// skills/human-request/index.js

module.exports = {
  name: 'human-request',
  description: 'Request human supervisor input',

  async execute(args, context) {
    const { message, schema, data } = args;

    if (
      !context ||
      typeof context.createTask !== 'function' ||
      typeof context.notifySupervisor !== 'function' ||
      typeof context.getTask !== 'function'
    ) {
      return {
        success: false,
        error: 'Human supervision backend is not configured in context.',
        data: null
      };
    }

    // Create task in MCP server or database
    const taskId = await context.createTask({
      type: 'human_review',
      message,
      schema,
      data,
      agent: context.agentName,
      status: 'pending',
      created_at: new Date().toISOString()
    });

    // Notify via webhook or dashboard
    await context.notifySupervisor('new_task', { taskId, message });

    // Wait for response (poll or callback)
    return new Promise((resolve) => {
      const checkInterval = setInterval(async () => {
        const task = await context.getTask(taskId);
        if (task.status === 'completed') {
          clearInterval(checkInterval);
          resolve({ success: true, data: task.response });
        } else if (task.status === 'rejected') {
          clearInterval(checkInterval);
          resolve({ success: false, error: 'Rejected by human', data: null });
        }
      }, 2000);

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve({
          success: false,
          error: 'Human response timeout',
          data: null
        });
      }, 300000);
    });
  }
};

