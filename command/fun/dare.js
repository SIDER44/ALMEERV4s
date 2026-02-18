module.exports = {
    name: 'dare',
    aliases: ['darechallenge'],
    description: 'Get random dare',
    usage: '.dare',
    cooldown: 5,
    
    async execute(sock, msg, args, { from }) {
        const dares = [
            "Send a random emoji to your last chat",
            "Say something embarrassing in this group",
            "Send your most recent photo",
            "Tell everyone your phone password",
            "Do 10 pushups right now",
            "Sing a song and send voice note",
            "Change your display name to 'I'm crazy' for 1 hour",
            "Send 'I love admin' in group",
            "Call your mom and say 'I love you'",
            "Post an embarrassing story about yourself",
            "Rate everyone in the group from 1-10",
            "Send a selfie with a funny face",
            "Tell everyone your crush name",
            "Dance for 30 seconds and send video",
            "Write a love poem and send it"
        ];

        const dare = dares[Math.floor(Math.random() * dares.length)];
        
        await sock.sendMessage(from, {
            text: `🔥 *Dare Challenge*\n\n${dare}`
        }, { quoted: msg });
    }
};