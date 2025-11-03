const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
require('dotenv').config();

// Bot configuration
const TOKEN = process.env.DISCORD_TOKEN;
let TICK_CHANNEL_ID = process.env.TICK_CHANNEL_ID ? parseInt(process.env.TICK_CHANNEL_ID) : 0;
const TICK_URL = 'http://tick.infomancer.uk/galtick.json';
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Store the last known tick
let lastKnownTick = null;

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

/**
 * Fetch the latest tick from the API
 * @returns {Promise<string|null>} The last galaxy tick timestamp or null on error
 */
async function fetchTick() {
    try {
        const response = await fetch(TICK_URL, { timeout: 10000 });
        if (response.ok) {
            const data = await response.json();
            return data.lastGalaxyTick;
        } else {
            console.error(`Error fetching tick: HTTP ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching tick: ${error.message}`);
        return null;
    }
}

/**
 * Format the tick timestamp for display
 * @param {string} tickTimestamp - ISO 8601 timestamp
 * @returns {string} Formatted tick information
 */
function formatTick(tickTimestamp) {
    if (!tickTimestamp) {
        return "Unable to fetch tick data.";
    }

    try {
        const tickDate = new Date(tickTimestamp);
        const unixTimestamp = Math.floor(tickDate.getTime() / 1000);
        
        // Format for UTC display (24hr format)
        const formattedUTC = tickDate.toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC');
        
        // Use Discord's timestamp formatting for automatic timezone conversion
        // Format: <t:UNIX_TIMESTAMP:FORMAT>
        // F = Long Date/Time format (e.g., "Tuesday, October 29, 2025 6:58:09 PM")
        // Discord will automatically convert to each user's local timezone
        const discordTimestamp = `<t:${unixTimestamp}:F>`;
        
        // Relative time using Discord's format (e.g., "2 hours ago")
        const relativeTime = `<t:${unixTimestamp}:R>`;
        
        return `**Last Galaxy Tick (UTC):** ${formattedUTC}\n**Last Galaxy Tick (Your Time):** ${discordTimestamp}\n**Time ago:** ${relativeTime}`;
    } catch (error) {
        console.error(`Error formatting tick: ${error.message}`);
        return `**Last Galaxy Tick:** ${tickTimestamp}`;
    }
}

/**
 * Check for tick updates (runs periodically)
 */
async function checkTickUpdates() {
    const currentTick = await fetchTick();
    const checkTime = new Date().toISOString();
    
    console.log(`[${checkTime}] Checking for tick updates...`);
    console.log(`  Current tick from API: ${currentTick}`);
    console.log(`  Last known tick: ${lastKnownTick}`);
    
    if (!currentTick) {
        console.error('  Failed to fetch current tick from API');
        return;
    }
    
    if (currentTick !== lastKnownTick) {
        console.log(`  🚨 NEW TICK DETECTED! ${currentTick}`);
        
        // Update the stored tick
        lastKnownTick = currentTick;
        
        // Send notification to the configured channel
        if (TICK_CHANNEL_ID !== 0) {
            const channel = client.channels.cache.get(TICK_CHANNEL_ID.toString());
            if (channel) {
                console.log(`  Sending notification to channel ${TICK_CHANNEL_ID}...`);
                const embed = new EmbedBuilder()
                    .setTitle('🚨 NEW GALAXY TICK DETECTED!')
                    .setDescription(formatTick(currentTick))
                    .setColor(0x00FF00)
                    .setTimestamp()
                    .setFooter({ text: 'Data from tick.infomancer.uk' });
                
                await channel.send({ content: '@here', embeds: [embed] });
                console.log('  ✅ Notification sent successfully');
            } else {
                console.warn(`  ⚠️ Warning: Could not find channel with ID ${TICK_CHANNEL_ID}`);
            }
        } else {
            console.warn('  ⚠️ Warning: TICK_CHANNEL_ID not configured - no notification sent');
        }
    } else {
        console.log('  No new tick detected (tick unchanged)');
    }
}

// Bot event handlers
client.on('ready', async () => {
    console.log(`${client.user.tag} has connected to Discord!`);
    console.log('Monitoring tick updates every 5 minutes...');
    console.log(`Tick notification channel: ${TICK_CHANNEL_ID !== 0 ? TICK_CHANNEL_ID : 'NOT CONFIGURED'}`);
    
    // Initialize last known tick
    lastKnownTick = await fetchTick();
    console.log(`Initial tick on startup: ${lastKnownTick}`);
    
    // Start periodic check immediately, then every 5 minutes
    console.log('Starting tick monitoring...');
    checkTickUpdates(); // Run first check immediately
    setInterval(checkTickUpdates, CHECK_INTERVAL);
});

client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;
    
    // Check for commands
    if (message.content.startsWith('!tick')) {
        await handleTickCommand(message);
    } else if (message.content.startsWith('!nexttick')) {
        await handleNextTickCommand(message);
    } else if (message.content.startsWith('!tickchannel')) {
        await handleSetTickChannel(message);
    }
});

/**
 * Handle !tick command
 */
