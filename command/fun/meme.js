const axios = require('axios');

module.exports = {
    name: 'meme',
    aliases: ['memes'],
    description: 'Get random meme',
    usage: '.meme',
    cooldown: 5,
    
    async execute(sock, msg, args, { from }) {
        try {
            const response = await axios.get('https://meme-api.com/gimme');
            const meme = response.data;

            await sock.sendMessage(from, {
                image: { url: meme.url },
                caption: `*${meme.title}*\n\n👍 ${meme.ups} | 💬 r/${meme.subreddit}`
            }, { quoted: msg });

        } catch (error) {
            console.error('Meme error:', error);
            
            // Fallback memes
            const fallbacks = [
                'https://i.imgur.com/1.jpg',
                'https://i.imgur.com/2.jpg',
                'https://i.imgur.com/3.jpg'
            ];
            
            await sock.sendMessage(from, {
                image: { url: fallbacks[Math.floor(Math.random() * fallbacks.length)] },
                caption: 'Here\'s your meme!'
            }, { quoted: msg });
        }
    }
};