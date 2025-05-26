const withTM = require('next-transpile-modules')([
  'react-tweet', 
]);

// 2. Your existing PWA config
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest\.json$/],
  importScripts: ['/service-worker.js'],
});

const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const stripeTestMode = process.env.USE_STRIPE_TEST_MODE === 'true';

module.exports = withTM(
withPWA({
  productionBrowserSourceMaps: false,
  webpack: (config, { isServer, dev }) => {
    // Existing obfuscation for production client-side code
    if (!isServer && !dev) {
      const WebpackObfuscator = require('webpack-obfuscator');
      config.plugins.push(
        new WebpackObfuscator(
          {
            rotateStringArray: true,
            stringArray: true,
            stringArrayThreshold: 0.55,
            transformObjectKeys: true,
            unicodeEscapeSequence: false,
          },
          [
            'static/runtime/*.js',
            'pages/_*.js',
            'pages/api/*.js',
            '**/node_modules/**',
            '**/webpack-runtime.js',
            '**/react-refresh-utils/**',
          ]
        )
      );
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };

    config.ignoreWarnings = [{ module: /node_modules\/punycode/ }];

    return config;
  },
  env: {
    STRIPE_PUBLIC_KEY: stripeTestMode
      ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST
      : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE,
    STRIPE_SECRET_KEY: stripeTestMode
      ? process.env.STRIPE_SECRET_KEY_TEST
      : process.env.STRIPE_SECRET_KEY_LIVE,
    STRIPE_MONTHLY_SUBSCRIPTION_PRICE_ID: stripeTestMode
      ? process.env.STRIPE_MONTHLY_SUBSCRIPTION_PRICE_ID_TEST
      : process.env.STRIPE_MONTHLY_SUBSCRIPTION_PRICE_ID_LIVE,
  },
})
);
