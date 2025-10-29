# Troubleshooting Automatic Tick Detection

## Common Issues

### 1. Bot Started After a Tick
**Problem**: When the bot starts up, it immediately stores the current tick from the API as the "last known tick". This means it won't notify about that tick - only ticks that happen AFTER the bot is running.

**Solution**: This is expected behavior. The bot will detect and notify about the NEXT tick that occurs while it's running.

### 2. Channel Not Configured
**Problem**: The bot isn't sending notifications because `TICK_CHANNEL_ID` is not set or is set to 0.

**How to Check**: Look at the bot logs when it starts:
```
Tick notification channel: NOT CONFIGURED
```

**Solution**: 
1. Run `!tickchannel` in the Discord channel where you want notifications
2. OR add `TICK_CHANNEL_ID=<your_channel_id>` to your `.env` file

### 3. Bot Doesn't Have Channel Access
**Problem**: The bot can't find or access the configured channel.

**How to Check**: Look for this in the logs:
```
⚠️ Warning: Could not find channel with ID <channel_id>
```

**Solution**: 
- Make sure the bot has been invited to your server
- Make sure the bot has permissions to view and send messages in that channel
- Verify the channel ID is correct

### 4. API Connection Issues
**Problem**: The bot can't fetch tick data from the API.

**How to Check**: Look for this in the logs:
```
Failed to fetch current tick from API
Error fetching tick: <error message>
```

**Solution**:
- Check your internet connection
- Verify `http://tick.infomancer.uk/galtick.json` is accessible
- Check if there's a firewall blocking the connection

## Monitoring the Bot

### What You Should See in Logs

**On Startup:**
```
<BotName>#1234 has connected to Discord!
Monitoring tick updates every 5 minutes...
Tick notification channel: <CHANNEL_ID or NOT CONFIGURED>
Initial tick on startup: 2025-10-29T18:58:09Z
Starting tick monitoring...
```

**Every 5 Minutes (when checking):**
```
[2025-10-29T19:00:00.000Z] Checking for tick updates...
  Current tick from API: 2025-10-29T18:58:09Z
  Last known tick: 2025-10-29T18:58:09Z
  No new tick detected (tick unchanged)
```

**When a New Tick is Detected:**
```
[2025-10-29T19:05:00.000Z] Checking for tick updates...
  Current tick from API: 2025-10-30T18:58:15Z
  Last known tick: 2025-10-29T18:58:09Z
  🚨 NEW TICK DETECTED! 2025-10-30T18:58:15Z
  Sending notification to channel 1234567890...
  ✅ Notification sent successfully
```

## Testing the Bot

### 1. Check Bot Status
Make sure the bot is running and connected to Discord.

### 2. Verify Channel Configuration
Run `!tickchannel` in your desired notification channel (requires Admin permissions).

### 3. Test Manual Command
Run `!tick` to verify the bot can fetch and display tick data.

### 4. Monitor Logs
Watch the console/logs to see if the bot is checking every 5 minutes:
- Look for check messages every 5 minutes
- Verify it's fetching tick data successfully
- Check if it's comparing ticks correctly

## Elite Dangerous Tick Timing

Elite Dangerous galaxy ticks occur approximately **every 24 hours**, typically around the same time each day (around 19:00 UTC), but the exact timing can vary by several minutes.

This means:
- After setting up the bot, you may need to wait up to 24 hours to see a tick notification
- The bot checks every 5 minutes, so it will detect a tick within 5 minutes of it occurring

## Still Having Issues?

If the bot still isn't detecting ticks:

1. **Check the logs** - The detailed logging should show you exactly what's happening
2. **Verify the API** - Visit http://tick.infomancer.uk/galtick.json in your browser to confirm it's working
3. **Wait for a tick** - Make sure you're waiting long enough (ticks are ~24 hours apart)
4. **Restart the bot** - If you just set the channel, restart the bot to ensure settings are loaded
