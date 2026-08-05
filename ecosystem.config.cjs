require("dotenv").config();

module.exports = {
  apps: [
    {
      name: "sanctificare-backend",
      script: "./dist/index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        DEV_AUTH_BYPASS: "0",
        // Stripe
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
        STRIPE_PRICE_MONTHLY: process.env.STRIPE_PRICE_MONTHLY,
        STRIPE_PRICE_ANNUAL: process.env.STRIPE_PRICE_ANNUAL,
        // App
        APP_URL: process.env.APP_URL,
        JWT_SECRET: process.env.JWT_SECRET,
        DATABASE_URL: process.env.DATABASE_URL,
        // Auth
        VITE_APP_ID: process.env.VITE_APP_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        OAUTH_SERVER_URL: process.env.OAUTH_SERVER_URL,
        OWNER_OPEN_ID: process.env.OWNER_OPEN_ID,
        // Cloudflare R2
        R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
        R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
        R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
        R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
        R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
        // Firebase Cloud Messaging
        FCM_SERVICE_ACCOUNT_JSON: process.env.FCM_SERVICE_ACCOUNT_JSON,
        // Resend e-mail
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        RESEND_SEGMENT_ID: process.env.RESEND_SEGMENT_ID || process.env.RESEND_AUDIENCE_ID,
        RESEND_AUDIENCE_ID: process.env.RESEND_AUDIENCE_ID,
        // Bunny Stream
        VITE_BUNNY_LIBRARY_ID: process.env.VITE_BUNNY_LIBRARY_ID,
        BUNNY_API_KEY: process.env.BUNNY_API_KEY,
        // OTA
        VITE_ENABLE_OTA: process.env.VITE_ENABLE_OTA,
      }
    }
  ]
};
