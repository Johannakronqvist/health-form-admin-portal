import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 3001);
const delayMs = Number(process.env.MOCK_DELAY_MS ?? 900);
const errorRate = Number(process.env.MOCK_ERROR_RATE ?? 0);

createApp({ delayMs, errorRate }).listen(port, () => {
  console.log(`Health form mock API running on http://localhost:${port}/api`);
  console.log(`  latency: ${delayMs} ms, random error rate: ${errorRate * 100}%`);
});
