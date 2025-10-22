const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
	app.use(
		'/api',
		createProxyMiddleware({
			target: 'http://10.181.25.147:8000',
			changeOrigin: true,
			pathRewrite: {
				'^/api': '/',
			},
			logLevel: 'warn',
			timeout: 120000, // 2 minutes timeout
			proxyTimeout: 120000, // 2 minutes proxy timeout
			onProxyReq: (proxyReq) => {
				proxyReq.setHeader('Connection', 'keep-alive');
			},
		})
	);
};
