// test-integration.js
const { Client } = require('openclaw');

async function test() {
  const client = new Client('http://localhost:18789');

  // Test Scout Agent (method name may vary depending on OpenClaw runtime)
  console.log('Testing Scout Agent...');
  try {
    const scanResult = await client.agent('scout').execute('performScan');
    console.log('Scan result:', scanResult);
  } catch (err) {
    console.error('Scout test failed (this is expected if RPC is not wired):', err.message);
  }

  // Test Coordinator Agent handler
  console.log('Testing Coordinator Agent...');
  try {
    const matchResult = await client.agent('coordinator').execute('handleSurplus', {
      payload: {
        business: 'Test Bakery',
        food_items: ['sandwich'],
        quantity: 3,
        expiry: 'today'
      }
    });
    console.log('Coordinator result:', matchResult);
  } catch (err) {
    console.error(
      'Coordinator test failed (this is expected if direct RPC is not configured):',
      err.message
    );
  }

  // Check message bus events if your OpenClaw client exposes such an API
  if (typeof client.getEvents === 'function') {
    try {
      const events = await client.getEvents('surplus.detected');
      console.log('Recent surplus.detected events:', events);
    } catch (err) {
      console.error('Event inspection failed:', err.message);
    }
  } else {
    console.log(
      'Client.getEvents is not available; verify events via gateway logs or your own tooling.'
    );
  }
}

test().catch((err) => {
  console.error('Integration test encountered an error:', err);
});

