module.exports = {
    name: 'daily',
    aliases: ['claim'],
    description: 'Claim daily reward',
    usage: '.daily',
    cooldown: 86400, // 24 hours
    
    async execute(sock, msg, args, { from, sender, db }) {
        const eco = db.getEconomy(sender);
        const now = Date.now();
        
        // Check if already claimed today
        if (eco.lastDaily && now - eco.lastDaily < 86400000) {
            const timeLeft = 86400000 - (now - eco.lastDaily);
            const hours = Math.floor(timeLeft / 3600000);
            const minutes = Math.floor((timeLeft % 3600000) / 60000);
            
            return await sock.sendMessage(from, {
                text: `⏳ You can claim daily in ${hours}h ${minutes}m!`
            }, { quoted: msg });
        }

        // Calculate reward (increases with level)
        const user = db.getUser(sender);
        const baseReward = 500;
        const levelBonus = user.level * 50;
        const totalReward = baseReward + levelBonus;

        // Update economy
        eco.wallet += totalReward;
        eco.lastDaily = now;
        db.updateEconomy(sender, eco);

        await sock.sendMessage(from, {
            text: `✅ *Daily Reward Claimed!*\n\n` +
                `💰 Amount: $${totalReward.toLocaleString()}\n` +
                `📊 Base: $${baseReward}\n` +
                `⭐ Level Bonus: $${levelBonus}\n\n` +
                `💵 New Balance: $${eco.wallet.toLocaleString()}`
        }, { quoted: msg });
    }
};
