const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Determine if we're running in Docker or development environment
  const isDocker = process.env.IS_DOCKER === 'true';
  
  // Use the appropriate backend URL based on environment
  const target = isDocker 
    ? 'http://host.docker.internal:8000'  // Docker environment - use special host DNS
    : 'http://localhost:8000'; // Development environment - use localhost
  
  console.log(`Proxying API requests to: ${target}`);
  
  // Proxy API requests to the backend
  app.use(
    '/api',
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api', // no rewrite needed
      },
      // Log proxy activity
      logLevel: 'debug',
      // Handle errors
      onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.writeHead(500, {
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify({
          error: 'Proxy error connecting to API',
          details: err.message
        }));
      }
    }),
  );
}; 