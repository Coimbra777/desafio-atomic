const mode = process.argv[2] || 'development';

console.log(`[taskflow-worker] Placeholder worker started in ${mode} mode.`);
console.log('[taskflow-worker] BullMQ and Redis processing will be implemented in a later etapa.');

setInterval(() => {
  console.log('[taskflow-worker] Waiting for worker implementation...');
}, 60000);

