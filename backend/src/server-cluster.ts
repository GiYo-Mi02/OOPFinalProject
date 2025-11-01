/**
 * Clustered Server for Production
 * 
 * This starts multiple Node.js processes (workers) to utilize all CPU cores.
 * Each worker shares the same port and handles requests in parallel.
 * 
 * Usage:
 *   node dist/server-cluster.js
 * 
 * Or add to package.json:
 *   "start:cluster": "npm run build && node dist/server-cluster.js"
 */

import cluster from 'cluster';
import os from 'os';

const numCPUs = os.cpus().length;
const NUM_WORKERS = process.env.NUM_WORKERS 
  ? parseInt(process.env.NUM_WORKERS, 10) 
  : Math.min(numCPUs, 4); // Default to 4 workers max to avoid resource exhaustion

if (cluster.isPrimary) {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Starting UMak eBallot in Cluster Mode');
  console.log('='.repeat(60));
  console.log(`📊 System Info:`);
  console.log(`   CPU Cores:    ${numCPUs}`);
  console.log(`   Workers:      ${NUM_WORKERS}`);
  console.log(`   Node Version: ${process.version}`);
  console.log(`   Process ID:   ${process.pid}`);
  console.log('='.repeat(60) + '\n');

  // Fork workers
  for (let i = 0; i < NUM_WORKERS; i++) {
    const worker = cluster.fork();
    console.log(`✅ Worker ${i + 1} started (PID: ${worker.process.pid})`);
  }

  // Handle worker exit
  cluster.on('exit', (worker, code, signal) => {
    console.error(`\n❌ Worker ${worker.process.pid} died (${signal || code})`);
    console.log('🔄 Starting replacement worker...');
    const newWorker = cluster.fork();
    console.log(`✅ New worker started (PID: ${newWorker.process.pid})\n`);
  });

  // Handle shutdown gracefully
  process.on('SIGTERM', () => {
    console.log('\n⚠️  SIGTERM received. Shutting down gracefully...');
    for (const id in cluster.workers) {
      cluster.workers[id]?.kill();
    }
  });

  process.on('SIGINT', () => {
    console.log('\n⚠️  SIGINT received. Shutting down gracefully...');
    for (const id in cluster.workers) {
      cluster.workers[id]?.kill();
    }
    process.exit(0);
  });

} else {
  // Worker process - import and start the server
  require('./server');
}
