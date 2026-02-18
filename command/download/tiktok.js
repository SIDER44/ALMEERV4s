const axios = require('axios');

module.exports = {
    name: 'tiktok',
    aliases: ['tt', 'tik'],
    description: 'Download TikTok video',
    usage: '.tiktok (link)',
    cooldown: 10,
    
    async execute(sock, msg, args, { from }) {
        if (!args[0]) {
            return await sock.sendMessage(from, {
                text: '❌ Please provide a TikTok link!'
            }, { quoted: msg });
        }

        const url = args[0];
        
        try {
            await sock.sendMessage(from, { text: '📥 *Downloading...*' }, { quoted: msg });

            // Using free API
            const response = await axios.get(`https://api.tikmate.app/api/lookup?url=${encodeURIComponent(url)}`);
            
            if (response.data) {
                const videoUrl = `https://tikmate.app/download/${response.data.token}/${response.data.id}.mp4`;
                
                await sock.sendMessage(from, {
                    video: { url: videoUrl },
                    caption: `✅ *TikTok Video*\n\n👤 *Author:* ${response.data.author_name}\n🎵 *Music:* ${response.data.music}\n❤️ *Likes:* ${response.data.likes || 0}`
                }, { quoted: msg });
            } else {
                throw new Error('No data');
            }

        } catch (error) {
            console.error('TikTok error:', error);
            await sock.sendMessage(from, {
                text: '❌ Failed to download TikTok video. Make sure the link is valid.'
            }, { quoted: msg });
        }
    }
};