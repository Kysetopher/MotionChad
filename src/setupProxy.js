const { createProxyMiddleware } = require('http-proxy-middleware');
const { JSDOM } = require('jsdom');

module.exports = function(app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'http://localhost:5000',
            changeOrigin: true,
            selfHandleResponse: true,
            onProxyRes: async (proxyRes, req, res) => {
                let body = '';
                proxyRes.on('data', chunk => {
                    body += chunk;
                });
                proxyRes.on('end', () => {
                    if (req.url.startsWith('/api/auth/login')) {
                        // Directly handle the response for the login route
                        res.writeHead(proxyRes.statusCode, proxyRes.headers);
                        res.end(body);
                        return;
                    }
                    
                    if (proxyRes.headers['content-type'].includes('text/html')) {
                        const dom = new JSDOM(body);
                        const document = dom.window.document;

                        // Example: Remove elements by class name
                        document.querySelectorAll('.button-class').forEach(button => button.remove());

                        // Modify other parts of the DOM as needed

                        res.writeHead(proxyRes.statusCode, proxyRes.headers);
                        res.end(dom.serialize());
                    } else {
                        res.writeHead(proxyRes.statusCode, proxyRes.headers);
                        res.end(body);
                    }
                });
            },
        })
    );
};