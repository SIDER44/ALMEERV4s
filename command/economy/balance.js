module.exports = {
    name: 'balance',
    aliases: ['bal', 'money', 'wallet'],
    description: 'Check your balance',
    usage: '.balance [@user]',
    cooldown: 3,
    
    async execute(sock, msg, args, { from, sender, db }) {
        let target = sender;
        
        // Check if mentioning someone
        if (msg.message.extendedTextMessage?.contextInfo?.participant) {
            target = msg.message.extendedTextMessage.contextInfo.participant;
        } else if (args[0]?.includes('@')) {
            target = args[0].replace('@', '') + '@s.whatsapp.net';
        }

        const user = db.getUser(target);
        const eco = db.getEconomy(target);
        const name = target === sender ? 'Your' : '@' + target.split('@')[0] + "'s";

        const text = `💰 *${name} Balance*\n\n` +
            `💵 *Wallet:* $${eco.wallet.toLocaleString()}\n` +
            `🏦 *Bank:* $${eco.bank.toLocaleString()}\n` +
            `💰 *Total:* $${(eco.wallet + eco.bank).toLocaleString()}\n\n` +
            `📊 *Level:* ${user.level}\n` +
            `✨ *XP:* ${user.xp}`;

        await sock.sendMessage(from, {
            text,
            mentions: target !== sender ? [target] : []
        }, { quoted: msg });
    }
};