async function handleTickCommand(message) {
    const tick = await fetchTick();
    
    if (tick) {
        const embed = new EmbedBuilder()
            .setTitle('🌌 Elite Dangerous Galaxy Tick')
            .setDescription(formatTick(tick))
            .setColor(0x0099FF)
            .setTimestamp()
            .setFooter({ text: 'Data from tick.infomancer.uk' });
        
        await message.reply({ embeds: [embed] });
    } else {
        await message.reply('❌ Unable to fetch tick data. Please try again later.');
    }
}

/**
 * Handle !nexttick command
 */
async function handleNextTickCommand(message) {
    const tick = await fetchTick();
    
    if (tick) {
        try {
            const tickDate = new Date(tick);
            const lastUnix = Math.floor(tickDate.getTime() / 1000);
            
            // Elite Dangerous ticks are approximately every 24 hours
            const estimatedNext = new Date(tickDate.getTime() + (24 * 60 * 60 * 1000));
            const nextUnix = Math.floor(estimatedNext.getTime() / 1000);
            
            // Format UTC times
            const lastTickUTC = tickDate.toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC');
            const nextTickUTC = estimatedNext.toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC');
            
            // Use Discord timestamps for user's local time
            const lastTickLocal = `<t:${lastUnix}:F>`;
            const nextTickLocal = `<t:${nextUnix}:F>`;
            const timeUntil = `<t:${nextUnix}:R>`;
            
            const embed = new EmbedBuilder()
                .setTitle('⏰ Next Tick Estimate')
                .setDescription(
                    `**Last Tick (UTC):** ${lastTickUTC}\n` +
                    `**Last Tick (Your Time):** ${lastTickLocal}\n\n` +
                    `**Estimated Next Tick (UTC):** ${nextTickUTC}\n` +
                    `**Estimated Next Tick (Your Time):** ${nextTickLocal}\n` +
                    `**Time Until:** ${timeUntil}\n\n` +
                    `*Note: This is an estimate. Actual tick time may vary.*`
                )
                .setColor(0xFFA500)
                .setTimestamp();
            
            await message.reply({ embeds: [embed] });
        } catch (error) {
            await message.reply(`❌ Error calculating next tick: ${error.message}`);
        }
    } else {
        await message.reply('❌ Unable to fetch tick data.');
    }
}

/**
 * Handle !tickchannel command (Admin only)
 */
async function handleSetTickChannel(message) {
    // Check if user has administrator permission
    if (!message.member.permissions.has('Administrator')) {
        await message.reply('❌ You need Administrator permission to use this command.');
        return;
    }
    
    TICK_CHANNEL_ID = message.channel.id;
    await message.reply(
        `✅ This channel will now receive tick notifications!\nChannel ID: ${TICK_CHANNEL_ID}\n\n` +
        `*Note: To persist this across restarts, add TICK_CHANNEL_ID=${TICK_CHANNEL_ID} to your .env file*`
    );
    console.log(`Tick channel set to: ${message.channel.name} (ID: ${TICK_CHANNEL_ID})`);
}

/**
 * Handle !tickstatus command - Show current tick monitoring status
 */
async function handleTickStatus(message) {
    const statusEmbed = new EmbedBuilder()
        .setTitle('📊 Tick Monitoring Status')
        .addFields(
            { name: '📍 Notification Channel', value: TICK_CHANNEL_ID ? `<#${TICK_CHANNEL_ID}> (ID: ${TICK_CHANNEL_ID})` : '❌ Not configured', inline: false },
            { name: '⏰ Check Interval', value: 'Every 5 minutes', inline: true },
            { name: '🔍 Last Known Tick', value: lastKnownTick ? formatTick(lastKnownTick) : '❌ Not fetched yet', inline: false },
            { name: '📡 API Status', value: 'Checking...', inline: true }
        )
        .setColor(TICK_CHANNEL_ID ? 0x00FF00 : 0xFFA500)
        .setTimestamp()
        .setFooter({ text: 'Use !tickchannel in any channel to set/update notification channel' });
    
    // Test API connectivity
    try {
        const currentTick = await fetchTick();
        if (currentTick) {
            statusEmbed.spliceFields(3, 1, { name: '📡 API Status', value: '✅ Online', inline: true });
            if (currentTick !== lastKnownTick) {
                statusEmbed.addFields({ name: '⚠️ New Tick Available', value: `A new tick is available but not yet detected. Current: ${currentTick}`, inline: false });
            }
        } else {
            statusEmbed.spliceFields(3, 1, { name: '📡 API Status', value: '❌ Error fetching data', inline: true });
        }
    } catch (error) {
        statusEmbed.spliceFields(3, 1, { name: '📡 API Status', value: `❌ Error: ${error.message}`, inline: true });
    }
    
    await message.reply({ embeds: [statusEmbed] });
}

// Handle errors
client.on('error', (error) => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

// Login to Discord
if (!TOKEN) {
    console.error('Error: DISCORD_TOKEN not found in environment variables!');
    console.error('Please create a .env file with your Discord bot token.');
    process.exit(1);
} else {
    client.login(TOKEN);
}
