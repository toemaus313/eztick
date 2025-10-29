# DigitalOcean Deployment Guide

This guide will help you deploy the Elite Dangerous Tick Bot to DigitalOcean using their App Platform or a Droplet.

## Option 1: DigitalOcean App Platform (Recommended)

The App Platform is the easiest way to deploy and automatically handles scaling, monitoring, and updates.

### Prerequisites
- A DigitalOcean account
- Git repository (GitHub, GitLab, or Bitbucket) containing your bot code

### Steps

1. **Push your code to a Git repository**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Create a new App on DigitalOcean**
   - Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Click "Create App"
   - Connect your GitHub/GitLab/Bitbucket account
   - Select your repository (`eztick`)
   - Choose the branch (e.g., `main`)

3. **Configure the App**
   - **Name**: `eztick-bot`
   - **Region**: Choose the closest to your users
   - **Plan**: Basic ($5/month recommended)
   - **Type**: Worker
   - **Build Command**: `npm install`
   - **Run Command**: `node bot.js`

4. **Set Environment Variables**
   In the App Platform settings, add:
   ```
   DISCORD_TOKEN=your_actual_bot_token_here
   TICK_CHANNEL_ID=your_channel_id_here
   ```

5. **Deploy**
   - Click "Next" and review settings
   - Click "Create Resources"
   - Wait for deployment to complete (~5 minutes)

6. **Monitor**
   - View logs in the App Platform dashboard
   - Check the Runtime Logs to see bot status

### Updating the Bot

Simply push changes to your Git repository:
```bash
git add .
git commit -m "Update bot"
git push origin main
```

The App Platform will automatically redeploy.

---

## Option 2: DigitalOcean Droplet (VPS)

For more control and potentially lower cost for long-running bots.

### Prerequisites
- A DigitalOcean account
- SSH client

### Steps

1. **Create a Droplet**
   - Go to [DigitalOcean Droplets](https://cloud.digitalocean.com/droplets)
   - Click "Create Droplet"
   - Choose Ubuntu 22.04 LTS
   - Select plan: Basic ($6/month recommended)
   - Choose a datacenter region
   - Add SSH key (or use password)
   - Click "Create Droplet"

2. **Connect to your Droplet**
   ```bash
   ssh root@your_droplet_ip
   ```

3. **Install Node.js**
   ```bash
   # Update system
   apt update && apt upgrade -y
   
   # Install Node.js 18.x
   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
   apt install -y nodejs
   
   # Verify installation
   node --version
   npm --version
   ```

4. **Install PM2 (Process Manager)**
   ```bash
   npm install -g pm2
   ```

5. **Create a user for the bot**
   ```bash
   adduser eztick
   usermod -aG sudo eztick
   su - eztick
   ```

6. **Upload your bot code**
   
   **Option A: Using Git**
   ```bash
   git clone https://github.com/yourusername/eztick.git
   cd eztick
   ```
   
   **Option B: Using SCP (from your local machine)**
   ```bash
   scp -r c:\Users\tanto\CascadeProjects\eztick eztick@your_droplet_ip:~/
   ```

7. **Set up environment variables**
   ```bash
   cd eztick
   nano .env
   ```
   
   Add your credentials:
   ```
   DISCORD_TOKEN=your_actual_bot_token_here
   TICK_CHANNEL_ID=your_channel_id_here
   ```
   
   Save with `Ctrl+X`, then `Y`, then `Enter`

8. **Install dependencies**
   ```bash
   npm install
   ```

9. **Start the bot with PM2**
   
   **Option A: Using ecosystem.config.js (Recommended)**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```
   
   **Option B: Direct command**
   ```bash
   pm2 start bot.js --name eztick
   pm2 save
   pm2 startup
   ```
   
   Copy and run the command that PM2 outputs to enable auto-start on boot.

10. **Verify the bot is running**
    ```bash
    pm2 status
    pm2 logs eztick
    ```

### Managing the Bot

**View logs:**
```bash
pm2 logs eztick
```

**Restart the bot:**
```bash
pm2 restart eztick
```

**Stop the bot:**
```bash
pm2 stop eztick
```

**Update the bot:**
```bash
cd ~/eztick
git pull origin main
npm install
pm2 restart eztick
```

---

## Option 3: DigitalOcean with Docker

For containerized deployment.

### Steps

1. **Create a Dockerfile**
   (Already included in the repo)

2. **Build and push to Docker Hub or DigitalOcean Container Registry**
   ```bash
   docker build -t eztick-bot .
   docker tag eztick-bot registry.digitalocean.com/your-registry/eztick-bot
   docker push registry.digitalocean.com/your-registry/eztick-bot
   ```

3. **Deploy to App Platform using the container**
   - Select "Docker Hub" or "DigitalOcean Container Registry"
   - Point to your image
   - Set environment variables
   - Deploy

---

## Cost Comparison

| Option | Monthly Cost | Pros | Cons |
|--------|-------------|------|------|
| **App Platform** | $5 | Easy setup, auto-scaling, managed | Less control |
| **Droplet** | $6 | Full control, can run multiple apps | Manual setup, maintenance |
| **Docker on App Platform** | $5 | Containerized, portable | Requires Docker knowledge |

---

## Monitoring & Maintenance

### App Platform
- View logs in the dashboard
- Set up alerts for failures
- Automatic restarts on crash

### Droplet with PM2
- `pm2 monit` for real-time monitoring
- `pm2 logs eztick --lines 100` to view logs
- PM2 automatically restarts on crash

---

## Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use environment variables** for all secrets
3. **Keep Node.js updated** - `npm update` regularly
4. **Enable firewall** on Droplet:
   ```bash
   ufw allow 22/tcp
   ufw enable
   ```
5. **Regular backups** - DigitalOcean provides snapshot feature

---

## Troubleshooting

### Bot doesn't start
```bash
# Check logs
pm2 logs eztick

# Verify environment variables
cat .env

# Test manually
node bot.js
```

### Bot disconnects frequently
- Check network stability
- Verify DigitalOcean status page
- Increase droplet resources if needed

### Out of memory
- Upgrade droplet plan
- Monitor with `pm2 monit`

---

## Support

For issues:
1. Check logs first: `pm2 logs eztick`
2. Verify Discord token is valid
3. Check DigitalOcean status page
4. Review bot code for errors

---

## Useful Links

- [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
- [DigitalOcean Droplets](https://cloud.digitalocean.com/droplets)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Discord.js Guide](https://discordjs.guide/)

---

**o7 Commander! Your bot is ready for 24/7 deployment! 🚀**
