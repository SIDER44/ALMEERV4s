module.exports = {
    name: 'adventure',
    aliases: ['adv', 'explore'],
    description: 'Go on an adventure',
    usage: '.adventure',
    cooldown: 300, // 5 minutes
    
    async execute(sock, msg, args, { from, sender, db }) {
        const rpg = db.getRPG(sender);
        
        // Adventure locations and outcomes
        const adventures = [
            {
                name: 'Dark Forest',
                success: 'You found a treasure chest! +100 gold',
                fail: 'You got lost and found nothing',
                gold: 100,
                exp: 50
            },
            {
                name: 'Mysterious Cave',
                success: 'You discovered ancient artifacts! +150 gold',
                fail: 'Bats attacked you! -20 health',
                gold: 150,
                exp: 70,
                damage: 20
            },
            {
                name: 'Enchanted Lake',
                success: 'You found magical pearls! +200 gold',
                fail: 'You fell in the water and lost some gold -50',
                gold: 200,
                exp: 100,
                goldLoss: 50
            }
        ];

        const adventure = adventures[Math.floor(Math.random() * adventures.length)];
        const success = Math.random() > 0.3; // 70% success rate

        let result = `🗺️ *Adventure: ${adventure.name}*\n\n`;

        if (success) {
            rpg.gold += adventure.gold;
            rpg.exp += adventure.exp;
            
            result += `✅ *Success!*\n`;
            result += `💰 +${adventure.gold} gold\n`;
            result += `✨ +${adventure.exp} XP\n`;
        } else {
            if (adventure.damage) {
                rpg.health = Math.max(0, rpg.health - adventure.damage);
                result += `❌ *Failed!*\n`;
                result += `💔 -${adventure.damage} health\n`;
            }
            if (adventure.goldLoss) {
                rpg.gold = Math.max(0, rpg.gold - adventure.goldLoss);
                result += `❌ *Failed!*\n`;
                result += `💰 -${adventure.goldLoss} gold\n`;
            }
        }

        // Level up check
        const oldLevel = rpg.level;
        const newLevel = 1 + Math.floor(rpg.exp / 1000);
        if (newLevel > oldLevel) {
            rpg.level = newLevel;
            rpg.maxHealth = 100 + (newLevel * 10);
            rpg.health = rpg.maxHealth;
            result += `\n⭐ *LEVEL UP!* Now level ${newLevel}\n`;
            result += `❤️ Health restored!\n`;
        }

        db.updateRPG(sender, rpg);

        result += `\n❤️ Health: ${rpg.health}/${rpg.maxHealth}\n`;
        result += `💰 Gold: ${rpg.gold}\n`;
        result += `✨ XP: ${rpg.exp}`;

        await sock.sendMessage(from, { text: result }, { quoted: msg });
    }
};
