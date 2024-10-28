# Turn on the WireGuard VPN
sudo wg-quick up prawko-NL

# Allow unprivileged user namespaces for Puppeteer
echo 0 | sudo tee /proc/sys/kernel/apparmor_restrict_unprivileged_userns

# Check IP address
curl https://api.ipify.org?format=json

# Sleep for 5 seconds
sleep 5

# Start the Node.js application
pm2 start --name prawko "ts-node index.ts"
pm2 logs prawko