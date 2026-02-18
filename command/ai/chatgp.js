const axios = require('axios');

module.exports = {
    name: 'ai',
    aliases: ['chatgpt', 'gpt'],
    description: 'Chat with AI',
    usage: '.ai (message)',
    cooldown: 10,
    
    async execute(sock, msg, args, { from }) {
        if (!args[0]) {
            return await sock.sendMessage(from, {
                text: '❌ Please provide a message!'
            }, { quoted: msg });
        }

        const prompt = args.join(' ');

        try {
            await sock.sendMessage(from, { text: '💭 *Thinking...*' }, { quoted: msg });

            // Using free API (no key needed)
            const response = await axios.post('https://api.affiliateplus.xyz/api/chatbot', {
                message: prompt,
                botname: 'ALMEERV4',
                ownername: 'ALMEER'
            });

            let reply = response.data.message || 'I cannot answer that right now.';
            
            reply = `🤖 *AI Response*\n\n${reply}\n\n_Powered by ALMEERV4_`;

            await sock.sendMessage(from, { text: reply }, { quoted: msg });

        } catch (error) {
            console.error('AI error:', error);
            
            // Fallback responses
            const fallbacks = [
                "I'm here to help! What would you like to know?",
                "Interesting question! Can you tell me more?",
                "Let me think about that...",
                "That's a good question!"
            ];
            
            await sock.sendMessage(from, {
                text: `🤖 *AI Response*\n\n${fallbacks[Math.floor(Math.random() * fallbacks.length)]}\n\n_Powered by ALMEERV4_`
            }, { quoted: msg });
        }
    }
};
