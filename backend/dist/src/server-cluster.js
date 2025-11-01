"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cluster_1 = __importDefault(require("cluster"));
const os_1 = __importDefault(require("os"));
const numCPUs = os_1.default.cpus().length;
const NUM_WORKERS = process.env.NUM_WORKERS
    ? parseInt(process.env.NUM_WORKERS, 10)
    : Math.min(numCPUs, 4); // Default to 4 workers max to avoid resource exhaustion
if (cluster_1.default.isPrimary) {
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
        const worker = cluster_1.default.fork();
        console.log(`✅ Worker ${i + 1} started (PID: ${worker.process.pid})`);
    }
    // Handle worker exit
    cluster_1.default.on('exit', (worker, code, signal) => {
        console.error(`\n❌ Worker ${worker.process.pid} died (${signal || code})`);
        console.log('🔄 Starting replacement worker...');
        const newWorker = cluster_1.default.fork();
        console.log(`✅ New worker started (PID: ${newWorker.process.pid})\n`);
    });
    // Handle shutdown gracefully
    process.on('SIGTERM', () => {
        console.log('\n⚠️  SIGTERM received. Shutting down gracefully...');
        for (const id in cluster_1.default.workers) {
            cluster_1.default.workers[id]?.kill();
        }
    });
    process.on('SIGINT', () => {
        console.log('\n⚠️  SIGINT received. Shutting down gracefully...');
        for (const id in cluster_1.default.workers) {
            cluster_1.default.workers[id]?.kill();
        }
        process.exit(0);
    });
}
else {
    // Worker process - import and start the server
    require('./server');
}
