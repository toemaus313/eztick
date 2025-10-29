/**
 * PM2 Ecosystem Configuration
 * 
 * This file defines all Discord bots to be managed by PM2 on your DigitalOcean server.
 * 
 * Usage:
 *   pm2 start ecosystem.config.js    - Start all bots
 *   pm2 reload ecosystem.config.js   - Reload configuration
 *   pm2 stop all                     - Stop all bots
 *   pm2 status                       - View status of all bots
 *   pm2 logs                         - View logs for all bots
 * 
 * Documentation: https://pm2.keymetrics.io/docs/usage/application-declaration/
 */

module.exports = {
  apps: [
    // Elite Tracker Bot
    {
      name: 'elite-tracker',
      cwd: '/home/botmanager/bots/elite-tracker',
      script: 'bot.js',
      instances: 1,
      autorestart: true,
      watch: true,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/home/botmanager/logs/elite-tracker-error.log',
      out_file: '/home/botmanager/logs/elite-tracker-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true
    },
    {
      name: 'eztick',
      cwd: '/home/botmanager/bots/eztick',
      script: 'bot.js',  // or bot.js, main.js, etc.
      instances: 1,
      autorestart: true,
      watch: true,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/home/botmanager/logs/eztick-error.log',
      out_file: '/home/botmanager/logs/eztick-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true
    }
    
    // Add more bots here - Example template:
    /*
    {
      name: 'my-second-bot',
      cwd: '/home/botmanager/bots/my-second-bot',
      script: 'index.js',  // or bot.js, main.js, etc.
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/home/botmanager/logs/my-second-bot-error.log',
      out_file: '/home/botmanager/logs/my-second-bot-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true
    }
    */
  ]
};
