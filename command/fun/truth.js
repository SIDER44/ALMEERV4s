module.exports = {
    name: 'truth',
    aliases: ['truthquestion'],
    description: 'Get random truth question',
    usage: '.truth',
    cooldown: 5,
    
    async execute(sock, msg, args, { from }) {
        const truths = [
            "What's the most embarrassing thing you've done?",
            "Have you ever lied to your best friend?",
            "What's your biggest fear in relationships?",
            "Who was your first crush?",
            "What's the most trouble you've ever gotten into?",
            "Have you ever stolen something?",
            "What's your guilty pleasure?",
            "Have you ever pretended to like a gift?",
            "What's the weirdest dream you've had?",
            "Have you ever cheated on a test?",
            "What's the most childish thing you still do?",
            "Have you ever lied about your age?",
            "What's the worst date you've been on?",
            "Have you ever broken something and blamed someone else?",
            "What's the most embarrassing purchase you've made?"
        ];

        const truth = truths[Math.floor(Math.random() * truths.length)];
        
        await sock.sendMessage(from, {
            text: `🎯 *Truth Question*\n\n${truth}`
        }, { quoted: msg });
    }
};