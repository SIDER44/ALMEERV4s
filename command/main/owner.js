const fs = require('fs-extra');
const config = require('../../config');

module.exports = {
    name: 'owner',
    aliases: ['ownercmd'],
    description: 'Owner commands (broadcast, eval, etc)',
    usage: '.owner [cmd]',
    owner: true,
    
    async execute(sock, msg, args, { from, db }) {
        if (!args[0]) {
            const text = `👑 *Owner Commands*\n\n` +
                `➤ *broadcast* - Send message to all groups\n` +
                `➤ *eval* - Execute JavaScript code\n` +
                `➤ *shell* - Execute shell command\n` +
                `➤ *ban* [@user] - Ban user\n` +
                `➤ *unban* [@user] - Unban user\n` +
                `➤ *addprem* [@user] [days] - Add premium\n` +
                `➤ *delprem* [@user] - Remove premium\n` +
                `➤ *getdb* - Get database\n` +
                `➤ *setpp* - Set bot profile picture\n` +
                `➤ *restart* - Restart bot\n` +
                `➤ *shutdown* - Shutdown bot`;
            
            return await sock.sendMessage(from, { text }, { quoted: msg });
        }

        const cmd = args[0].toLowerCase();

        if (cmd === 'broadcast') {
            const message = args.slice(1).join(' ');
            if (!message) return await sock.sendMessage(from, { text: '❌ Provide a message!' });

            const groups = Object.keys(db.data.groups || {});
            let sent = 0;

            for (const group of groups) {
                try {
                    await sock.sendMessage(group, {
                        text: `📢 *BROADCAST*\n\n${message}\n\n- Owner`
                    });
                    sent++;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (e) {}
            }

            await sock.sendMessage(from, { text: `✅ Broadcast sent to ${sent} groups` });
        }

        else if (cmd === 'eval') {
            const code = args.slice(1).join(' ');
            if (!code) return;

            try {
                let result = eval(code);
                if (typeof result !== 'string') result = require('util').inspect(result);
                await sock.sendMessage(from, { text: `✅ *Result:*\n\n${result}` });
            } catch (error) {
                await sock.sendMessage(from, { text: `❌ *Error:*\n\n${error.message}` });
            }
        }

        else if (cmd === 'ban') {
            const user = msg.message.extendedTextMessage?.contextInfo?.participant || args[1];
            if (!user) return await sock.sendMessage(from, { text: '❌ Mention user!' });
            
            const reason = args.slice(2).join(' ') || 'No reason';
            db.banUser(user, reason);
            await sock.sendMessage(from, { text: `✅ @${user.split('@')[0]} has been banned!\nReason: ${reason}` });
        }

        else if (cmd === 'unban') {
            const user = msg.message.extendedTextMessage?.contextInfo?.participant || args[1];
            if (!user) return await sock.sendMessage(from, { text: '❌ Mention user!' });
            
            db.unbanUser(user);
            await sock.sendMessage(from, { text: `✅ @${user.split('@')[0]} has been unbanned!` });
        }
    }
};