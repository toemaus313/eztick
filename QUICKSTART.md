# Quick Start Guide

Get your Elite Dangerous Tick Bot running in under 5 minutes!

## 1. Prerequisites Check

Make sure you have Node.js installed:
```bash
node --version  # Should be 18.0.0 or higher
npm --version   # Should be 9.0.0 or higher
```

If not installed, download from: https://nodejs.org/

## 2. Get Your Discord Bot Token

1. Go to https://discord.com/developers/applications
2. Click **"New Application"**
3. Give it a name (e.g., "ED Tick Bot")
4. Go to the **"Bot"** section
5. Click **"Add Bot"**
6. Under **"Privileged Gateway Intents"**, enable:
   - ✅ **Message Content Intent**
7. Click **"Reset Token"** and copy the token

## 3. Invite Bot to Your Server

1. Go to **"OAuth2" → "URL Generator"**
2. Select scopes:
   - ✅ `bot`
3. Select bot permissions:
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Read Message History
   - ✅ Mention Everyone
4. Copy the URL and open it in your browser
5. Select your server and authorize

## 4. Configure the Bot

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env    # Windows
   cp .env.example .env      # Mac/Linux
   ```

2. Edit `.env` and add your token:
   ```
   DISCORD_TOKEN=paste_your_token_here
   TICK_CHANNEL_ID=your_channel_id_here
   ```

3. Get Channel ID:
   - Enable Developer Mode in Discord (Settings → Advanced → Developer Mode)
   - Right-click on a channel → "Copy Channel ID"
   - Paste it in the `.env` file

## 5. Install Dependencies

```bash
npm install
```

## 6. Start the Bot

```bash
npm start
```

You should see:
```
YourBot#1234 has connected to Discord!
Monitoring tick updates every 5 minutes...
```

## 7. Test Commands

In your Discord server, try:
- `!tick` - Shows the last galaxy tick
- `!nexttick` - Estimates the next tick time
- `!tickchannel` - Sets the current channel for auto-notifications (Admin only)

## Done! 🎉

Your bot is now running and will automatically notify you when new ticks are detected!

---

## Deploy to Cloud (Optional)

Want to run your bot 24/7? Check out:
- **[DigitalOcean Deployment Guide](./DIGITALOCEAN_DEPLOY.md)** - Complete cloud hosting guide

---

## Troubleshooting

### Bot doesn't respond to commands
- Make sure "Message Content Intent" is enabled in Discord Developer Portal
- Verify the bot has permission to read/send messages in your channel

### "Error: DISCORD_TOKEN not found"
- Check that your `.env` file exists and has the correct token
- Make sure there are no spaces around the `=` sign

### "Cannot find module 'discord.js'"
- Run `npm install` to install dependencies

---

**Need help?** Check the full [README.md](./README.md) for detailed information.

**o7 Commander!** 🚀
