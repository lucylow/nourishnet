// launch.js
const { spawn } = require('child_process');
const path = require('path');

const agents = ['scout', 'coordinator', 'logistics'];

console.log('Launching NourishNet OpenClaw multi-agent system...');

// Start gateway first
const gateway = spawn(
  'openclaw',
  ['gateway', 'start', '--config', './config/openclaw.json'],
  {
    stdio: 'inherit',
    shell: true
  }
);

gateway.on('error', (err) => {
  console.error('Gateway failed:', err);
});

// Wait for gateway to initialize
setTimeout(() => {
  // Start each agent
  agents.forEach((agentName) => {
    const agentPath = path.join(__dirname, 'agents', agentName, 'index.js');
    const agent = spawn('node', [agentPath], {
      stdio: 'inherit',
      env: { ...process.env, AGENT_NAME: agentName }
    });

    agent.on('error', (err) => {
      console.error(`${agentName} failed:`, err);
    });

    console.log(`Started ${agentName} agent`);
  });
}, 5000);

