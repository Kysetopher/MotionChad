const express = require('express');
const next = require('next');
const dotenv = require('dotenv');

dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

app.prepare().then(() => {
  const server = express();

  server.set('trust proxy', 1);
  server.use(express.json());

  // Basic request inspection proxy middleware
  server.use((req, res, next) => {
    // console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    // console.log('Headers:', req.headers);
    if (req.body && Object.keys(req.body).length > 0) {
      // console.log('Body:', req.body);
    }
    next();
  });

  // Serve static files for Next.js
  server.use('/_next', express.static('.next'));

  // Handle API routes
  server.use('/api', (req, res, next) => {
    next();
  });

  // Catch-all handler
  server.all('*', (req, res) => handle(req, res));

  server.listen(port, host, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${host}:${port}`);
  });
});
