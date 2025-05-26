import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  
  // Key generator to get IP address, considering trust proxy settings
  keyGenerator: (req) => req.ip,

  // Custom handler to log and respond when the rate limit is exceeded
  handler: (req, res, next, options) => {
    console.error('Rate Limit Exceeded:', {
      ip: req.ip,
      url: req.originalUrl,
      headers: req.headers,
    });

    res.status(options.statusCode).json({
      error: 'Rate limit exceeded. Please try again later.',
      status: options.statusCode,
    });
  }
});

export default limiter;