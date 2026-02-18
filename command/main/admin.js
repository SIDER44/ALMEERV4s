module.exports = {
    name: 'admin',
    aliases: ['admincmd'],
    description: 'Group admin commands',
    usage: '.admin [cmd]',
    admin: true,
    group: true,
    
    async execute(sock, msg, args, { from, sender, db }) {
        if (!args[0]) {
            const text = `👥 *Admin Commands*\n\n` +
                `➤ *kick* @user - Remove member\n` +
                `➤ *add* @user - Add member\n` +
                `➤ *promote* @user - Make admin\n` +
                `➤ *demote* @user - Remove admin\n` +
                `➤ *mute* - Mute group\n` +
                `➤ *unmute* - Unmute group\n` +
                `➤ *tagall* - Tag all members\n` +
                `➤ *hidetag* - Hidden tag all\n` +
                `➤ *setdesc* - Set description\n` +
                `➤ *setname* - Set group name\n` +
                `➤ *setpp* - Set group icon\n` +
                `➤ *link* - Get group link\n` +
                `➤ *revoke* - Revoke group link\n` +
                `➤ *antilink* on/off - Anti link\n` +
                `➤ *welcome* on/off - Welcome message\n` +
                `➤ *goodbye* on/off - Goodbye message`;
            
            return await sock.sendMessage(from, { text }, { quoted: msg });
        }

        const cmd = args[0].toLowerCase();

        if (cmd === 'tagall' || cmd === 'hidetag') {
            const group = await sock.groupMetadata(from);
            const members = group.participants.map(p => p.id);
            const message = args.slice(1).join(' ') || '📢 @all';
            
            await sock.sendMessage(from, {
                text: message,
                mentions: cmd === 'tagall' ? members : undefined
            }, { quoted: msg });
        }

        else if (cmd === 'kick') {
            const user = msg.message.extendedTextMessage?.contextInfo?.participant || args[1];
            if (!user) return;
            
            await sock.groupParticipantsUpdate(from, [user], 'remove');
        }

        else if (cmd === 'promote') {
            const user = msg.message.extendedTextMessage?.contextInfo?.participant || args[1];
            if (!user) return;
            
            await sock.groupParticipantsUpdate(from, [user], 'promote');
            await sock.sendMessage(from, { text: `✅ @${user.split('@')[0]} is now admin!` });
        }

        else if (cmd === 'demote') {
            const user = msg.message.extendedTextMessage?.contextInfo?.participant || args[1];
            if (!user) return;
            
            await sock.groupParticipantsUpdate(from, [user], 'demote');
            await sock.sendMessage(from, { text: `✅ @${user.split('@')[0]} is no longer admin!` });
        }

        else if (cmd === 'antilink') {
            const option = args[1];
            if (option === 'on' || option === 'off') {
                const group = db.getGroup(from);
                group.antiLink = option === 'on';
                db.updateGroup(from, group);
                await sock.sendMessage(from, { text: `✅ Anti-link ${option === 'on' ? 'enabled' : 'disabled'}!` });
            }
        }
    }
};