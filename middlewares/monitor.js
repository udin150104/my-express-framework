// middlewares/monitor.js
const os = require('os');

let requestCounter = 0;

module.exports = (req, res, next) => {
  const start = process.hrtime();

  requestCounter++;

  res.on('finish', () => {
    const [sec, nanosec] = process.hrtime(start);
    const responseTimeMs = (sec * 1e3 + nanosec / 1e6).toFixed(2);
    console.log(`[${req.method}] ${req.url} - ${res.statusCode} - ${responseTimeMs}ms`);
  });

  next();
};

module.exports.getStatus = () => {
  const mem = process.memoryUsage();
  return {
    uptime: process.uptime().toFixed(2) + 's',
    totalRequests: requestCounter,
    memory: {
      rss: (mem.rss / 1024 / 1024).toFixed(2) + ' MB',
      heapUsed: (mem.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
    },
    cpuLoad: os.loadavg(),
  };
};
