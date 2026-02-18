const googleIt = require('google-it');

module.exports = {
    name: 'google',
    aliases: ['search', 'gg'],
    description: 'Search on Google',
    usage: '.google (query)',
    cooldown: 8,
    
    async execute(sock, msg, args, { from }) {
        if (!args[0]) {
            return await sock.sendMessage(from, {
                text: '❌ Please provide a search query!'
            }, { quoted: msg });
        }

        const query = args.join(' ');

        try {
            await sock.sendMessage(from, { text: '🔍 *Searching...*' }, { quoted: msg });

            const results = await googleIt({ query });
            
            let text = `🔍 *Google Search: ${query}*\n\n`;
            
            results.slice(0, 5).forEach((result, index) => {
                text += `${index + 1}. *${result.title}*\n`;
                text += `📝 ${result.snippet}\n`;
                text += `🔗 ${result.link}\n\n`;
            });

            await sock.sendMessage(from, { text }, { quoted: msg });

        } catch (error) {
            console.error('Google error:', error);
            await sock.sendMessage(from, {
                text: '❌ Failed to search Google.'
            }, { quoted: msg });
        }
    }
};
