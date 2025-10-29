# Elite Dangerous Tick Bot 🌌

A Discord bot that monitors and reports Elite Dangerous galaxy tick updates from [tick.infomancer.uk](http://tick.infomancer.uk/galtick.json).

## Features

- **!tick** - Display the last galaxy tick timestamp
- **Auto-notifications** - Automatically posts to a designated channel when a new tick is detected (checks every 5 minutes)
- **!nexttick** - Estimate when the next tick might occur (approximately 24 hours)
- **!tickchannel** - Set the current channel for automatic tick notifications (Admin only)

## Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)
- A Discord bot token (see setup instructions below)

## Installation

1. **Clone or download this repository**

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Create a Discord Bot:**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Click "New Application" and give it a name
   - Go to the "Bot" section and click "Add Bot"
   - Under "Privileged Gateway Intents", enable:
     - Message Content Intent
   - Copy the bot token (you'll need this for the `.env` file)

4. **Invite the bot to your server:**
   - Go to the "OAuth2" → "URL Generator" section
   - Select scopes: `bot`
   - Select bot permissions:
     - Send Messages
     - Embed Links
     - Read Message History
     - Use Slash Commands (optional)
   - Copy the generated URL and open it in your browser to invite the bot

5. **Configure the bot:**
   - Copy `.env.example` to `.env`:
     ```bash
     copy .env.example .env
     ```
   - Edit `.env` and add your bot token:
     ```
     DISCORD_TOKEN=your_actual_bot_token_here
     TICK_CHANNEL_ID=your_channel_id_here
     ```
   - To get a channel ID:
     - Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
     - Right-click on the channel → Copy Channel ID

## Usage

### Running the Bot

```bash
npm start
# or
node bot.js
```

The bot will start and connect to Discord. You should see a message confirming it's connected.

### Commands

| Command | Description | Permission |
|---------|-------------|------------|
| `!tick` | Display the last galaxy tick timestamp | Everyone |
| `!nexttick` | Estimate when the next tick might occur | Everyone |
| `!tickchannel` | Set the current channel for tick notifications | Admin only |

### Automatic Notifications

The bot automatically checks for new ticks every 5 minutes. When a new tick is detected, it will:
- Post a notification with `@here` mention in the configured channel
- Display the new tick timestamp
- Show how long ago it occurred

## Example Output

### !tick Command
```
🌌 Elite Dangerous Galaxy Tick
Last Galaxy Tick: 2025-10-28 18:57:19 UTC
Time ago: 3h 45m ago

Data from tick.infomancer.uk
```

### Auto-notification
```
@here
🚨 NEW GALAXY TICK DETECTED!
Last Galaxy Tick: 2025-10-28 22:42:33 UTC
Time ago: 0m ago

Data from tick.infomancer.uk
```

## Configuration

### Environment Variables

- `DISCORD_TOKEN` - Your Discord bot token (required)
- `TICK_CHANNEL_ID` - The channel ID where tick notifications will be posted (can be set via `!tickchannel` command)

## Troubleshooting

### Bot doesn't respond to commands
- Make sure "Message Content Intent" is enabled in the Discord Developer Portal
- Verify the bot has permission to read and send messages in the channel

### Bot can't post tick notifications
- Use the `!tickchannel` command in the channel where you want notifications
- Or set `TICK_CHANNEL_ID` in the `.env` file

### "Unable to fetch tick data"
- Check your internet connection
- Verify that [tick.infomancer.uk](http://tick.infomancer.uk/galtick.json) is accessible

## Data Source

This bot fetches tick data from: `http://tick.infomancer.uk/galtick.json`

The data is provided by the Elite Dangerous community and updates automatically when a new galaxy tick occurs.

## Running 24/7

To keep the bot running continuously:

### Option 1: PM2 (Recommended for Node.js)
```bash
npm install -g pm2

# Start using ecosystem config (recommended)
pm2 start ecosystem.config.js

# Or start directly
pm2 start bot.js --name eztick

# Save configuration and enable auto-start
pm2 save
pm2 startup
```

Then run the command that PM2 outputs to enable auto-start on boot.

**Managing with PM2:**
```bash
pm2 status          # Check status
pm2 logs eztick     # View logs
pm2 restart eztick  # Restart bot
pm2 stop eztick     # Stop bot
pm2 delete eztick   # Remove from PM2
```

### Option 2: Docker
```bash
docker build -t eztick-bot .
docker run -d --env-file .env --name eztick eztick-bot
```

### Option 3: DigitalOcean (Cloud Hosting)
See the comprehensive [DigitalOcean Deployment Guide](./DIGITALOCEAN_DEPLOY.md) for detailed instructions on deploying to:
- DigitalOcean App Platform (managed, $5/month)
- DigitalOcean Droplets (VPS, $6/month)
- Docker on DigitalOcean

### Option 4: systemd Service (Linux)
Create `/etc/systemd/system/eztick.service`:
```ini
[Unit]
Description=Elite Dangerous Tick Bot
After=network.target

[Service]
Type=simple
User=your_username
WorkingDirectory=/path/to/eztick
ExecStart=/usr/bin/node bot.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable eztick
sudo systemctl start eztick
```

### Option 5: Windows Service
Use [node-windows](https://www.npmjs.com/package/node-windows) or NSSM (Non-Sucking Service Manager).

## Contributing

Feel free to submit issues or pull requests if you have suggestions for improvements!

## License

This project is open source and available for free use.

## Credits

- Data source: [tick.infomancer.uk](http://tick.infomancer.uk/)
- [Discord.js](https://discord.js.org/) library
- Elite Dangerous community

## Technology Stack

- **Node.js** - JavaScript runtime
- **Discord.js v14** - Discord API wrapper
- **node-fetch** - HTTP client for API requests
- **dotenv** - Environment variable management

Find me in the black - CMDR Dirk Pitt13. o7 Commander! 🚀

