const os = require('os');

module.exports = {
    name: 'ping',
    aliases: ['pong', 'speed'],
    description: 'Check bot response time',
    usage: '.ping',
    cooldown: 3,
    
    async execute(sock, msg, args, { from }) {
        const start = Date.now();
        
        await sock.sendMessage(from, { text: '📡 *Pinging...*' }, { quoted: msg });
        
        const end = Date.now();
        const response = end - start;
        
        const text = `📊 *Bot Status*\n\n` +
            `📡 *Response:* ${response}ms\n` +
            `💾 *Memory:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\n` +
            `⏱️ *Uptime:* ${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m\n` +
            `⚡ *Platform:* ${os.platform()}\n` +
            `🖥️ *CPU:* ${os.cpus()[0].model}`;

        await sock.sendMessage(from, { text }, { quoted: msg });
    }
};