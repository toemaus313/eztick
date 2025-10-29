import discord
from discord.ext import commands, tasks
import aiohttp
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Bot configuration
TOKEN = os.getenv('DISCORD_TOKEN')
TICK_CHANNEL_ID = int(os.getenv('TICK_CHANNEL_ID', '0'))
TICK_URL = 'http://tick.infomancer.uk/galtick.json'

# Bot setup
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix='!', intents=intents)

# Store the last known tick
last_known_tick = None


async def fetch_tick():
    """Fetch the latest tick from the API."""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(TICK_URL, timeout=10) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get('lastGalaxyTick')
                else:
                    print(f"Error fetching tick: HTTP {response.status}")
                    return None
    except Exception as e:
        print(f"Error fetching tick: {e}")
        return None


def format_tick(tick_timestamp):
    """Format the tick timestamp for display."""
    if not tick_timestamp:
        return "Unable to fetch tick data."
    
    try:
        # Parse ISO 8601 timestamp
        tick_dt = datetime.fromisoformat(tick_timestamp.replace('Z', '+00:00'))
        
        # Format for display (UTC)
        formatted_utc = tick_dt.strftime('%Y-%m-%d %H:%M:%S UTC')
        
        # Convert to local time
        local_dt = tick_dt.astimezone()
        formatted_local = local_dt.strftime('%Y-%m-%d %H:%M:%S %Z')
        
        # Calculate time ago
        now = datetime.now(tick_dt.tzinfo)
        time_diff = now - tick_dt
        hours = int(time_diff.total_seconds() // 3600)
        minutes = int((time_diff.total_seconds() % 3600) // 60)
        
        time_ago = f"{hours}h {minutes}m ago" if hours > 0 else f"{minutes}m ago"
        
        return f"**Last Galaxy Tick:** {formatted_utc}\n**Last Galaxy Tick LOCAL:** {formatted_local}\n**Time ago:** {time_ago}"
    except Exception as e:
        print(f"Error formatting tick: {e}")
        return f"**Last Galaxy Tick:** {tick_timestamp}"


@bot.event
async def on_ready():
    """Called when the bot is ready."""
    print(f'{bot.user} has connected to Discord!')
    print(f'Monitoring tick updates every 5 minutes...')
    print(f'Tick notification channel: {TICK_CHANNEL_ID if TICK_CHANNEL_ID != 0 else "NOT CONFIGURED"}')
    
    # Initialize last known tick
    global last_known_tick
    last_known_tick = await fetch_tick()
    print(f'Initial tick on startup: {last_known_tick}')
    
    # Start the background task
    if not check_tick_updates.is_running():
        print('Starting tick monitoring...')
        check_tick_updates.start()


@bot.command(name='tick', help='Display the last Elite Dangerous galaxy tick')
async def tick_command(ctx):
    """Command to display the current tick."""
    tick = await fetch_tick()
    
    if tick:
        embed = discord.Embed(
            title="🌌 Elite Dangerous Galaxy Tick",
            description=format_tick(tick),
            color=discord.Color.blue(),
            timestamp=datetime.now()
        )
        embed.set_footer(text="Data from tick.infomancer.uk")
        await ctx.send(embed=embed)
    else:
        await ctx.send("❌ Unable to fetch tick data. Please try again later.")


@tasks.loop(minutes=5)
async def check_tick_updates():
    """Background task to check for tick updates every 5 minutes."""
    global last_known_tick
    
    check_time = datetime.now().isoformat()
    current_tick = await fetch_tick()
    
    print(f"[{check_time}] Checking for tick updates...")
    print(f"  Current tick from API: {current_tick}")
    print(f"  Last known tick: {last_known_tick}")
    
    if not current_tick:
        print("  Failed to fetch current tick from API")
        return
    
    if current_tick != last_known_tick:
        print(f"  🚨 NEW TICK DETECTED! {current_tick}")
        
        # Update the stored tick
        last_known_tick = current_tick
        
        # Send notification to the configured channel
        if TICK_CHANNEL_ID != 0:
            channel = bot.get_channel(TICK_CHANNEL_ID)
            if channel:
                print(f"  Sending notification to channel {TICK_CHANNEL_ID}...")
                embed = discord.Embed(
                    title="🚨 NEW GALAXY TICK DETECTED!",
                    description=format_tick(current_tick),
                    color=discord.Color.green(),
                    timestamp=datetime.now()
                )
                embed.set_footer(text="Data from tick.infomancer.uk")
                await channel.send("@here", embed=embed)
                print("  ✅ Notification sent successfully")
            else:
                print(f"  ⚠️ Warning: Could not find channel with ID {TICK_CHANNEL_ID}")
        else:
            print("  ⚠️ Warning: TICK_CHANNEL_ID not configured - no notification sent")
    else:
        print("  No new tick detected (tick unchanged)")


@check_tick_updates.before_loop
async def before_check_tick_updates():
    """Wait until the bot is ready before starting the loop."""
    await bot.wait_until_ready()


@bot.command(name='tickchannel', help='Set the channel for tick notifications (Admin only)')
@commands.has_permissions(administrator=True)
async def set_tick_channel(ctx):
    """Command to set the current channel as the tick notification channel."""
    global TICK_CHANNEL_ID
    TICK_CHANNEL_ID = ctx.channel.id
    await ctx.send(f"✅ This channel will now receive tick notifications!\nChannel ID: {TICK_CHANNEL_ID}")
    print(f"Tick channel set to: {ctx.channel.name} (ID: {TICK_CHANNEL_ID})")


@bot.command(name='nexttick', help='Estimate when the next tick might occur')
async def next_tick(ctx):
    """Command to estimate the next tick time."""
    tick = await fetch_tick()
    
    if tick:
        try:
            tick_dt = datetime.fromisoformat(tick.replace('Z', '+00:00'))
            
            # Elite Dangerous ticks are approximately every 24 hours
            # but can vary, so this is just an estimate
            from datetime import timedelta
            estimated_next = tick_dt + timedelta(hours=24)
            now = datetime.now(tick_dt.tzinfo)
            time_until = estimated_next - now
            
            hours_until = int(time_until.total_seconds() // 3600)
            minutes_until = int((time_until.total_seconds() % 3600) // 60)
            
            embed = discord.Embed(
                title="⏰ Next Tick Estimate",
                description=f"**Last Tick:** {tick_dt.strftime('%Y-%m-%d %H:%M:%S UTC')}\n"
                           f"**Estimated Next Tick:** {estimated_next.strftime('%Y-%m-%d %H:%M:%S UTC')}\n"
                           f"**Time Until:** ~{hours_until}h {minutes_until}m\n\n"
                           f"*Note: This is an estimate. Actual tick time may vary.*",
                color=discord.Color.orange(),
                timestamp=datetime.now()
            )
            await ctx.send(embed=embed)
        except Exception as e:
            await ctx.send(f"❌ Error calculating next tick: {e}")
    else:
        await ctx.send("❌ Unable to fetch tick data.")


# Run the bot
if __name__ == '__main__':
    if not TOKEN:
        print("Error: DISCORD_TOKEN not found in environment variables!")
        print("Please create a .env file with your Discord bot token.")
    else:
        bot.run(TOKEN)
