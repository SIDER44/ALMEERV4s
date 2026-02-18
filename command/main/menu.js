module.exports = {
    name: 'menu',
    aliases: ['help', 'commands', 'list'],
    description: 'Show all available commands',
    usage: '.menu [category]',
    cooldown: 3,
    
    async execute(sock, msg, args, { from, pushName, prefix, config }) {
        const handler = require('../../lib/handler');
        const categories = {};
        
        // Group commands by category
        handler.commands.forEach(cmd => {
            if (!categories[cmd.category]) {
                categories[cmd.category] = [];
            }
            categories[cmd.category].push(cmd.name);
        });

        let text = `╭━━━━━━━━━━━━━━╮\n`;
        text += `┃  *${config.botName}*  ┃\n`;
        text += `╰━━━━━━━━━━━━━━╯\n\n`;
        text += `👋 Hello *${pushName}*\n`;
        text += `📊 *Total Commands:* ${handler.commands.size}\n`;
        text += `📁 *Categories:* ${handler.categories.length}\n\n`;

        if (args[0]) {
            // Show specific category
            const category = args[0].toLowerCase();
            const cmds = categories[category];
            
            if (cmds) {
                text += `📂 *${category.toUpperCase()}* (${cmds.length})\n`;
                text += `─────────────────\n`;
                cmds.sort().forEach(cmd => {
                    const command = handler.getCommand(cmd);
                    text += `${prefix}${cmd} ${command.usage ? command.usage.replace('.', '') : ''}\n`;
                    text += `└ ${command.description || 'No description'}\n`;
                });
            } else {
                text += `❌ Category '${category}' not found!\n`;
            }
        } else {
            // Show all categories
            Object.keys(categories).sort().forEach(category => {
                text += `📁 *${category.toUpperCase()}* (${categories[category].length})\n`;
            });
            
            text += `\n📝 Use *${prefix}menu [category]* to see commands\n`;
            text += `⚡ Example: *${prefix}menu downloader*\n`;
        }

        text += `\n╭━━━━━━━━━━━━━━╮\n`;
        text += `┃  *STATUS*  ┃\n`;
        text += `╰━━━━━━━━━━━━━━╯\n`;
        text += `🔰 Mode: ${config.mode}\n`;
        text += `⏱️ Uptime: ${Math.floor(process.uptime() / 3600)}h\n`;
        text += `💾 RAM: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\n`;
        text += `\n_Powered by ALMEERV4_`;

        await sock.sendMessage(from, { text }, { quoted: msg });
    }
};
